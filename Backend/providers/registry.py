"""
Provider registry for dynamic provider selection.
"""

import logging
from typing import Type
from django.conf import settings

from .base import VisionProvider, TTSProvider
from .gemini import GeminiVisionProvider, GeminiTTSProvider
from .groq_vision import GroqVisionProvider
from .edge_tts import EdgeTTSProvider
from .qwen import QwenTTSProvider

logger = logging.getLogger(__name__)


def _is_rate_limit_error(exception: Exception) -> bool:
    """
    Check if an exception is a rate limit or quota error that should trigger fallback.
    
    Args:
        exception: The exception to check
        
    Returns:
        True if this is a rate limit error, False otherwise
    """
    # Check for Google API ResourceExhausted errors
    exception_type = type(exception).__name__
    if 'ResourceExhausted' in exception_type:
        return True
    
    # Check for HTTP 429 status code (various attribute names)
    if hasattr(exception, 'status_code') and exception.status_code == 429:
        return True
    if hasattr(exception, 'code') and exception.code == 429:
        return True
    
    # Check exception message for quota/limit keywords
    error_msg = str(exception).lower()
    rate_limit_keywords = ['quota', 'rate limit', 'too many requests', '429', 'resource exhausted', 'resource_exhausted']
    if any(keyword in error_msg for keyword in rate_limit_keywords):
        return True
    
    return False

def is_gemini_json_error(e):
    error = "Invalid JSON response from Gemini"
    return str(e).startswith(error)

# Registry of available providers
VISION_PROVIDERS: dict[str, Type[VisionProvider]] = {
    'gemini': GeminiVisionProvider,
    'groq': GroqVisionProvider,
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


async def analyze_image_with_fallback(
    image_data: bytes,
    context: str | None = None,
    provider_name: str | None = None
):
    """
    Analyze an image with automatic fallback to Groq on rate limit errors.
    
    Args:
        image_data: Raw image bytes
        context: Optional user context
        provider_name: Primary provider to use (defaults to settings.VISION_PROVIDER)
        
    Returns:
        StoryData from successful analysis
        
    Raises:
        Exception: If both primary and fallback providers fail (non-rate-limit errors)
    """
    primary_name = provider_name or settings.VISION_PROVIDER
    
    try:
        # Try primary provider
        provider = get_vision_provider(primary_name)
        return await provider.analyze_image(image_data, context)
    
    except Exception as e:
        # Check if this is a rate limit error
        if _is_rate_limit_error(e) or is_gemini_json_error(e):
            logger.warning(
                f"Rate limit error with {primary_name} provider: {str(e)}. "
                f"Falling back to Groq..."
            )
            
            # Fallback to Groq if available and not already the primary
            if primary_name != 'groq' and 'groq' in VISION_PROVIDERS:
                try:
                    fallback_provider = get_vision_provider('groq')
                    result = await fallback_provider.analyze_image(image_data, context)
                    logger.info(f"Successfully generated story using Groq fallback")
                    return result
                except Exception as fallback_error:
                    logger.error(f"Fallback to Groq also failed: {str(fallback_error)}")
                    raise Exception(
                        f"Primary provider ({primary_name}) hit rate limit and fallback failed: {str(fallback_error)}"
                    )
            else:
                # No fallback available
                logger.error(f"No fallback available for {primary_name}")
                raise
        else:
            # Not a rate limit error, re-raise
            raise


async def validate_image_with_fallback(
    image_data: bytes,
    context: str | None = None,
    provider_name: str | None = None
) -> dict:
    """
    Validate an image with automatic fallback to Groq on rate limit errors.
    
    Args:
        image_data: Raw image bytes
        context: Optional user context
        provider_name: Primary provider to use (defaults to settings.VISION_PROVIDER)
        
    Returns:
        dict with validation results (is_historic, confidence, reason, era, issues)
        
    Raises:
        Exception: If both primary and fallback providers fail (non-rate-limit errors)
    """
    primary_name = provider_name or settings.VISION_PROVIDER
    
    try:
        # Try primary provider validation
        provider = get_vision_provider(primary_name)
        return await provider.validate_is_historic(image_data, context)
    
    except Exception as e:
        # Check if this is a rate limit error
        if _is_rate_limit_error(e):
            logger.warning(
                f"Rate limit error with {primary_name} validation: {str(e)}. "
                f"Falling back to Groq validation..."
            )
            
            # Fallback to Groq if available and not already the primary
            if primary_name != 'groq' and 'groq' in VISION_PROVIDERS:
                try:
                    fallback_provider = get_vision_provider('groq')
                    result = await fallback_provider.validate_is_historic(image_data, context)
                    logger.info(f"Successfully validated image using Groq fallback")
                    return result
                except Exception as fallback_error:
                    logger.error(f"Validation fallback to Groq also failed: {str(fallback_error)}")
                    raise Exception(
                        f"Primary provider ({primary_name}) hit rate limit and validation fallback failed: {str(fallback_error)}"
                    )
            else:
                # No fallback available
                logger.error(f"No validation fallback available for {primary_name}")
                raise
        else:
            # Not a rate limit error, re-raise
            raise
