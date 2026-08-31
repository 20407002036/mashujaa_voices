"""
Django settings for Mashujaa Voices Backend.
"""

import os
from pathlib import Path
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environ
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, ['localhost', '127.0.0.1']),
    VISION_PROVIDER=(str, 'gemini'),
    TTS_PROVIDER=(str, 'groq'),
)

# Read .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY', default='django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ALLOWED_HOSTS = env('ALLOWED_HOSTS')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'corsheaders',
    'storages',
    # Local apps
    'core',
    'generation',
    'providers',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases
# Configure PostgreSQL via DATABASE_URL env var:
# postgresql://user:password@localhost:5432/dbname
# Defaults to SQLite for development

DATABASES = {
    'default': env.db('DATABASE_URL', default=f'sqlite:///{BASE_DIR / "db.sqlite3"}')
}

# PostgreSQL connection pooling (if using PostgreSQL)
if 'postgresql' in DATABASES['default']['ENGINE']:
    DATABASES['default']['CONN_MAX_AGE'] = 600  # 10 minutes
    DATABASES['default']['OPTIONS'] = {
        'connect_timeout': 10,
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}


# CORS
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:5173',
    'http://127.0.0.1:5173',
])
CORS_ALLOW_CREDENTIALS = True

# Backend URL for proxy endpoints
BACKEND_URL = env('BACKEND_URL', default='http://localhost:8000')

# AI Provider Settings
VISION_PROVIDER = env('VISION_PROVIDER')
TTS_PROVIDER = env('TTS_PROVIDER')

# Gemini
GEMINI_API_KEY = env('GEMINI_API_KEY', default='')
GEMINI_VALIDATION_MODEL = env('GEMINI_VALIDATION_MODEL', default='gemini-2.0-flash-lite')
GEMINI_ANALYSIS_MODEL = env('GEMINI_ANALYSIS_MODEL', default='gemini-2.5-flash')
GEMINI_TTS_MODEL = env('GEMINI_TTS_MODEL', default='gemini-2.5-flash-preview-tts')
GEMINI_TTS_VOICES = env.list('GEMINI_TTS_VOICES', default=['Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede'])
GEMINI_TTS_DEFAULT_VOICE = env('GEMINI_TTS_DEFAULT_VOICE', default='Kore')

# Groq
GROQ_API_KEY = env('GROQ_API_KEY', default='')
GROQ_TTS_MODEL = env('GROQ_TTS_MODEL', default='canopylabs/orpheus-v1-english')
GROQ_TTS_VOICES = env.list('GROQ_TTS_VOICES', default=['autumn', 'diana', 'hannah', 'austin', 'daniel', 'troy'])
GROQ_TTS_DEFAULT_VOICE = env('GROQ_TTS_DEFAULT_VOICE', default='autumn')
GROQ_TTS_ENDPOINT = env('GROQ_TTS_ENDPOINT', default='https://api.groq.com/openai/v1/audio/speech')
GROQ_VISION_MODEL = env('GROQ_VISION_MODEL', default='meta-llama/llama-4-scout-17b-16e-instruct')

# DashScope (Qwen)
DASHSCOPE_API_KEY = env('DASHSCOPE_API_KEY', default='')
QWEN_TTS_MODEL = env('QWEN_TTS_MODEL', default='qwen3-tts-flash')
QWEN_TTS_VOICES = env.list('QWEN_TTS_VOICES', default=['Cherry', 'Serena', 'Ethan', 'Chelsie'])
QWEN_TTS_DEFAULT_VOICE = env('QWEN_TTS_DEFAULT_VOICE', default='Cherry')
QWEN_TTS_ENDPOINT = env('QWEN_TTS_ENDPOINT', default='https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/synthesis')

# Edge TTS
EDGE_TTS_URL = env('EDGE_TTS_URL', default='https://openai-edge-tts-lf7c.onrender.com')
EDGE_TTS_VOICES = env.list('EDGE_TTS_VOICES', default=['autumn', 'diana', 'hannah', 'austin', 'daniel', 'troy'])

# Model Parameters
VISION_TEMPERATURE = env.float('VISION_TEMPERATURE', default=0.3)
VISION_MAX_TOKENS = env.int('VISION_MAX_TOKENS', default=1000)
VALIDATION_TEMPERATURE = env.float('VALIDATION_TEMPERATURE', default=0.5)
VALIDATION_MAX_TOKENS = env.int('VALIDATION_MAX_TOKENS', default=300)
TTS_SAMPLE_RATE = env.int('TTS_SAMPLE_RATE', default=24000)
TTS_TIMEOUT = env.float('TTS_TIMEOUT', default=60.0)


# Supabase Storage (S3-compatible)
SUPABASE_URL = env('SUPABASE_URL', default='')
SUPABASE_KEY = env('SUPABASE_KEY', default='')
SUPABASE_S3_ENDPOINT = env('SUPABASE_S3_ENDPOINT', default='')
SUPABASE_S3_ACCESS_KEY = env('SUPABASE_S3_ACCESS_KEY', default='')
SUPABASE_S3_SECRET_KEY = env('SUPABASE_S3_SECRET_KEY', default='')
SUPABASE_BUCKET_IMAGES = env('SUPABASE_BUCKET_IMAGES', default='mashujaa-images')
SUPABASE_BUCKET_AUDIO = env('SUPABASE_BUCKET_AUDIO', default='mashujaa-audio')

# Configure django-storages for Supabase S3 if credentials are provided
if SUPABASE_S3_ACCESS_KEY and SUPABASE_S3_SECRET_KEY:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_ACCESS_KEY_ID = SUPABASE_S3_ACCESS_KEY
    AWS_SECRET_ACCESS_KEY = SUPABASE_S3_SECRET_KEY
    AWS_STORAGE_BUCKET_NAME = SUPABASE_BUCKET_IMAGES
    AWS_S3_ENDPOINT_URL = SUPABASE_S3_ENDPOINT
    AWS_S3_REGION_NAME = 'auto'
    AWS_DEFAULT_ACL = 'public-read'
    AWS_QUERYSTRING_AUTH = False  # No signed URLs, direct public access
    AWS_S3_FILE_OVERWRITE = False
    AWS_S3_CUSTOM_DOMAIN = None  # Direct S3 URLs
    # Cache control for browser caching
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',  # 24 hours
    }