"""
Base provider classes for AI services.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class StoryData:
    """Generated story data from image analysis."""
    title: str
    content: str
    year: Optional[str] = None
    region: Optional[str] = None


@dataclass 
class AudioData:
    """Generated audio data from TTS."""
    audio_bytes: bytes
    format: str = 'wav'
    sample_rate: int = 24000


class VisionProvider(ABC):
    """Abstract base class for vision/image analysis providers."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name identifier."""
        pass
    
    @abstractmethod
    async def analyze_image(
        self, 
        image_data: bytes, 
        context: Optional[str] = None
    ) -> StoryData:
        """
        Analyze an image and generate a story about it.
        
        Args:
            image_data: Raw image bytes (JPEG/PNG)
            context: Optional user-provided context about the image
            
        Returns:
            StoryData with title, content, year, and region
        """
        pass


class TTSProvider(ABC):
    """Abstract base class for text-to-speech providers."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name identifier."""
        pass
    
    @property
    @abstractmethod
    def available_voices(self) -> list[str]:
        """List of available voice options."""
        pass
    
    @abstractmethod
    async def generate_audio(
        self, 
        text: str, 
        voice: Optional[str] = None
    ) -> AudioData:
        """
        Generate audio from text.
        
        Args:
            text: The text to convert to speech
            voice: Optional voice identifier
            
        Returns:
            AudioData with audio bytes and format info
        """
        pass
