"""
Custom storage backends for Supabase S3-compatible storage.
"""

from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings


class ImageStorage(S3Boto3Storage):
    """Storage backend for images in Supabase bucket."""
    bucket_name = settings.SUPABASE_BUCKET_IMAGES
    default_acl = 'public-read'


class AudioStorage(S3Boto3Storage):
    """Storage backend for audio files in Supabase bucket."""
    bucket_name = settings.SUPABASE_BUCKET_AUDIO
    default_acl = 'public-read'
