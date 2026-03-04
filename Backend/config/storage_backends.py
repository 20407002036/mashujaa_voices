"""
Custom storage backends for Supabase S3-compatible storage.
"""

from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings


class ImageStorage(S3Boto3Storage):
    """Storage backend for images in Supabase bucket."""
    bucket_name = settings.SUPABASE_BUCKET_IMAGES
    default_acl = 'public-read'
    
    def url(self, name, parameters=None, expire=None, http_method=None):
        """Generate public URL instead of S3 API URL."""
        # Get the S3 API URL from parent
        s3_url = super().url(name, parameters, expire, http_method)
        # Convert to public URL format
        return s3_url.replace('/storage/v1/s3/', '/storage/v1/object/public/')


class AudioStorage(S3Boto3Storage):
    """Storage backend for audio files in Supabase bucket."""
    bucket_name = settings.SUPABASE_BUCKET_AUDIO
    default_acl = 'public-read'
    
    def url(self, name, parameters=None, expire=None, http_method=None):
        """Generate public URL instead of S3 API URL."""
        # Get the S3 API URL from parent
        s3_url = super().url(name, parameters, expire, http_method)
        # Convert to public URL format
        return s3_url.replace('/storage/v1/s3/', '/storage/v1/object/public/')
