"""
Groq TTS provider.
"""

import httpx
from typing import Optional

from django.conf import settings

from .base import TTSProvider, AudioData


class GroqTTSProvider(TTSProvider):
    """TTS provider using Groq API (OpenAI-compatible)."""
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.endpoint = 'https://api.groq.com/openai/v1/audio/speech'
        self.model = 'canopylabs/orpheus-v1-english'
        self.sample_rate = 24000
    
    @property
    def name(self) -> str:
        return 'groq'
    
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
        """Generate audio using Groq TTS API."""
        voice = voice or 'autumn'  # Default to autumn for documentary style
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
        
        payload = {
            'model': self.model,
            'input': text,
            'voice': voice,
            'response_format': 'wav',
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.endpoint,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            
            return AudioData(
                audio_bytes=response.content,
                format='wav',
                sample_rate=self.sample_rate
            )
