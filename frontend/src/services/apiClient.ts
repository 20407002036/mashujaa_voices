/**
 * API Client Service - Flask Backend Integration
 * Handles HTTP requests to the Mashujaa Voices Flask backend
 */

// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// API Response Types
export interface ApiResponse {
  success: boolean;
  error?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface ImageAnalysisResponse extends ApiResponse {
  caption: string;
  model: string;
  description: string;
  cultural_elements: string[];
  culturalElements: string[];
  suggested_themes: string[];
  suggestedThemes: string[];
  image_url?: string;
  image_filename?: string;
}

export interface TextGenerationResponse extends ApiResponse {
  text: string;
  model: string;
}

export interface VoiceSynthesisResponse extends ApiResponse {
  audio_data: string; // base64 encoded
  voice_name: string;
  format: string;
  audio_file_url?: string; // URL to saved audio file
  audio_file_path?: string; // Server file path
  filename?: string; // Audio filename
}

export interface CombinedSpeechResponse extends ApiResponse {
  text: string;
  audio_data: string; // base64 encoded
  voice_name: string;
  text_model: string;
  format: string;
}

export interface VoicesResponse extends ApiResponse {
  voices: string[];
  default: string;
}

export interface StoriesResponse extends ApiResponse {
  stories: any[];
  count: number;
}

export interface StoryResponse extends ApiResponse {
  story: any;
}

export interface CategoriesResponse extends ApiResponse {
  categories: string[];
  count: number;
}

export interface ThemesResponse extends ApiResponse {
  themes: string[];
  count: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        // Only set Content-Type for non-FormData requests
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (data.success === false) {
          throw new Error(data.error || 'API request failed');
        }
        
        return data;
      } else {
        // Handle non-JSON responses (like file downloads)
        return response as unknown as T;
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Request failed: ${error}`);
      }
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/');
  }

  /**
   * Generate text using Gemini AI
   */
  async generateText(prompt: string, model?: string): Promise<TextGenerationResponse> {
    return this.request<TextGenerationResponse>('/api/generate-text', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        model: model || 'gemini-2.5-flash'
      }),
    });
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(
    text: string, 
    voiceName?: string, 
    format?: string,
    saveFile?: boolean
  ): Promise<VoiceSynthesisResponse> {
    console.log('🌐 API Client: TTS request starting...', {
      textLength: text?.length,
      voiceName,
      format,
      saveFile,
      url: `${this.baseUrl}/api/text-to-speech`
    });

    try {
      const response = await this.request<VoiceSynthesisResponse>('/api/text-to-speech', {
        method: 'POST',
        body: JSON.stringify({
          text,
          voice_name: voiceName || 'Kore',
          format: format || 'wav',
          save_file: saveFile !== false // Default to true
        }),
      });

      console.log('🌐 API Client: TTS response received:', {
        success: response.success,
        hasAudioData: !!response.audio_data,
        audioDataLength: response.audio_data?.length,
        format: response.format,
        voiceName: response.voice_name,
        hasFileUrl: !!response.audio_file_url,
        filename: response.filename
      });

      return response;
    } catch (error) {
      console.error('🌐 API Client: TTS request failed:', error);
      throw error;
    }
  }

  /**
   * Generate text and convert to speech in one step
   */
  async generateSpeech(
    prompt: string,
    voiceName?: string,
    textModel?: string
  ): Promise<CombinedSpeechResponse> {
    return this.request<CombinedSpeechResponse>('/api/generate-speech', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        voice_name: voiceName || 'Kore',
        text_model: textModel || 'gemini-2.5-flash'
      }),
    });
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<VoicesResponse> {
    return this.request<VoicesResponse>('/api/voices');
  }

  /**
   * Analyze image using Gemini Vision
   */
  async analyzeImage(imageFile: File, prompt?: string): Promise<ImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (prompt) {
      formData.append('prompt', prompt);
    }

    console.log('🌐 API Client: Image analysis request starting...', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      hasPrompt: !!prompt,
      url: `${this.baseUrl}/api/analyze-image`
    });

    try {
      const response = await this.request<ImageAnalysisResponse>('/api/analyze-image', {
        method: 'POST',
        // Don't set Content-Type header - let browser set it with boundary for FormData
        headers: {},
        body: formData,
      });

      console.log('🌐 API Client: Image analysis response received:', {
        success: response.success,
        hasCaption: !!response.caption,
        captionLength: response.caption?.length,
        hasCulturalElements: !!response.cultural_elements,
        model: response.model
      });

      return response;
    } catch (error) {
      console.error('🌐 API Client: Image analysis request failed:', error);
      throw error;
    }
  }

  /**
   * Get all stories with optional filtering
   */
  async getStories(category?: string, theme?: string): Promise<StoriesResponse> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (theme) params.append('theme', theme);
    
    const queryString = params.toString();
    const endpoint = `/api/stories${queryString ? '?' + queryString : ''}`;
    
    return this.request<StoriesResponse>(endpoint);
  }

  /**
   * Get a specific story by ID
   */
  async getStoryById(storyId: string): Promise<StoryResponse> {
    return this.request<StoryResponse>(`/api/stories/${storyId}`);
  }

  /**
   * Get featured stories for homepage carousel
   */
  async getFeaturedStories(limit?: number): Promise<StoriesResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/stories/featured${queryString ? '?' + queryString : ''}`;
    
    return this.request<StoriesResponse>(endpoint);
  }

  /**
   * Get available story categories
   */
  async getStoryCategories(): Promise<CategoriesResponse> {
    return this.request<CategoriesResponse>('/api/stories/categories');
  }

  /**
   * Get available cultural themes
   */
  async getCulturalThemes(): Promise<ThemesResponse> {
    return this.request<ThemesResponse>('/api/stories/themes');
  }

  /**
   * Create a new story
   */
  async createStory(storyData: any): Promise<StoryResponse> {
    return this.request<StoryResponse>('/api/stories', {
      method: 'POST',
      body: JSON.stringify(storyData),
    });
  }
}

// Default client instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  healthCheck: () => apiClient.healthCheck(),
  generateText: (prompt: string, model?: string) => apiClient.generateText(prompt, model),
  textToSpeech: (text: string, voiceName?: string, format?: string, saveFile?: boolean) => 
    apiClient.textToSpeech(text, voiceName, format, saveFile),
  generateSpeech: (prompt: string, voiceName?: string, textModel?: string) =>
    apiClient.generateSpeech(prompt, voiceName, textModel),
  getVoices: () => apiClient.getVoices(),
  analyzeImage: (imageFile: File, prompt?: string) => apiClient.analyzeImage(imageFile, prompt),
  
  // Stories API
  getStories: (category?: string, theme?: string) => apiClient.getStories(category, theme),
  getStoryById: (storyId: string) => apiClient.getStoryById(storyId),
  getFeaturedStories: (limit?: number) => apiClient.getFeaturedStories(limit),
  getStoryCategories: () => apiClient.getStoryCategories(),
  getCulturalThemes: () => apiClient.getCulturalThemes(),
  createStory: (storyData: any) => apiClient.createStory(storyData),
};