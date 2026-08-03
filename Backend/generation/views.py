"""
API views for content generation.
"""

import asyncio
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings

from core.models import Story
from providers.registry import (
    get_vision_provider,
    get_tts_provider,
    list_vision_providers,
    list_tts_providers,
    analyze_image_with_fallback,
    validate_image_with_fallback,
)
from .serializers import (
    GenerateStoryRequestSerializer,
    GenerateStoryResponseSerializer,
    GenerateAudioRequestSerializer,
    GenerateFullRequestSerializer,
    GenerateFullResponseSerializer,
    ProviderListSerializer,
)
from .services import MediaService


def run_async(coro):
    """Helper to run async code in sync context.

    asyncio.run creates and closes a fresh event loop per call, avoiding the
    event-loop leak that came from repeatedly reusing an unclosed loop.
    """
    return asyncio.run(coro)


class GenerateStoryView(APIView):
    """
    POST: Analyze an image and generate a story.
    """
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        serializer = GenerateStoryRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get image data
        image_file = serializer.validated_data['image']
        image_bytes = image_file.read()
        context = serializer.validated_data.get('context')
        provider_name = serializer.validated_data.get('vision_provider')
        
        try:
            # Analyze image with automatic fallback
            story_data = run_async(analyze_image_with_fallback(image_bytes, context, provider_name))
            
            response_data = {
                'title': story_data.title,
                'content': story_data.content,
                'year': story_data.year,
                'region': story_data.region,
            }
            
            return Response(
                GenerateStoryResponseSerializer(response_data).data,
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateAudioView(APIView):
    """
    POST: Generate audio from text using TTS.
    """
    
    def post(self, request):
        serializer = GenerateAudioRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        text = serializer.validated_data['text']
        voice = serializer.validated_data.get('voice')
        provider_name = serializer.validated_data.get('tts_provider')
        
        try:
            # Get TTS provider and generate audio
            provider = get_tts_provider(provider_name)
            audio_data = run_async(provider.generate_audio(text, voice))
            
            # Return audio as binary response
            from django.http import HttpResponse
            response = HttpResponse(
                audio_data.audio_bytes,
                content_type='audio/wav'
            )
            response['Content-Disposition'] = 'attachment; filename="narration.wav"'
            return response
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateFullView(APIView):
    """
    POST: Full pipeline - analyze image, generate story, create audio, save to database.
    """
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        serializer = GenerateFullRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract data
        image_file = serializer.validated_data['image']
        image_bytes = image_file.read()
        context = serializer.validated_data.get('context')
        voice = serializer.validated_data.get('voice')
        vision_provider_name = serializer.validated_data.get('vision_provider')
        tts_provider_name = serializer.validated_data.get('tts_provider')
        user_consented = serializer.validated_data.get('user_consented', False)
        is_public = serializer.validated_data.get('is_public', False)
        force_generate = serializer.validated_data.get('force_generate', False)
        
        try:
            print("Starting full generation pipeline...")

            # Privacy gate: first require explicit consent before doing any paid work
            if not user_consented:
                return Response(
                    {'error': 'User consent is required to save this story.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Step 0: Validate if image is historic (unless forced)
            # Uses automatic fallback if primary provider hits rate limit
            requires_approval = False
            try:
                print(f"Step 0: Validating image is historic using {vision_provider_name or 'default'} provider...")
                validation_result = run_async(
                    validate_image_with_fallback(image_bytes, context, vision_provider_name)
                )
                
                print(f"✓ Validation complete: {validation_result}")
                
                # If not historic and not forced, return validation warning
                # Only check is_historic flag - confidence interpretation varies across AI models
                if not validation_result['is_historic']:
                    if not force_generate:
                        print(f"✗ Image rejected: Not historic (reason: {validation_result.get('reason', 'unknown')})")
                        return Response(
                            {
                                'error': 'Image does not appear to be a historical photograph',
                                'error_type': 'validation_warning',
                                'validation_details': validation_result
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        # User forced generation, mark for moderator approval
                        print("⚠ User forced generation of non-historic photo - requires approval")
                        requires_approval = True
                else:
                    # Image passed validation
                    print(f"✓ Image validated as historic (era: {validation_result.get('era', 'unknown')})")
                    requires_approval = False
            except Exception as validation_error:
                # If validation fails even with fallback, log and require approval
                print(f"✗ Validation failed (including fallback): {validation_error}")
                requires_approval = True  # Require approval since we couldn't validate
            
            # Step 1: Analyze image and generate story (with automatic fallback)
            print("Step 1: Analyzing image and generating story...")
            story_data = run_async(analyze_image_with_fallback(image_bytes, context, vision_provider_name))
            print(f"✓ Story generated: '{story_data.title}'")
            
            # Step 2: Generate audio narration
            print("Step 2: Generating audio narration...")
            tts_provider = get_tts_provider(tts_provider_name)
            audio_data = run_async(tts_provider.generate_audio(story_data.content, voice))
            print("✓ Audio narration generated")
            
            # Step 3: Upload media files
            print("Step 3: Uploading media files to storage...")
            image_url = MediaService.upload_image(image_bytes)
            audio_url = MediaService.upload_audio(audio_data.audio_bytes)
            print(f"✓ Media uploaded - Image: {image_url[:60]}..., Audio: {audio_url[:60]}...")
            
            # Step 4: Save story to database (only if consented)
            print(f"Step 4: Saving story to database (requires_approval={requires_approval})...")
            story = Story.objects.create(
                title=story_data.title,
                content=story_data.content,
                year=story_data.year,
                region=story_data.region,
                image_url=image_url,
                audio_url=audio_url,
                user_consented=user_consented,
                is_public=is_public,
                requires_approval=requires_approval,
                user_id='anonymous',
            )
            print(f"✓ Story saved to database (ID: {story.id})")
            
            # Convert S3 API URLs to public URLs
            public_image_url = image_url.replace('/storage/v1/s3/', '/storage/v1/object/public/')
            public_audio_url = audio_url.replace('/storage/v1/s3/', '/storage/v1/object/public/')
            
            response_data = {
                'story_id': story.id,
                'story': {
                    'title': story.title,
                    'content': story.content,
                    'year': story.year,
                    'region': story.region,
                },
                'image_url': public_image_url,
                'audio_url': public_audio_url,
                'requires_approval': requires_approval,
            }
            
            print("=" * 60)
            print(f"✓ PIPELINE COMPLETE - Story '{story.title}' successfully created!")
            print(f"  Requires approval: {requires_approval}")
            print("=" * 60)
            
            return Response(
                GenerateFullResponseSerializer(response_data).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            print("=" * 60)
            print(f"✗ PIPELINE FAILED: {e}")
            print("=" * 60)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProviderListView(APIView):
    """
    GET: List available AI providers.
    """
    
    def get(self, request):
        data = {
            'vision_providers': list_vision_providers(),
            'tts_providers': list_tts_providers(),
            'current_vision': settings.VISION_PROVIDER,
            'current_tts': settings.TTS_PROVIDER,
        }
        return Response(ProviderListSerializer(data).data)
