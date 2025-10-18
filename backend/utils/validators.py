"""
Input validation utilities for the Mashijaa Voices API.
"""
import os
from config.settings import config

def validate_voice_name(voice_name):
    """
    Validate voice name.
    
    Args:
        voice_name: Voice name to validate
    
    Returns:
        bool: True if valid voice name
    """
    return voice_name in config.AVAILABLE_VOICES

def validate_image_file(file):
    """
    Validate uploaded image file.
    
    Args:
        file: Flask file object
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not file:
        return False, "No file provided"
    
    if file.filename == '':
        return False, "No file selected"
    
    # Check file extension
    if '.' not in file.filename:
        return False, "File has no extension"
    
    extension = file.filename.rsplit('.', 1)[1].lower()
    if extension not in config.ALLOWED_IMAGE_EXTENSIONS:
        return False, f"File type '.{extension}' not allowed. Allowed types: {', '.join(config.ALLOWED_IMAGE_EXTENSIONS)}"
    
    return True, None

def validate_text_prompt(prompt):
    """
    Validate text prompt.
    
    Args:
        prompt: Text prompt to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not prompt:
        return False, "Prompt is required"
    
    if not isinstance(prompt, str):
        return False, "Prompt must be a string"
    
    if len(prompt.strip()) == 0:
        return False, "Prompt cannot be empty"
    
    if len(prompt) > 10000:  # Reasonable limit
        return False, "Prompt too long (max 10,000 characters)"
    
    return True, None

def validate_model_name(model_name, model_type="text"):
    """
    Validate model name.
    
    Args:
        model_name: Model name to validate
        model_type: Type of model ("text" or "tts")
    
    Returns:
        bool: True if valid model name
    """
    valid_text_models = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ]
    
    valid_tts_models = [
        "gemini-2.5-flash-preview-tts"
    ]
    
    if model_type == "text":
        return model_name in valid_text_models
    elif model_type == "tts":
        return model_name in valid_tts_models
    
    return False

def sanitize_filename(filename):
    """
    Sanitize filename for safe file operations.
    
    Args:
        filename: Original filename
    
    Returns:
        str: Sanitized filename
    """
    # Remove path separators and dangerous characters
    filename = os.path.basename(filename)
    filename = "".join(c for c in filename if c.isalnum() or c in "._-")
    
    # Ensure it's not empty
    if not filename:
        filename = "file"
    
    return filename