# Mashijaa Voices API

A Flask-based API backend for text generation and text-to-speech conversion using Google's Gemini AI.

## Features

- **Text Generation**: Generate text using Gemini AI models
- **Text-to-Speech**: Convert text to speech with multiple voice options
- **Image Analysis**: Analyze and generate captions for uploaded images using Gemini Vision
- **Combined Generation**: Generate text and convert to speech in one request
- **Multiple Voices**: Support for various Gemini TTS voices
- **CORS Enabled**: Ready for frontend integration

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Update .env with your Gemini API key
   ```

3. **Run the Application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /
```
Returns API status and health information.

### Text Generation
```
POST /api/generate-text
```

**Request Body:**
```json
{
  "prompt": "Your text prompt here",
  "model": "gemini-2.5-flash" // optional, defaults to gemini-2.5-flash
}
```

**Response:**
```json
{
  "success": true,
  "text": "Generated text response",
  "model": "gemini-2.5-flash",
  "timestamp": "2025-10-14T12:00:00"
}
```

### Text-to-Speech
```
POST /api/text-to-speech
```

**Request Body:**
```json
{
  "text": "Text to convert to speech",
  "voice_name": "Kore", // optional, defaults to Kore
  "format": "wav" // optional, "wav" or "file"
}
```

**Response (format=wav):**
```json
{
  "success": true,
  "audio_data": "base64_encoded_wav_data",
  "voice_name": "Kore",
  "format": "wav",
  "timestamp": "2025-10-14T12:00:00"
}
```

**Response (format=file):**
Returns WAV file as download.

### Generate Speech (Text + TTS)
```
POST /api/generate-speech
```

**Request Body:**
```json
{
  "prompt": "Generate a cheerful greeting",
  "voice_name": "Kore", // optional
  "text_model": "gemini-2.5-flash" // optional
}
```

**Response:**
```json
{
  "success": true,
  "text": "Generated text",
  "audio_data": "base64_encoded_wav_data",
  "voice_name": "Kore",
  "text_model": "gemini-2.5-flash",
  "format": "wav",
  "timestamp": "2025-10-14T12:00:00"
}
```

### Image Analysis
```
POST /api/analyze-image
```

**Request Body (multipart/form-data):**
- `image`: Image file (JPEG, PNG, WebP, HEIC, HEIF)
- `prompt`: Text prompt for analysis (optional, defaults to "Describe this image in detail")

**Response:**
```json
{
  "success": true,
  "caption": "Detailed description of the image content",
  "model": "gemini-2.5-flash",
  "timestamp": "2025-10-14T12:00:00"
}
```

### Available Voices
```
GET /api/voices
```

**Response:**
```json
{
  "success": true,
  "voices": ["Kore", "Charon", "Fenrir", "Aoede", "Puck"],
  "default": "Kore"
}
```

## Available Voices

- **Kore**: Default voice
- **Charon**: Alternative voice option
- **Fenrir**: Alternative voice option  
- **Aoede**: Alternative voice option
- **Puck**: Alternative voice option

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `DEBUG`: Enable debug mode (default: False)
- `PORT`: Server port (default: 5000)

## Example Usage

### Python Client Example

```python
import requests
import base64

# Generate text
response = requests.post('http://localhost:5000/api/generate-text', json={
    'prompt': 'Write a short poem about AI'
})
data = response.json()
print(data['text'])

# Text to speech
response = requests.post('http://localhost:5000/api/text-to-speech', json={
    'text': 'Hello, this is a test of text to speech!',
    'voice_name': 'Kore'
})
data = response.json()

# Save audio file
if data['success']:
    audio_bytes = base64.b64decode(data['audio_data'])
    with open('output.wav', 'wb') as f:
        f.write(audio_bytes)

# Image analysis
with open('image.jpg', 'rb') as f:
    files = {'image': f}
    data = {'prompt': 'What objects do you see in this image?'}
    response = requests.post('http://localhost:5000/api/analyze-image', 
                           files=files, data=data)
    result = response.json()
    if result['success']:
        print('Image caption:', result['caption'])
```

### JavaScript/Fetch Example

```javascript
// Generate and speak text
fetch('http://localhost:5000/api/generate-speech', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        prompt: 'Say something inspiring about technology',
        voice_name: 'Kore'
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Generated text:', data.text);
        
        // Play audio
        const audio = new Audio(`data:audio/wav;base64,${data.audio_data}`);
        audio.play();
    }
});

// Image analysis
const formData = new FormData();
const fileInput = document.querySelector('input[type="file"]');
formData.append('image', fileInput.files[0]);
formData.append('prompt', 'Describe what you see in this image');

fetch('http://localhost:5000/api/analyze-image', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Image analysis:', data.caption);
    }
});
```

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `500`: Internal Server Error

## Development

To run in development mode:

1. Set `DEBUG=True` in `.env`
2. Run `python app.py`

The server will reload automatically when code changes are made.

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn app:app --bind 0.0.0.0:5000
   ```

## Security Notes

- Keep your Gemini API key secure and never commit it to version control
- Consider implementing rate limiting for production use
- Add authentication if needed for your use case