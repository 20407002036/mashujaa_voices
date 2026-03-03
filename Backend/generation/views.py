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
    """Helper to run async code in sync context."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


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
            # Get vision provider and analyze image
            provider = get_vision_provider(provider_name)
            story_data = run_async(provider.analyze_image(image_bytes, context))
            
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
        
        try:
            print("Starting full generation pipeline...")
            # Step 1: Analyze image and generate story
            vision_provider = get_vision_provider(vision_provider_name)
            story_data = run_async(vision_provider.analyze_image(image_bytes, context))
            print(f"Generated story: {story_data.title}")
            
            # Step 2: Generate audio narration
            tts_provider = get_tts_provider(tts_provider_name)
            audio_data = run_async(tts_provider.generate_audio(story_data.content, voice))
            print("Generated audio narration.")
            
            # Step 3: Upload media files
            image_url = MediaService.upload_image(image_bytes)
            audio_url = MediaService.upload_audio(audio_data.audio_bytes)
            print(f"Uploaded media. Image URL: {image_url}, Audio URL: {audio_url}")
            
            # Step 4: Save story to database (only if consented)
            story = Story.objects.create(
                title=story_data.title,
                content=story_data.content,
                year=story_data.year,
                region=story_data.region,
                image_url=image_url,
                audio_url=audio_url,
                user_consented=user_consented,
                is_public=is_public,
                user_id='anonymous',
            )
            
            # Generate proxy URLs for response
            proxy_urls = MediaService.get_proxy_urls(story.id)
            
            response_data = {
                'story_id': story.id,
                'story': {
                    'title': story.title,
                    'content': story.content,
                    'year': story.year,
                    'region': story.region,
                },
                'image_url': proxy_urls['image_url'],
                'audio_url': proxy_urls['audio_url'],
            }
            
            return Response(
                GenerateFullResponseSerializer(response_data).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            print(f"Error in full generation pipeline: {e}")
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
