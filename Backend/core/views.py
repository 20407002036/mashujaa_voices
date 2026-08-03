"""
API views for core models.
"""

import logging
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse, StreamingHttpResponse
from .models import Story
from .serializers import StorySerializer, StoryCreateSerializer, GalleryItemSerializer

logger = logging.getLogger(__name__)


class StoryListCreateView(generics.ListCreateAPIView):
    """
    GET: List all stories (for admin/debug).
    POST: Create a new story.
    """
    queryset = Story.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StoryCreateSerializer
        return StorySerializer

    def perform_create(self, serializer):
        serializer.save(user_id='anonymous')


class StoryDetailView(generics.RetrieveDestroyAPIView):
    """
    GET: Retrieve a single story.
    DELETE: Delete a story.
    """
    serializer_class = StorySerializer

    def get_queryset(self):
        # Only expose consented stories publicly; used for share links
        return Story.objects.filter(user_consented=True)


class GalleryView(generics.ListAPIView):
    """
    GET: List all public stories for the gallery with pagination.
    """
    serializer_class = GalleryItemSerializer

    def get_queryset(self):
        # Optimized query with proper indexing
        # Only show approved stories in public gallery
        queryset = Story.objects.filter(
            user_consented=True,
            is_public=True,
            requires_approval=False
        ).order_by('-created_at')
        
        logger.info(f"GalleryView: Returning {queryset.count()} public stories")
        return queryset


class ImageProxyView(APIView):
    """
    GET: Stream image file from S3 storage via proxy to avoid CORS issues.
    """
    
    def get(self, request, story_id):
        try:
            story = Story.objects.get(id=story_id)
            
            if not story.image_url:
                return Response(
                    {'error': 'Image not available'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Extract bucket and key from the stored URL
            # URL format: https://efolxfukzdedyaokhibz.storage.supabase.co/storage/v1/s3/story-images/image_xxx.jpg
            try:
                # Get the part after /storage/v1/s3/
                url_part = story.image_url.split('/storage/v1/s3/')[-1]
                logger.debug(f"URL part: {url_part}")
                
                # The key should be the full path as returned by django-storages
                # For Supabase S3, the bucket might be something else
                # Try using the entire path as the key
                bucket = settings.AWS_STORAGE_BUCKET_NAME  # This is 'story-images'
                
                # If the url_part contains the bucket name, it's the full key
                if url_part.startswith('story-images/'):
                    # This means bucket is a folder, try without the bucket prefix
                    key = url_part.split('story-images/')[-1]  # Just get the filename part
                    # But we also need the actual bucket - it might be different
                    # For Supabase, let's try using the full path
                    key = url_part  # Use full path
                else:
                    key = url_part
                
                logger.debug(f"Fetching image: bucket={bucket}, key={key}")
                
                # Create S3 client
                s3_client = boto3.client(
                    's3',
                    endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME,
                )
                
                # Try getting object - if it fails, try without bucket prefix
                try:
                    s3_response = s3_client.get_object(Bucket=bucket, Key=key)
                except s3_client.exceptions.NoSuchKey:
                    logger.warning(f"Key not found with full path: {key}, trying without bucket prefix")
                    # Try without the bucket folder prefix
                    if '/' in key:
                        key_without_prefix = key.split('/', 1)[-1]
                        logger.debug(f"Retrying with key: {key_without_prefix}")
                        s3_response = s3_client.get_object(Bucket=bucket, Key=key_without_prefix)
                    else:
                        raise
                
                # Stream response
                response = StreamingHttpResponse(
                    s3_response['Body'].iter_chunks(chunk_size=8192),
                    content_type='image/jpeg',
                )
                response['Cache-Control'] = 'public, max-age=31536000'
                return response
                
            except Exception as e:
                logger.error(f"Error parsing image URL or fetching from S3: {str(e)}", exc_info=True)
                raise
            
        except Story.DoesNotExist:
            logger.warning(f"Story not found: {story_id}")
            return Response(
                {'error': 'Story not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ClientError as e:
            logger.error(f"S3 client error for story {story_id}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Image not found in storage'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching image for story {story_id}: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AudioProxyView(APIView):
    """
    GET: Stream audio file from S3 storage via proxy to avoid CORS issues.
    """
    
    def get(self, request, story_id):
        try:
            story = Story.objects.get(id=story_id)
            
            if not story.audio_url:
                return Response(
                    {'error': 'Audio not available'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Extract bucket and key from the stored URL
            # URL format: https://efolxfukzdedyaokhibz.storage.supabase.co/storage/v1/s3/story-audio/audio_xxx.wav
            try:
                # Get the part after /storage/v1/s3/
                url_part = story.audio_url.split('/storage/v1/s3/')[-1]
                logger.debug(f"Audio URL part: {url_part}")
                
                # Audio files are stored in a different bucket - determine which bucket to use
                # Check if this is an audio bucket path
                if 'story-audio' in url_part:
                    bucket = getattr(settings, 'SUPABASE_BUCKET_AUDIO', 'story-audio')
                else:
                    bucket = settings.AWS_STORAGE_BUCKET_NAME
                
                # Use full path as key
                key = url_part
                
                logger.debug(f"Fetching audio: bucket={bucket}, key={key}")
                
                # Create S3 client
                s3_client = boto3.client(
                    's3',
                    endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME,
                )
                
                # Try getting object - if it fails, try without bucket prefix
                try:
                    s3_response = s3_client.get_object(Bucket=bucket, Key=key)
                except s3_client.exceptions.NoSuchKey:
                    logger.warning(f"Key not found with full path: {key}, trying without bucket prefix")
                    # Try without the bucket folder prefix
                    if '/' in key:
                        key_without_prefix = key.split('/', 1)[-1]
                        logger.debug(f"Retrying with key: {key_without_prefix}")
                        s3_response = s3_client.get_object(Bucket=bucket, Key=key_without_prefix)
                    else:
                        raise
                
                # Stream response
                response = StreamingHttpResponse(
                    s3_response['Body'].iter_chunks(chunk_size=8192),
                    content_type='audio/mpeg',
                )
                response['Cache-Control'] = 'public, max-age=31536000'
                return response
                
            except Exception as e:
                logger.error(f"Error parsing audio URL or fetching from S3: {str(e)}", exc_info=True)
                raise
            
        except Story.DoesNotExist:
            logger.warning(f"Story not found: {story_id}")
            return Response(
                {'error': 'Story not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ClientError as e:
            logger.error(f"S3 client error for story {story_id}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Audio not found in storage'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching audio for story {story_id}: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
