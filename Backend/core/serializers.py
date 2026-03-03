"""
Serializers for core models.
"""

from rest_framework import serializers
from django.conf import settings
from .models import Story


class StorySerializer(serializers.ModelSerializer):
    """Serializer for Story model."""
    excerpt = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            'id',
            'title',
            'content',
            'excerpt',
            'year',
            'region',
            'image_url',
            'audio_url',
            'user_consented',
            'is_public',
            'user_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'excerpt']
    
    def get_image_url(self, obj):
        """Convert S3 URL to proxy URL."""
        if obj.image_url:
            base_url = settings.BACKEND_URL or 'http://localhost:8000'
            return f"{base_url}/api/media/image/{obj.id}/"
        return None
    
    def get_audio_url(self, obj):
        """Convert S3 URL to proxy URL."""
        if obj.audio_url:
            base_url = settings.BACKEND_URL or 'http://localhost:8000'
            return f"{base_url}/api/media/audio/{obj.id}/"
        return None


class StoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a Story."""
    
    class Meta:
        model = Story
        fields = [
            'title',
            'content',
            'year',
            'region',
            'image_url',
            'audio_url',
            'user_consented',
            'is_public',
        ]

    def validate(self, attrs):
        """Ensure user has consented before saving."""
        if not attrs.get('user_consented', False):
            raise serializers.ValidationError({
                'user_consented': 'User must consent to save the story.'
            })
        return attrs


class GalleryItemSerializer(serializers.ModelSerializer):
    """Lightweight serializer for gallery display."""
    excerpt = serializers.ReadOnlyField()
    category = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            'id',
            'title',
            'image_url',
            'audio_url',
            'excerpt',
            'category',
            'year',
            'region',
        ]

    def get_category(self, obj):
        """Return region as category for gallery display."""
        return obj.region or 'Kenya'
    
    def get_image_url(self, obj):
        """Convert S3 URL to proxy URL."""
        if obj.image_url:
            base_url = settings.BACKEND_URL or 'http://localhost:8000'
            return f"{base_url}/api/media/image/{obj.id}/"
        return None
    
    def get_audio_url(self, obj):
        """Convert S3 URL to proxy URL."""
        if obj.audio_url:
            base_url = settings.BACKEND_URL or 'http://localhost:8000'
            return f"{base_url}/api/media/audio/{obj.id}/"
        return None
