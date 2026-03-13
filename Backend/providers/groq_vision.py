"""
Groq Vision provider using Llama 4 Scout.
"""

import base64
import json
import re
from typing import Optional

from groq import AsyncGroq
from django.conf import settings

from .base import VisionProvider, StoryData


def _attempt_json_repair(text: str) -> str:
    """
    Attempt to repair common JSON formatting issues.
    
    Args:
        text: Potentially malformed JSON text
        
    Returns:
        Repaired JSON text
    """
    # Remove any trailing commas before closing braces/brackets
    text = re.sub(r',(\s*[}\]])', r'\1', text)
    
    # Remove any BOM or invisible characters
    text = text.encode('utf-8').decode('utf-8-sig')
    
    return text


class GroqVisionProvider(VisionProvider):
    """Vision provider using Groq's Llama Vision models with task-optimized selection."""
    
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        # Use Llama 4 Scout for both validation and story generation
        self.validation_model = 'meta-llama/llama-4-scout-17b-16e-instruct'
        self.analysis_model = 'meta-llama/llama-4-scout-17b-16e-instruct'
    
    @property
    def name(self) -> str:
        return 'groq'
    
    async def analyze_image(
        self, 
        image_data: bytes, 
        context: Optional[str] = None
    ) -> StoryData:
        """Analyze image using Groq's Llama Vision model."""
        
        # Encode image to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Build prompt (same as Gemini for consistency)
        context_text = f"\n\nUser context: {context}" if context else ""
        
        prompt = f"""You are a Kenyan historian and storyteller specializing in the rich tapestry of Kenya's past. 
Analyze this historical image and create a compelling narrative about it.

You MUST respond with ONLY a valid JSON object in this EXACT format:
{{
  "title": "A captivating title for this moment in history (max 100 chars)",
  "content": "A documentary-style narrative (150-200 words) that describes what's happening, places it in historical context, evokes pride and nostalgia for Kenya's heritage, and uses vivid, evocative language",
  "year": "Your best estimate (e.g., 1963, Early 1950s, 1920s)",
  "region": "The likely region in Kenya (e.g., Nairobi, Mombasa, Central Kenya)"
}}

Focus on themes of independence, cultural heritage, community, and progress.{context_text}

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON object - nothing before it, nothing after it
- Do NOT wrap it in markdown code blocks (no ```json or ```)
- Do NOT include any explanatory text
- The response must start with {{ and end with }}"""

        # Create chat completion with vision
        response = await self.client.chat.completions.create(
            model=self.analysis_model,
            messages=[
                {
                    'role': 'user',
                    'content': [
                        {
                            'type': 'text',
                            'text': prompt
                        },
                        {
                            'type': 'image_url',
                            'image_url': {
                                'url': f'data:image/jpeg;base64,{image_base64}'
                            }
                        }
                    ]
                }
            ],
            temperature=0.3,  # Lower temperature for more consistent JSON output
            max_tokens=1000,
        )
        
        text = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present (handle various formats)
        if '```' in text:
            # Remove opening code fence
            text = re.sub(r'^```(?:json)?\s*\n?', '', text, flags=re.MULTILINE)
            # Remove closing code fence
            text = re.sub(r'\n?```\s*$', '', text, flags=re.MULTILINE)
        
        # Remove any leading/trailing whitespace or text outside JSON
        # Try to extract JSON object if there's extra text
        if not text.startswith('{'):
            # Find the first { and take everything from there
            start_idx = text.find('{')
            if start_idx != -1:
                text = text[start_idx:]
        
        # Remove any trailing text after the last }
        if text.endswith('}'):
            pass  # Already good
        else:
            last_brace = text.rfind('}')
            if last_brace != -1:
                text = text[:last_brace + 1]
        
        text = text.strip()
        
        print(f"[DEBUG] Groq analyze_image response text:\n{text}")
        
        try:
            data = json.loads(text)
        except json.JSONDecodeError as e:
            # Try to repair common JSON issues
            print(f"[WARNING] Initial JSON parse failed, attempting repair...")
            repaired_text = _attempt_json_repair(text)
            try:
                data = json.loads(repaired_text)
                print(f"[SUCCESS] JSON repair successful!")
            except json.JSONDecodeError as e2:
                print(f"[ERROR] Failed to parse JSON from Groq even after repair: {e2}")
                print(f"[ERROR] Problematic text (first 500 chars): {text[:500]}")
                raise Exception(f"Invalid JSON response from Groq: {str(e2)}")
        
        return StoryData(
            title=data.get('title', 'Untitled Story'),
            content=data.get('content', ''),
            year=data.get('year'),
            region=data.get('region')
        )
    
    async def validate_is_historic(
        self,
        image_data: bytes,
        context: Optional[str] = None
    ) -> dict:
        """
        Validate if an image appears to be a historical photograph.
        
        Returns:
            dict with:
                - is_historic: bool (True if appears to be old/historical photo)
                - confidence: float (0-1, confidence in assessment)
                - reason: str (explanation of decision)
                - era: str|None (estimated time period if historic)
                - issues: list[str] (specific problems found if not historic)
        """
        # Encode image to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        context_text = f"\n\nUser-provided context: {context}" if context else ""
        
        prompt = f"""Analyze this image and determine if it is a historical photograph suitable for archival storytelling about Kenya's history.

A HISTORICAL PHOTOGRAPH must meet these criteria:
1. Appears to be from 1920s-1990s (vintage black & white or aged color photos)
2. Shows authentic historical scenes, people, places, or events
3. Has photographic qualities typical of film cameras (grain, analog quality, not modern digital sharpness)
4. Contains cultural, social, or historical significance
5. Shows dated elements: old clothing styles, vintage vehicles, historical architecture, or period-appropriate settings

REJECT if the image is:
- Modern digital photos from 2000s onwards (high resolution, digital camera quality)
- Recent smartphone photos or selfies
- Screenshots, memes, or digital graphics
- AI-generated images or digital art
- Advertisements or modern commercial content
- Low quality/unrecognizable content that cannot be properly analyzed
- Contemporary scenes with modern elements (recent cars, modern clothing, current technology)
{context_text}

Your response MUST be a valid JSON object with these exact fields:
{{
  "is_historic": <boolean - true only if clearly appears to be a vintage/historical photograph>,
  "confidence": <float 0.0-1.0 - how certain you are in your assessment>,
  "reason": "<1-2 sentence explanation of your decision>",
  "era": "<estimated time period if historic, e.g., '1960s', 'Early 1950s', 'Colonial Era 1920s', or null if not historic>",
  "issues": [<list of specific problems found if not historic, empty array if historic>]
}}

IMPORTANT: Be strict in validation. If you have any doubt about whether it's truly historical, mark is_historic as false. Return ONLY the JSON object."""

        # Create chat completion with vision - use faster model for validation
        response = await self.client.chat.completions.create(
            model=self.validation_model,
            messages=[
                {
                    'role': 'user',
                    'content': [
                        {
                            'type': 'text',
                            'text': prompt
                        },
                        {
                            'type': 'image_url',
                            'image_url': {
                                'url': f'data:image/jpeg;base64,{image_base64}'
                            }
                        }
                    ]
                }
            ],
            temperature=0.5,
            max_tokens=300,
        )
        
        text = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if text.startswith('```'):
            text = re.sub(r'^```(?:json)?\n?', '', text)
            text = re.sub(r'\n?```$', '', text)
        
        data = json.loads(text)
        
        return {
            'is_historic': data.get('is_historic', False),
            'confidence': data.get('confidence', 0.0),
            'reason': data.get('reason', 'Unable to determine'),
            'era': data.get('era'),
            'issues': data.get('issues', [])
        }
