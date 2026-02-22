"""
URL patterns for generation API.
"""

from django.urls import path
from . import views

app_name = 'generation'

urlpatterns = [
    path('story/', views.GenerateStoryView.as_view(), name='generate-story'),
    path('audio/', views.GenerateAudioView.as_view(), name='generate-audio'),
    path('full/', views.GenerateFullView.as_view(), name='generate-full'),
    path('providers/', views.ProviderListView.as_view(), name='provider-list'),
]
