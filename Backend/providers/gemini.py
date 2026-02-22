"""
Google Gemini AI providers for vision and TTS.
"""

import json
import re
import struct
from typing import Optional

from django.conf import settings
from google import genai
from google.genai import types

from .base import VisionProvider, TTSProvider, StoryData, AudioData


class GeminiVisionProvider(VisionProvider):
    """Vision provider using Google Gemini."""
    
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = 'gemini-2.5-flash'
    
    @property
    def name(self) -> str:
        return 'gemini'
    
    async def analyze_image(
        self, 
        image_data: bytes, 
        context: Optional[str] = None
    ) -> StoryData:
        """Analyze image using Gemini vision model."""
        import base64
        
        # Encode image to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Build prompt
        context_text = f"\n\nUser context: {context}" if context else ""
        
        prompt = f"""You are a Kenyan historian and storyteller specializing in the rich tapestry of Kenya's past. 
Analyze this historical image and create a compelling narrative about it.

Your response MUST be a valid JSON object with these fields:
- "title": A captivating title for this moment in history (max 100 chars)
- "content": A documentary-style narrative (150-200 words) that:
  * Describes what's happening in the image
  * Places it in historical context
  * Evokes pride and nostalgia for Kenya's heritage
  * Uses vivid, evocative language
- "year": Your best estimate of when this was taken (e.g., "1963", "Early 1950s", "1920s")
- "region": The likely region in Kenya (e.g., "Nairobi", "Mombasa", "Central Kenya")

Focus on themes of independence, cultural heritage, community, and progress.{context_text}

IMPORTANT: Return ONLY the JSON object, no markdown formatting."""

        # Create content parts
        contents = [
            types.Part.from_bytes(
                data=image_data,
                mime_type='image/jpeg'
            ),
            types.Part.from_text(text=prompt)
        ]
        
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )
        
        # Parse JSON response
        text = response.text.strip()
        # Remove markdown code blocks if present
        if text.startswith('```'):
            text = re.sub(r'^```(?:json)?\n?', '', text)
            text = re.sub(r'\n?```$', '', text)
        
        data = json.loads(text)
        
        return StoryData(
            title=data.get('title', 'Untitled Story'),
            content=data.get('content', ''),
            year=data.get('year'),
            region=data.get('region')
        )


class GeminiTTSProvider(TTSProvider):
    """TTS provider using Google Gemini."""
    
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = 'gemini-2.5-flash-preview-tts'
        self.sample_rate = 24000
    
    @property
    def name(self) -> str:
        return 'gemini-tts'
    
    @property
    def available_voices(self) -> list[str]:
        return ['Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede']
    
    async def generate_audio(
        self, 
        text: str, 
        voice: Optional[str] = None
    ) -> AudioData:
        """Generate audio using Gemini TTS model."""
        voice = voice or 'Kore'
        
        # Clean text of markdown
        clean_text = re.sub(r'[*_#`]', '', text)
        
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=clean_text,
            config=types.GenerateContentConfig(
                response_modalities=['AUDIO'],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice
                        )
                    )
                )
            )
        )
        
        # Extract PCM data and convert to WAV
        pcm_data = response.candidates[0].content.parts[0].inline_data.data
        wav_bytes = self._pcm_to_wav(pcm_data)
        
        return AudioData(
            audio_bytes=wav_bytes,
            format='wav',
            sample_rate=self.sample_rate
        )
    
    def _pcm_to_wav(self, pcm_data: bytes) -> bytes:
        """Convert raw PCM data to WAV format."""
        import io
        import wave
        
        # PCM is 16-bit little-endian mono at 24kHz
        wav_buffer = io.BytesIO()
        
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)  # 16-bit = 2 bytes
            wav_file.setframerate(self.sample_rate)
            wav_file.writeframes(pcm_data)
        
        return wav_buffer.getvalue()
