"""
URL configuration for Mashujaa Voices Backend.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests


@api_view(['GET'])
def api_root(request):
    """API root endpoint with available endpoints."""
    return Response({
        'message': 'Mashujaa Voices API',
        'version': '1.0.0',
        'endpoints': {
            'stories': '/api/stories/',
            'gallery': '/api/gallery/',
            'generate_story': '/api/generate/story/',
            'generate_audio': '/api/generate/audio/',
            'generate_full': '/api/generate/full/',
            'providers': '/api/generate/providers/',
        }
    })


@api_view(['GET'])
def health_check(request):
    """Health check endpoint."""
    return Response({
        'status': 'healthy',
        'service': 'Mashujaa Voices API'
    })

@api_view(['POST'])
def wake_tts(request):
    tts_url = settings.EDGE_TTS_URL

    response = requests.get(f"{tts_url}/health")

    print("*"*20)
    print(response)
    return Response()


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health-check'),
    path('wake_tts/',wake_tts, name='wake-tts'),
    path('api/', api_root, name='api-root'),
    path('api/', include('core.urls')),
    path('api/generate/', include('generation.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
