from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from google import genai
from google.genai import types
import wave
import os
import io
import tempfile
from datetime import datetime
from dotenv import load_dotenv
from image import analyze_image
from data.stories import stories_repository, MashujaaStory

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS configuration for both development and production
allowed_origins = [
    "http://localhost:3000", 
    "http://localhost:5173", 
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:5173"
]

# Add production origins if available
if os.getenv('FRONTEND_URL'):
    allowed_origins.append(os.getenv('FRONTEND_URL'))

CORS(app, 
     origins=allowed_origins + ["https://*.vercel.app"], 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Accept"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     vary_header=False)

# Add manual CORS headers to ensure both localhost:3000 and localhost:5173 work
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    allowed_origins_list = ['http://localhost:3000', 'http://localhost:5173','http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://192.168.1.8:3000']
    if origin and (origin in allowed_origins_list or '.vercel.app' in origin):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept'
    return response

# Create temporary directories for serverless environment
AUDIO_DIR = os.path.join(tempfile.gettempdir(), 'audio_files')
os.makedirs(AUDIO_DIR, exist_ok=True)

IMAGE_DIR = os.path.join(tempfile.gettempdir(), 'uploaded_images')
os.makedirs(IMAGE_DIR, exist_ok=True)

# Initialize Gemini client
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

def wave_file_bytes(pcm, channels=1, rate=24000, sample_width=2):
    """Convert PCM data to WAV file bytes"""
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm)
    buffer.seek(0)
    return buffer.getvalue()

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Mashijaa Voices API is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/generate-text', methods=['POST'])
def generate_text():
    """Generate text using Gemini AI"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({'error': 'Prompt is required'}), 400
        
        prompt = data['prompt']
        model = data.get('model', 'gemini-2.5-flash')
        
        response = client.models.generate_content(
            model=model,
            contents=prompt
        )
        
        return jsonify({
            'success': True,
            'text': response.text,
            'model': model,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech using Gemini TTS"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        voice_name = data.get('voice_name', 'Kore')
        format_type = data.get('format', 'wav')  # wav, file, or both
        save_file = data.get('save_file', True)  # Default to saving files
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-tts",
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name,
                        )
                    )
                ),
            )
        )
        
        audio_data = response.candidates[0].content.parts[0].inline_data.data
        wav_bytes = wave_file_bytes(audio_data)
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f'speech_{timestamp}_{voice_name.lower()}.wav'
        
        if format_type == 'file':
            # Return audio file only
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
                tmp_file.write(wav_bytes)
                tmp_file_path = tmp_file.name
            
            return send_file(
                tmp_file_path,
                mimetype='audio/wav',
                as_attachment=True,
                download_name=filename
            )
        else:
            # Return JSON response with optional file saving
            import base64
            audio_base64 = base64.b64encode(wav_bytes).decode('utf-8')
            
            audio_file_path = None
            if save_file:
                # Save audio file to filesystem
                audio_file_path = os.path.join(AUDIO_DIR, filename)
                with open(audio_file_path, 'wb') as f:
                    f.write(wav_bytes)
                
                # Return relative URL for frontend
                audio_file_url = f'/api/audio/{filename}'
                
                return jsonify({
                    'success': True,
                    'audio_data': audio_base64,
                    'audio_file_url': audio_file_url,
                    'audio_file_path': audio_file_path,
                    'filename': filename,
                    'voice_name': voice_name,
                    'format': 'wav',
                    'timestamp': datetime.now().isoformat()
                })
            else:
                # Return base64 data only
                return jsonify({
                    'success': True,
                    'audio_data': audio_base64,
                    'voice_name': voice_name,
                    'format': 'wav',
                    'timestamp': datetime.now().isoformat()
                })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate-speech', methods=['POST'])
def generate_speech():
    """Generate text and convert to speech in one step"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({'error': 'Prompt is required'}), 400
        
        prompt = data['prompt']
        voice_name = data.get('voice_name', 'Kore')
        text_model = data.get('text_model', 'gemini-2.5-flash')
        
        # First generate text
        text_response = client.models.generate_content(
            model=text_model,
            contents=prompt
        )
        
        generated_text = text_response.text
        
        # Then convert to speech
        speech_response = client.models.generate_content(
            model="gemini-2.5-flash-preview-tts",
            contents=generated_text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name,
                        )
                    )
                ),
            )
        )
        
        audio_data = speech_response.candidates[0].content.parts[0].inline_data.data
        
        # Return base64 encoded audio data with text
        import base64
        wav_bytes = wave_file_bytes(audio_data)
        audio_base64 = base64.b64encode(wav_bytes).decode('utf-8')
        
        return jsonify({
            'success': True,
            'text': generated_text,
            'audio_data': audio_base64,
            'voice_name': voice_name,
            'text_model': text_model,
            'format': 'wav',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/voices', methods=['GET'])
def get_available_voices():
    """Get list of available voices"""
    # Common Gemini TTS voices
    voices = [
        'Kore',
        'Charon',
        'Fenrir',
        'Aoede',
        'Puck'
    ]
    
    return jsonify({
        'success': True,
        'voices': voices,
        'default': 'Kore'
    })

@app.route('/api/images/<filename>', methods=['GET'])
def serve_image(filename):
    """Serve uploaded image files"""
    try:
        image_file_path = os.path.join(IMAGE_DIR, filename)
        if os.path.exists(image_file_path):
            # Determine MIME type based on file extension
            file_ext = os.path.splitext(filename)[1].lower()
            mime_types = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.bmp': 'image/bmp'
            }
            mime_type = mime_types.get(file_ext, 'image/jpeg')
            
            response = send_file(
                image_file_path,
                mimetype=mime_type,
                as_attachment=False
            )
            # Add headers for better caching
            response.headers['Cache-Control'] = 'public, max-age=86400'  # 24 hours
            return response
        else:
            return jsonify({'error': 'Image file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    """Serve saved audio files"""
    try:
        audio_file_path = os.path.join(AUDIO_DIR, filename)
        if os.path.exists(audio_file_path):
            response = send_file(
                audio_file_path,
                mimetype='audio/wav',
                as_attachment=False,
                conditional=True  # Enable range requests for better browser support
            )
            # Add additional headers for better browser compatibility
            response.headers['Accept-Ranges'] = 'bytes'
            response.headers['Cache-Control'] = 'public, max-age=3600'
            return response
        else:
            return jsonify({'error': 'Audio file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image_route():
    return analyze_image()

# Stories API Endpoints
@app.route('/api/stories', methods=['GET'])
def get_all_stories():
    """Get all stories with optional filtering"""
    try:
        category = request.args.get('category')
        theme = request.args.get('theme')
        
        if category:
            stories = stories_repository.get_stories_by_category(category)
        elif theme:
            stories = stories_repository.get_stories_by_theme(theme)
        else:
            stories = stories_repository.get_all_stories()
        
        return jsonify({
            'success': True,
            'stories': stories,
            'count': len(stories),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stories/<story_id>', methods=['GET'])
def get_story_by_id(story_id):
    """Get a specific story by ID"""
    try:
        story = stories_repository.get_story_by_id(story_id)
        
        if not story:
            return jsonify({
                'success': False,
                'error': 'Story not found'
            }), 404
        
        return jsonify({
            'success': True,
            'story': story,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stories/featured', methods=['GET'])
def get_featured_stories():
    """Get featured stories for homepage carousel"""
    try:
        limit = int(request.args.get('limit', 3))
        stories = stories_repository.get_featured_stories(limit)
        
        return jsonify({
            'success': True,
            'stories': stories,
            'count': len(stories),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stories/categories', methods=['GET'])
def get_story_categories():
    """Get available story categories"""
    try:
        categories = stories_repository.get_categories()
        
        return jsonify({
            'success': True,
            'categories': categories,
            'count': len(categories),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stories/themes', methods=['GET'])
def get_cultural_themes():
    """Get available cultural themes"""
    try:
        themes = stories_repository.get_themes()
        
        return jsonify({
            'success': True,
            'themes': themes,
            'count': len(themes),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stories', methods=['POST'])
def create_story():
    """Create a new story"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        required_fields = ['id', 'title', 'story', 'imageDescription']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Create new story object
        new_story = MashujaaStory(
            id=data['id'],
            title=data['title'],
            story=data['story'],
            image_description=data['imageDescription'],
            image_url=data.get('imageUrl'),
            image_filename=data.get('imageFilename'),
            audio_url=data.get('audioUrl'),
            audio_format=data.get('audioFormat'),
            audio_filename=data.get('audioFileName'),
            created_at=data.get('createdAt'),
            cultural_themes=data.get('culturalThemes', [])
        )
        
        success = stories_repository.add_story(new_story)
        
        if success:
            return jsonify({
                'success': True,
                'story': new_story.to_dict(),
                'message': 'Story created successfully',
                'timestamp': datetime.now().isoformat()
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create story'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Vercel serverless function handler
def handler(request):
    return app

# For local development
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Mashujaa Voices API on port {port}")
    print(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)