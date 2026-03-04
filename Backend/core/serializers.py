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
        """Convert S3 API URL to public URL."""
        if not obj.image_url:
            return None
        # Convert /storage/v1/s3/ to /storage/v1/object/public/
        return obj.image_url.replace('/storage/v1/s3/', '/storage/v1/object/public/')
    
    def get_audio_url(self, obj):
        """Convert S3 API URL to public URL."""
        if not obj.audio_url:
            return None
        # Convert /storage/v1/s3/ to /storage/v1/object/public/
        return obj.audio_url.replace('/storage/v1/s3/', '/storage/v1/object/public/')


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
        """Convert S3 API URL to public URL."""
        if not obj.image_url:
            return None
        # Convert /storage/v1/s3/ to /storage/v1/object/public/
        return obj.image_url.replace('/storage/v1/s3/', '/storage/v1/object/public/')
    
    def get_audio_url(self, obj):
        """Convert S3 API URL to public URL."""
        if not obj.audio_url:
            return None
        # Convert /storage/v1/s3/ to /storage/v1/object/public/
        return obj.audio_url.replace('/storage/v1/s3/', '/storage/v1/object/public/')
