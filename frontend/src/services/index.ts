/**
 * Services Index - Mashujaa Voices Frontend
 * Exports all AI services for the heritage storytelling platform
 * Now using Flask backend instead of direct Gemini API calls
 */

// Image Analysis
export { 
  ImageAnalysisService,
  initializeImageService,
  getImageService 
} from './imageAnalysis';

// Voice Synthesis & Story Generation
export { 
  VoiceSynthesisService,
  initializeVoiceService,
  getVoiceService 
} from './voiceSynthesis';

// API Client for Flask backend
export { 
  ApiClient,
  apiClient,
  api 
} from './apiClient';

// Import the functions for internal use
import { initializeImageService } from './imageAnalysis';
import { initializeVoiceService } from './voiceSynthesis';
import { api } from './apiClient';

// Initialize all services
export const initializeAllServices = () => {
  try {
    const imageService = initializeImageService();
    const voiceService = initializeVoiceService();
    
    console.log('✅ Mashujaa Voices services initialized successfully (using Flask backend)');
    
    return {
      imageService,
      voiceService,
      api,
    };
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
};

// Service configuration check - now checks Flask backend connectivity
export const checkServiceConfiguration = async () => {
  try {
    // Test Flask backend connectivity
    const healthCheck = await api.healthCheck();
    
    if (healthCheck.status === 'healthy') {
      return {
        configured: true,
        backend: '✅ Flask backend connected',
        message: healthCheck.message || 'Backend is running',
      };
    } else {
      throw new Error('Backend health check failed');
    }
  } catch (error) {
    return {
      configured: false,
      backend: '❌ Flask backend not accessible',
      message: `Cannot connect to Flask backend at localhost:5000. ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};