"""
Edge TTS provider using OpenAI-compatible API.
"""

import httpx
from typing import Optional

from django.conf import settings

from .base import TTSProvider, AudioData


class EdgeTTSProvider(TTSProvider):
    """TTS provider using custom Edge TTS API."""
    
    def __init__(self):
        self.endpoint = settings.EDGE_TTS_URL
        self.sample_rate = 24000
    
    @property
    def name(self) -> str:
        return 'edge-tts'
    
    @property
    def available_voices(self) -> list[str]:
        return [
            'autumn',
            'diana',
            'hannah',
            'austin',
            'daniel',
            'troy'
        ]
    
    async def generate_audio(
        self, 
        text: str, 
        voice: Optional[str] = None
    ) -> AudioData:
        """Generate audio using Edge TTS API."""
        
        payload = {
            'input': text,
            'response_format': 'mp3',
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.endpoint,
                json=payload,
            )
            response.raise_for_status()
            
            return AudioData(
                audio_bytes=response.content,
                format='mp3',
                sample_rate=self.sample_rate
            )
