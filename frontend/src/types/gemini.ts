/**
 * Type definitions for Google Gemini API integration
 * Mashujaa Voices - Kenyan Heritage Storytelling Platform
 */

// Environment configuration
export interface GeminiConfig {
  apiKey: string;
  model?: string;
  visionModel?: string;
  ttsModel?: string;
  baseUrl?: string;
}

// Gemini API Request Types
export interface GeminiTextPart {
  text: string;
}

export interface GeminiInlineData {
  mimeType: string;
  data: string; // base64 encoded
}

export interface GeminiImagePart {
  inlineData: GeminiInlineData;
}

export type GeminiPart = GeminiTextPart | GeminiImagePart;

export interface GeminiContent {
  parts: GeminiPart[];
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export interface GeminiSpeechConfig {
  voiceConfig: {
    prebuiltVoiceConfig: {
      voiceName: string;
    };
  };
}

export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: GeminiGenerationConfig;
  config?: {
    responseModalities?: string[];
    speechConfig?: GeminiSpeechConfig;
  };
}

// Gemini API Response Types
export interface GeminiCandidate {
  content: {
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }>;
  };
  finishReason?: string;
  index?: number;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
}

// Application-specific types
export interface ImageAnalysisResult {
  description: string;
  culturalElements?: string[];
  suggestedThemes?: string[];
  imageUrl?: string;
  imageFilename?: string;
}

export interface StoryGenerationResult {
  story: string;
  title?: string;
  culturalContext?: string;
}

export interface VoiceSynthesisResult {
  audioData: string; // base64 encoded audio
  format: string;
  duration?: number;
  audioFileUrl?: string; // URL to saved audio file
  filename?: string; // Audio filename
}

export interface MashujaaStory {
  id: string;
  title: string;
  story: string;
  imageDescription: string;
  imageUrl?: string; // URL to the actual image file
  imageFilename?: string; // Filename of saved image file
  audioUrl?: string; // Can be either blob URL, file URL, or base64 data
  audioFormat?: string; // MIME type for audio
  audioFileName?: string; // Filename of saved audio file
  createdAt: string;
  culturalThemes?: string[];
}

// Hook return types
export interface UseImageAnalysisReturn {
  analyzeImage: (file: File, prompt?: string) => Promise<ImageAnalysisResult>;
  isLoading: boolean;
  error: string | null;
  result: ImageAnalysisResult | null;
}

export interface UseStoryGenerationReturn {
  generateStory: (imageDescription: string, userContext?: string) => Promise<StoryGenerationResult>;
  isLoading: boolean;
  error: string | null;
  result: StoryGenerationResult | null;
}

export interface UseVoiceSynthesisReturn {
  synthesizeVoice: (text: string, voiceName?: string) => Promise<VoiceSynthesisResult>;
  isLoading: boolean;
  error: string | null;
  result: VoiceSynthesisResult | null;
}

// Upload flow state
export interface UploadFlowState {
  step: 'upload' | 'analyzing' | 'generating-story' | 'generating-voice' | 'complete' | 'error';
  imageFile: File | null;
  userPrompt: string;
  imageAnalysis: ImageAnalysisResult | null;
  generatedStory: StoryGenerationResult | null;
  audioResult: VoiceSynthesisResult | null;
  error: string | null;
  progress: number;
}

// Store actions
export interface UploadFlowActions {
  setStep: (step: UploadFlowState['step']) => void;
  setImageFile: (file: File | null) => void;
  setUserPrompt: (prompt: string) => void;
  setImageAnalysis: (analysis: ImageAnalysisResult | null) => void;
  setGeneratedStory: (story: StoryGenerationResult | null) => void;
  setAudioResult: (audio: VoiceSynthesisResult | null) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
  saveStory: () => Promise<string | null>;
}