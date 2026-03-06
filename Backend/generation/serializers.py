"""
Serializers for generation API.
"""

from rest_framework import serializers


class GenerateStoryRequestSerializer(serializers.Serializer):
    """Request serializer for story generation."""
    image = serializers.ImageField(
        help_text='Historical image file to analyze'
    )
    context = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text='Optional context about the image (e.g., "My grandfather in Nairobi, 1963")'
    )
    vision_provider = serializers.CharField(
        required=False,
        help_text='Vision provider to use (default: from settings)'
    )


class GenerateStoryResponseSerializer(serializers.Serializer):
    """Response serializer for story generation."""
    title = serializers.CharField()
    content = serializers.CharField()
    year = serializers.CharField(allow_null=True)
    region = serializers.CharField(allow_null=True)


class GenerateAudioRequestSerializer(serializers.Serializer):
    """Request serializer for audio generation."""
    text = serializers.CharField(
        max_length=5000,
        help_text='Text to convert to speech'
    )
    voice = serializers.CharField(
        required=False,
        help_text='Voice to use for TTS'
    )
    tts_provider = serializers.CharField(
        required=False,
        help_text='TTS provider to use (default: from settings)'
    )


class GenerateFullRequestSerializer(serializers.Serializer):
    """Request serializer for full generation pipeline."""
    image = serializers.ImageField(
        help_text='Historical image file to analyze'
    )
    context = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text='Optional context about the image'
    )
    voice = serializers.CharField(
        required=False,
        help_text='Voice to use for TTS'
    )
    vision_provider = serializers.CharField(
        required=False,
        help_text='Vision provider to use'
    )
    tts_provider = serializers.CharField(
        required=False,
        help_text='TTS provider to use'
    )
    user_consented = serializers.BooleanField(
        default=False,
        help_text='User consent to save the story'
    )
    is_public = serializers.BooleanField(
        default=False,
        help_text='Make story visible in public gallery'
    )
    force_generate = serializers.BooleanField(
        default=False,
        required=False,
        help_text='Force generation even if validation fails (requires moderator approval)'
    )


class GenerateFullResponseSerializer(serializers.Serializer):
    """Response serializer for full generation pipeline."""
    story_id = serializers.IntegerField()
    story = GenerateStoryResponseSerializer()
    image_url = serializers.URLField()
    audio_url = serializers.URLField(allow_null=True)


class ProviderListSerializer(serializers.Serializer):
    """Serializer for provider list response."""
    vision_providers = serializers.ListField(child=serializers.CharField())
    tts_providers = serializers.ListField(child=serializers.CharField())
    current_vision = serializers.CharField()
    current_tts = serializers.CharField()
