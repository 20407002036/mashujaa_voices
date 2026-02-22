"""
API views for core models.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from .models import Story
from .serializers import StorySerializer, StoryCreateSerializer, GalleryItemSerializer


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
    queryset = Story.objects.all()
    serializer_class = StorySerializer


class GalleryView(generics.ListAPIView):
    """
    GET: List all public stories for the gallery.
    """
    serializer_class = GalleryItemSerializer

    def get_queryset(self):

        strories = Story.objects.filter(
            user_consented=True,
            is_public=True
        ).order_by('-created_at')

        print(f"GalleryView: Found {strories.count()} stories for gallery.")
        return Story.objects.filter(
            user_consented=True,
            is_public=True
        ).order_by('-created_at')
