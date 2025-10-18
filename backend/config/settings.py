"""
Configuration settings for the Mashijaa Voices API.
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class."""
    
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # Flask Settings
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    PORT = int(os.getenv('PORT', 5000))
    
    # Voice Settings
    DEFAULT_VOICE = os.getenv('DEFAULT_VOICE', 'Kore')
    AVAILABLE_VOICES = ['Kore', 'Charon', 'Fenrir', 'Aoede', 'Puck']
    
    # Model Settings
    DEFAULT_TEXT_MODEL = os.getenv('DEFAULT_TEXT_MODEL', 'gemini-2.5-flash')
    DEFAULT_TTS_MODEL = os.getenv('DEFAULT_TTS_MODEL', 'gemini-2.5-flash-preview-tts')
    
    # Audio Settings
    AUDIO_CHANNELS = 1
    AUDIO_RATE = 24000
    AUDIO_SAMPLE_WIDTH = 2
    
    # File Upload Settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'}
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present."""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        return True

# Configuration instance
config = Config()