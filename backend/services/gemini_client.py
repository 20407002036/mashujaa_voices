"""
Centralized Gemini client for the Mashijaa Voices API.
"""
from google import genai
from config.settings import config

class GeminiClient:
    """Singleton Gemini client wrapper."""
    
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiClient, cls).__new__(cls)
            cls._instance._initialize_client()
        return cls._instance
    
    def _initialize_client(self):
        """Initialize the Gemini client with proper configuration."""
        if not config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")
        
        self._client = genai.Client(api_key=config.GEMINI_API_KEY)
    
    @property
    def client(self):
        """Get the Gemini client instance."""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    def generate_text(self, prompt, model=None):
        """Generate text using Gemini AI."""
        model = model or config.DEFAULT_TEXT_MODEL
        response = self.client.models.generate_content(
            model=model,
            contents=prompt
        )
        return response.text
    
    def generate_speech(self, text, voice_name=None, model=None):
        """Generate speech using Gemini TTS."""
        from google.genai import types
        
        voice_name = voice_name or config.DEFAULT_VOICE
        model = model or config.DEFAULT_TTS_MODEL
        
        response = self.client.models.generate_content(
            model=model,
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name
                        )
                    )
                )
            )
        )
        
        return response.candidates[0].content.parts[0].inline_data.data
    
    def analyze_image(self, image_bytes, prompt=None, mime_type="image/jpeg"):
        """Analyze image using Gemini Vision."""
        from google.genai import types
        
        prompt = prompt or "Describe this image in detail"
        
        response = self.client.models.generate_content(
            model=config.DEFAULT_TEXT_MODEL,
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type
                ),
                prompt
            ]
        )
        
        return response.text

# Global client instance
gemini_client = GeminiClient()