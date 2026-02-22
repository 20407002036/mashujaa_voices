"""
Admin configuration for core models.
"""

from django.contrib import admin
from .models import Story


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'year', 'region', 'is_public', 'created_at']
    list_filter = ['is_public', 'user_consented', 'region', 'created_at']
    search_fields = ['title', 'content', 'region']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
