"""
Core models for Mashujaa Voices.
"""

import uuid
from django.db import models


class Story(models.Model):
    """
    Represents a generated story from a historical image.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    year = models.CharField(max_length=50, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.URLField(max_length=500)
    audio_url = models.URLField(max_length=500, blank=True, null=True)
    user_consented = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    user_id = models.CharField(max_length=100, default='anonymous')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Story'
        verbose_name_plural = 'Stories'

    def __str__(self):
        return self.title

    @property
    def excerpt(self) -> str:
        """Return first 150 characters of content as excerpt."""
        if len(self.content) > 150:
            return self.content[:150] + '...'
        return self.content
