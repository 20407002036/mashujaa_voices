"""
Alibaba Qwen TTS provider via DashScope.
"""

import httpx
from typing import Optional

from django.conf import settings

from .base import TTSProvider, AudioData


class QwenTTSProvider(TTSProvider):
    """TTS provider using Alibaba DashScope (Qwen)."""
    
    def __init__(self):
        self.api_key = settings.DASHSCOPE_API_KEY
        self.endpoint = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/synthesis'
        self.model = 'qwen3-tts-flash'
        self.sample_rate = 24000
    
    @property
    def name(self) -> str:
        return 'qwen'
    
    @property
    def available_voices(self) -> list[str]:
        return ['Cherry', 'Serena', 'Ethan', 'Chelsie']
    
    async def generate_audio(
        self, 
        text: str, 
        voice: Optional[str] = None
    ) -> AudioData:
        """Generate audio using Qwen TTS API."""
        voice = voice or 'Cherry'
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'disable',
        }
        
        payload = {
            'model': self.model,
            'input': {
                'text': text,
            },
            'parameters': {
                'voice': voice,
                'language_type': 'English',
                'response_format': 'wav',
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.endpoint,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            
            # DashScope returns JSON with audio URL or base64
            data = response.json()
            
            # If audio URL is returned, fetch it
            if 'output' in data and 'audio' in data['output']:
                audio_url = data['output']['audio']
                audio_response = await client.get(audio_url)
                audio_bytes = audio_response.content
            else:
                # Direct audio bytes
                import base64
                audio_bytes = base64.b64decode(data['output']['audio_base64'])
            
            return AudioData(
                audio_bytes=audio_bytes,
                format='wav',
                sample_rate=self.sample_rate
            )
