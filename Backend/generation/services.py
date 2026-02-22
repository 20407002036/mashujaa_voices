"""
Media storage service for uploading images and audio.
"""

import uuid
from datetime import datetime
from django.conf import settings
from django.core.files.base import ContentFile
from config.storage_backends import ImageStorage, AudioStorage


class MediaService:
    """Service for handling media file storage."""
    
    @staticmethod
    def generate_filename(extension: str, prefix: str = '') -> str:
        """Generate a unique filename."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = uuid.uuid4().hex[:8]
        if prefix:
            return f"{prefix}_{timestamp}_{unique_id}.{extension}"
        return f"{timestamp}_{unique_id}.{extension}"
    
    @staticmethod
    def upload_image(image_bytes: bytes, filename: str | None = None) -> str:
        """
        Upload an image to storage.
        
        Args:
            image_bytes: Raw image bytes
            filename: Optional filename (auto-generated if not provided)
            
        Returns:
            Public URL to the uploaded image
        """
        if not filename:
            filename = MediaService.generate_filename('jpg', 'image')
        
        path = filename
        
        # Save to storage
        storage = ImageStorage()
        saved_path = storage.save(path, ContentFile(image_bytes))
        
        # Get public URL
        if hasattr(storage, 'url'):
            return storage.url(saved_path)
        
        # Fallback for local storage
        return f"{settings.MEDIA_URL}{saved_path}"
    
    @staticmethod
    def upload_audio(audio_bytes: bytes, filename: str | None = None) -> str:
        """
        Upload audio to storage.
        
        Args:
            audio_bytes: Raw audio bytes (WAV format)
            filename: Optional filename (auto-generated if not provided)
            
        Returns:
            Public URL to the uploaded audio
        """
        if not filename:
            filename = MediaService.generate_filename('wav', 'audio')
        
        path = filename
        
        # Save to storage
        storage = AudioStorage()
        saved_path = storage.save(path, ContentFile(audio_bytes))
        
        # Get public URL
        if hasattr(storage, 'url'):
            return storage.url(saved_path)
        
        # Fallback for local storage
        return f"{settings.MEDIA_URL}{saved_path}"
