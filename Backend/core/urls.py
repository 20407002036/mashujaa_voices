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
]
