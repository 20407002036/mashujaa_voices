/**
 * Custom Hooks for Mashujaa Voices AI Services
 * React hooks for image analysis, story generation, and voice synthesis
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  ImageAnalysisResult,
  StoryGenerationResult,
  VoiceSynthesisResult,
  UseImageAnalysisReturn,
  UseStoryGenerationReturn,
  UseVoiceSynthesisReturn,
} from '../types/gemini';
import { 
  getImageService, 
  getVoiceService,
  ImageAnalysisService 
} from '../services';

/**
 * Hook for image analysis using Gemini Vision
 */
export const useImageAnalysis = (): UseImageAnalysisReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);

  const analyzeImage = useCallback(async (file: File, prompt?: string): Promise<ImageAnalysisResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate image file
      const validation = ImageAnalysisService.validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const imageService = getImageService();
      const analysisResult = await imageService.analyzeImage(file, prompt);
      
      setResult(analysisResult);
      toast.success('Image analyzed successfully! 📸');
      
      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Image analysis failed';
      setError(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analyzeImage,
    isLoading,
    error,
    result,
  };
};

/**
 * Hook for generating Kenyan heritage stories
 */
export const useStoryGeneration = (): UseStoryGenerationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StoryGenerationResult | null>(null);

  const generateStory = useCallback(async (
    imageDescription: string, 
    userContext?: string
  ): Promise<StoryGenerationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const voiceService = getVoiceService();
      const storyResult = await voiceService.generateKenyanStory(imageDescription, userContext);
      
      setResult(storyResult);
      toast.success('Story generated! 📚 Ready for narration...');
      
      return storyResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Story generation failed';
      setError(errorMessage);
      toast.error(`Story generation failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateStory,
    isLoading,
    error,
    result,
  };
};

/**
 * Hook for voice synthesis using Gemini TTS
 */
export const useVoiceSynthesis = (): UseVoiceSynthesisReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceSynthesisResult | null>(null);

  const synthesizeVoice = useCallback(async (
    text: string, 
    voiceName: string = 'Kore'
  ): Promise<VoiceSynthesisResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const voiceService = getVoiceService();
      const voiceResult = await voiceService.synthesizeVoice(text, voiceName);
      
      setResult(voiceResult);
      toast.success('🎙️ Voice narration ready! Click to play your story.');
      
      return voiceResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voice synthesis failed';
      setError(errorMessage);
      toast.error(`Voice synthesis failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    synthesizeVoice,
    isLoading,
    error,
    result,
  };
};

/**
 * Combined hook for the complete storytelling workflow
 */
export const useStorytellingWorkflow = () => {
  const imageAnalysis = useImageAnalysis();
  const storyGeneration = useStoryGeneration();
  const voiceSynthesis = useVoiceSynthesis();

  const [currentStep, setCurrentStep] = useState<'idle' | 'analyzing' | 'generating' | 'synthesizing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  const processImage = useCallback(async (file: File, userPrompt?: string) => {
    try {
      setCurrentStep('analyzing');
      setProgress(25);
      
      // Step 1: Analyze image
      const analysisResult = await imageAnalysis.analyzeImage(file, userPrompt);
      setProgress(50);

      setCurrentStep('generating');
      
      // Step 2: Generate story
      const storyResult = await storyGeneration.generateStory(
        analysisResult.description, 
        userPrompt
      );
      setProgress(75);

      setCurrentStep('synthesizing');
      
      // Step 3: Synthesize voice (with fallback)
      let voiceResult = null;
      try {
        voiceResult = await voiceSynthesis.synthesizeVoice(storyResult.story);
        setProgress(100);
      } catch (voiceError) {
        console.warn('Voice synthesis failed, continuing without audio:', voiceError);
        toast.error('Voice synthesis failed, but your story is ready to read!');
        setProgress(100);
      }

      setCurrentStep('complete');
      
      return {
        analysis: analysisResult,
        story: storyResult,
        audio: voiceResult,
      };
    } catch (error) {
      setCurrentStep('idle');
      setProgress(0);
      throw error;
    }
  }, [imageAnalysis, storyGeneration, voiceSynthesis]);

  const reset = useCallback(() => {
    setCurrentStep('idle');
    setProgress(0);
  }, []);

  const isLoading = imageAnalysis.isLoading || storyGeneration.isLoading || voiceSynthesis.isLoading;
  const hasError = imageAnalysis.error || storyGeneration.error || voiceSynthesis.error;

  return {
    processImage,
    reset,
    currentStep,
    progress,
    isLoading,
    hasError,
    results: {
      analysis: imageAnalysis.result,
      story: storyGeneration.result,
      audio: voiceSynthesis.result,
    },
    services: {
      imageAnalysis,
      storyGeneration,
      voiceSynthesis,
    },
  };
};