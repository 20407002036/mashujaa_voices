# Mashujaa Voices Backend

Django REST API backend for the Mashujaa Voices application - an AI-powered platform that analyzes historical Kenyan images and generates narrated stories.

## Features

- **Story Generation**: Upload historical images and generate documentary-style narratives using AI vision models
- **Text-to-Speech**: Convert stories to audio narration with pluggable TTS providers
- **Gallery**: Public gallery of community-submitted stories
- **Flexible AI Providers**: Swap between different AI providers via configuration

## Quick Start

### 1. Setup Virtual Environment

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required keys:
- `GEMINI_API_KEY` - Google Gemini API key (for vision)
- `GROQ_API_KEY` - Groq API key (for TTS and vision fallback)

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Start Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stories/` | List all stories |
| `POST` | `/api/stories/` | Create a story manually |
| `GET` | `/api/stories/{id}/` | Get a single story |
| `DELETE` | `/api/stories/{id}/` | Delete a story |
| `GET` | `/api/gallery/` | List public gallery stories |

### Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate/story/` | Analyze image → Generate story |
| `POST` | `/api/generate/audio/` | Text → Audio (TTS) |
| `POST` | `/api/generate/full/` | Image → Story → Audio → Save |
| `GET` | `/api/generate/providers/` | List available AI providers |

## AI Providers

### Vision Providers

| Provider | Model | Description |
|----------|-------|-------------|
| `gemini` | gemini-2.5-flash | Google Gemini vision model (primary) |
| `groq` | llama-3.2-90b-vision-preview | Llama Vision via Groq (fallback) |

**Automatic Fallback:** When Gemini hits rate limits or quota errors, the system automatically falls back to Groq's Llama Vision. This provides uninterrupted service during high-traffic periods.

### TTS Providers

| Provider | Model | Default Voice |
|----------|-------|---------------|
| `groq` | playai-tts | Fritz-PlayAI |
| `gemini` | gemini-2.5-flash-preview-tts | Kore |
| `qwen` | qwen3-tts-flash | Cherry |

Switch providers via environment variables:
```
VISION_PROVIDER=gemini
TTS_PROVIDER=groq
```

## Project Structure

```
Backend/
├── config/           # Django project settings
│   ├── settings.py   # Main settings with env vars
│   ├── urls.py       # URL routing
│   └── wsgi.py       # WSGI application
├── core/             # Core app (Story model, CRUD)
│   ├── models.py     # Story model
│   ├── serializers.py
│   ├── views.py      # Story API views
│   └── urls.py
├── generation/       # Generation app (AI endpoints)
│   ├── serializers.py
│   ├── views.py      # Generate story/audio views
│   ├── services.py   # Media upload service
│   └── urls.py
├── providers/        # AI provider abstraction
│   ├── base.py       # Abstract base classes
│   ├── registry.py   # Provider registry
│   ├── gemini.py     # Gemini vision + TTS
│   ├── groq.py       # Groq TTS
│   └── qwen.py       # Qwen TTS
├── requirements.txt
├── .env.example
└── manage.py
```

## Usage Examples

### Generate a Full Story

```bash
curl -X POST http://localhost:8000/api/generate/full/ \
  -F "image=@historical_photo.jpg" \
  -F "context=My grandfather at independence celebration" \
  -F "user_consented=true" \
  -F "is_public=true"
```

### Get Available Providers

```bash
curl http://localhost:8000/api/generate/providers/
```

### Get Public Gallery

```bash
curl http://localhost:8000/api/gallery/
```

## Storage

By default, media files are stored locally in the `media/` folder. To use Supabase Storage (S3-compatible), configure these environment variables:

```
SUPABASE_S3_ENDPOINT=https://your-project.supabase.co/storage/v1/s3
SUPABASE_S3_ACCESS_KEY=your-access-key
SUPABASE_S3_SECRET_KEY=your-secret-key
SUPABASE_BUCKET_IMAGES=mashujaa-images
SUPABASE_BUCKET_AUDIO=mashujaa-audio
```

## Development

### Create Superuser

```bash
python manage.py createsuperuser
```

### Access Admin

Visit `http://localhost:8000/admin/` to manage stories.

## Troubleshooting

### Rate Limit Errors

If you're experiencing rate limit errors with Gemini:
- The system automatically falls back to Groq's Llama Vision when Gemini hits rate limits
- Check backend logs for fallback activity: `python manage.py runserver` will show warnings when fallback is triggered
- Ensure your `GROQ_API_KEY` is valid for both providers to work
- If both providers fail, you'll receive an error message indicating the issue

### Both Providers Failing

If both Gemini and Groq vision providers fail:
1. Verify both API keys are valid: `GEMINI_API_KEY` and `GROQ_API_KEY`
2. Check your API quotas on both platforms
3. Review the error logs for specific failure reasons
4. You can manually set `VISION_PROVIDER=groq` in `.env` to use Groq as the primary provider

## License

MIT
