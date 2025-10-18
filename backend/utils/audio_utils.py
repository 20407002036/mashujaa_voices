"""
Audio processing utilities for the Mashijaa Voices API.
"""
import wave
import io
from config.settings import config

def wave_file_bytes(pcm, channels=None, rate=None, sample_width=None):
    """
    Convert PCM data to WAV file bytes.
    
    Args:
        pcm: PCM audio data
        channels: Number of audio channels (default from config)
        rate: Sample rate (default from config)
        sample_width: Sample width in bytes (default from config)
    
    Returns:
        bytes: WAV file as bytes
    """
    channels = channels or config.AUDIO_CHANNELS
    rate = rate or config.AUDIO_RATE
    sample_width = sample_width or config.AUDIO_SAMPLE_WIDTH
    
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm)
    buffer.seek(0)
    return buffer.getvalue()

def save_wave_file(filename, pcm, channels=None, rate=None, sample_width=None):
    """
    Save PCM data to a WAV file.
    
    Args:
        filename: Output filename
        pcm: PCM audio data
        channels: Number of audio channels (default from config)
        rate: Sample rate (default from config)
        sample_width: Sample width in bytes (default from config)
    """
    channels = channels or config.AUDIO_CHANNELS
    rate = rate or config.AUDIO_RATE
    sample_width = sample_width or config.AUDIO_SAMPLE_WIDTH
    
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm)

def validate_audio_format(format_type):
    """
    Validate audio format type.
    
    Args:
        format_type: Audio format ('wav' or 'file')
    
    Returns:
        bool: True if valid format
    """
    return format_type in ['wav', 'file']