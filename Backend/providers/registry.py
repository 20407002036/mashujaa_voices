"""
Provider registry for dynamic provider selection.
"""

from typing import Type
from django.conf import settings

from .base import VisionProvider, TTSProvider
from .gemini import GeminiVisionProvider, GeminiTTSProvider
from .edge_tts import EdgeTTSProvider
from .qwen import QwenTTSProvider


# Registry of available providers
VISION_PROVIDERS: dict[str, Type[VisionProvider]] = {
    'gemini': GeminiVisionProvider,
}

TTS_PROVIDERS: dict[str, Type[TTSProvider]] = {
    'edge-tts': EdgeTTSProvider,
    'gemini': GeminiTTSProvider,
    'qwen': QwenTTSProvider,
}


def get_vision_provider(name: str | None = None) -> VisionProvider:
    """
    Get a vision provider instance by name.
    
    Args:
        name: Provider name (defaults to settings.VISION_PROVIDER)
        
    Returns:
        VisionProvider instance
        
    Raises:
        ValueError: If provider not found
    """
    name = name or settings.VISION_PROVIDER
    
    if name not in VISION_PROVIDERS:
        available = ', '.join(VISION_PROVIDERS.keys())
        raise ValueError(f"Unknown vision provider: {name}. Available: {available}")
    
    return VISION_PROVIDERS[name]()


def get_tts_provider(name: str | None = None) -> TTSProvider:
    """
    Get a TTS provider instance by name.
    
    Args:
        name: Provider name (defaults to settings.TTS_PROVIDER)
        
    Returns:
        TTSProvider instance
        
    Raises:
        ValueError: If provider not found
    """
    name = name or settings.TTS_PROVIDER
    
    if name not in TTS_PROVIDERS:
        available = ', '.join(TTS_PROVIDERS.keys())
        raise ValueError(f"Unknown TTS provider: {name}. Available: {available}")
    
    return TTS_PROVIDERS[name]()


def list_vision_providers() -> list[str]:
    """Return list of available vision provider names."""
    return list(VISION_PROVIDERS.keys())


def list_tts_providers() -> list[str]:
    """Return list of available TTS provider names."""
    return list(TTS_PROVIDERS.keys())
