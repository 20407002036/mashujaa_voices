"""
URL patterns for core app.
"""

from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('stories/', views.StoryListCreateView.as_view(), name='story-list-create'),
    path('stories/<uuid:pk>/', views.StoryDetailView.as_view(), name='story-detail'),
    path('gallery/', views.GalleryView.as_view(), name='gallery'),
    # Proxy views deprecated - using direct S3 URLs with CORS instead
    # path('media/image/<uuid:story_id>/', views.ImageProxyView.as_view(), name='image-proxy'),
    # path('media/audio/<uuid:story_id>/', views.AudioProxyView.as_view(), name='audio-proxy'),
]
