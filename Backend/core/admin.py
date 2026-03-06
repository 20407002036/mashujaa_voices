"""
Admin configuration for core models.
"""

from django.contrib import admin
from .models import Story


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'year', 'region', 'is_public', 'requires_approval', 'created_at']
    list_filter = ['is_public', 'user_consented', 'requires_approval', 'region', 'created_at']
    search_fields = ['title', 'content', 'region']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    actions = ['approve_stories', 'mark_needs_approval']
    
    def approve_stories(self, request, queryset):
        """Admin action to approve selected stories."""
        updated = queryset.update(requires_approval=False)
        self.message_user(
            request,
            f'{updated} story(ies) successfully approved and will appear in gallery.'
        )
    approve_stories.short_description = "Approve selected stories"
    
    def mark_needs_approval(self, request, queryset):
        """Admin action to mark stories as needing approval."""
        updated = queryset.update(requires_approval=True)
        self.message_user(
            request,
            f'{updated} story(ies) marked as requiring approval.'
        )
    mark_needs_approval.short_description = "Mark as requiring approval"
