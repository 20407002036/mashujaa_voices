/**
 * Image Analysis Service - Flask Backend Integration
 * Mashujaa Voices - Kenyan Heritage Storytelling Platform
 */

import { 
  GeminiConfig, 
  ImageAnalysisResult 
} from '../types/gemini';
import { api } from './apiClient';

export class ImageAnalysisService {
  constructor(config?: GeminiConfig) {
    // Config is no longer needed since we're using Flask backend
    // but keep for compatibility with existing code
    if (config) {
      // Suppress unused parameter warning
    }
  }

  /**
   * Analyze an image and extract cultural context for Kenyan storytelling
   */
  async analyzeImage(
    imageFile: File, 
    userPrompt?: string
  ): Promise<ImageAnalysisResult> {
    try {
      // Prepare the prompt for cultural context
      const defaultPrompt = `Analyze this image with focus on Kenyan cultural elements, heritage, and storytelling potential. 
      Describe:
      1. What you see in detail
      2. Any cultural elements (clothing, architecture, landscapes, people, traditions)
      3. Historical or cultural significance
      4. Emotional tone and atmosphere
      5. Elements that could inspire a Kenyan heritage story
      
      Be specific about cultural details that could help create an authentic Kenyan narrative.`;
      
      const prompt = userPrompt 
        ? `${defaultPrompt}\n\nAdditional context from user: ${userPrompt}`
        : defaultPrompt;

      // Call Flask backend instead of Gemini directly
      const response = await api.analyzeImage(imageFile, prompt);
      const analysisText = response.caption;

      // Extract cultural themes and elements from the response
      const culturalElements = this.extractCulturalElements(analysisText);
      const suggestedThemes = this.extractSuggestedThemes(analysisText);

      return {
        description: analysisText,
        culturalElements,
        suggestedThemes,
        imageUrl: response.image_url,
        imageFilename: response.image_filename,
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract cultural elements from analysis text
   */
  private extractCulturalElements(text: string): string[] {
    const culturalKeywords = [
      'kikuyu', 'luo', 'maasai', 'kalenjin', 'kamba', 'luhya', 'kisii', 'meru',
      'traditional', 'heritage', 'cultural', 'tribal', 'ceremony', 'ritual',
      'beadwork', 'pottery', 'weaving', 'cloth', 'kanga', 'kitenge',
      'village', 'homestead', 'savanna', 'acacia', 'baobab',
      'elder', 'storyteller', 'griot', 'wisdom', 'ancestor'
    ];

    return culturalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Extract suggested themes for story generation
   */
  private extractSuggestedThemes(text: string): string[] {
    const themes = [];
    
    if (text.includes('family') || text.includes('generation')) {
      themes.push('Family Heritage');
    }
    if (text.includes('traditional') || text.includes('ceremony')) {
      themes.push('Cultural Traditions');
    }
    if (text.includes('landscape') || text.includes('nature')) {
      themes.push('Connection to Land');
    }
    if (text.includes('elder') || text.includes('wisdom')) {
      themes.push('Ancestral Wisdom');
    }
    if (text.includes('community') || text.includes('village')) {
      themes.push('Community Bonds');
    }

    return themes;
  }

  /**
   * Validate image file before processing
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'); // 5MB
    const supportedFormats = import.meta.env.VITE_SUPPORTED_FORMATS?.split(',') || [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'
    ];

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` 
      };
    }

    if (!supportedFormats.includes(file.type)) {
      return { 
        valid: false, 
        error: `Unsupported format. Please use: ${supportedFormats.join(', ')}` 
      };
    }

    return { valid: true };
  }
}

// Default service instance
let defaultImageService: ImageAnalysisService | null = null;

/**
 * Initialize the default image analysis service
 */
export const initializeImageService = (): ImageAnalysisService => {
  // No longer need API key since we're using Flask backend
  const config: GeminiConfig = {
    apiKey: '', // Not used anymore
    visionModel: '',
    model: '',
  };

  defaultImageService = new ImageAnalysisService(config);
  return defaultImageService;
};

/**
 * Get the default image service instance
 */
export const getImageService = (): ImageAnalysisService => {
  if (!defaultImageService) {
    return initializeImageService();
  }
  return defaultImageService;
};