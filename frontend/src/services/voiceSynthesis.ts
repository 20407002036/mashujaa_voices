/**
 * Voice Synthesis Service - Flask Backend Integration
 * Mashujaa Voices - Kenyan Heritage Storytelling Platform
 */

import { 
  GeminiConfig, 
  VoiceSynthesisResult,
  StoryGenerationResult,
  MashujaaStory 
} from '../types/gemini';
import { api } from './apiClient';

export class VoiceSynthesisService {
  constructor(config?: GeminiConfig) {
    // Config is no longer needed since we're using Flask backend
    // but keep for compatibility with existing code
    if (config) {
      // Suppress unused parameter warning
    }
  }

  /**
   * Generate speech from Kenyan story text
   */
  async synthesizeVoice(
    text: string, 
    voiceName: string = 'Kore'
  ): Promise<VoiceSynthesisResult> {
    console.log('🎙️ VoiceSynthesis: Starting synthesis...', {
      textLength: text?.length,
      voiceName,
      text: text?.substring(0, 100) + '...'
    });

    try {
      // Prepare the text for Kenyan storytelling narration
      const narrativeText = this.prepareNarrativeText(text);
      
      console.log('🎙️ VoiceSynthesis: Prepared narrative text:', {
        originalLength: text?.length,
        narrativeLength: narrativeText?.length,
        narrativeText: narrativeText?.substring(0, 100) + '...'
      });

      // Call Flask backend instead of Gemini directly
      console.log('🎙️ VoiceSynthesis: Calling Flask API...');
      const response = await api.textToSpeech(narrativeText, voiceName);
      
      console.log('🎙️ VoiceSynthesis: Received response:', {
        hasAudioData: !!response.audio_data,
        audioDataLength: response.audio_data?.length,
        format: response.format,
        voiceName: response.voice_name
      });

      return {
        audioData: response.audio_data,
        format: response.format,
        duration: this.estimateAudioDuration(text),
        audioFileUrl: response.audio_file_url,
        filename: response.filename,
      };
    } catch (error) {
      console.error('🎙️ VoiceSynthesis: Error occurred:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        console.error('🎙️ VoiceSynthesis: Error details:', {
          message: error.message,
          stack: error.stack
        });
        
        if (error.message.includes('Content-Length') || error.message.includes('Network')) {
          throw new Error(`Network error during voice synthesis. The backend server might be unavailable. Please try again later.`);
        }
        if (error.message.includes('quota') || error.message.includes('limit')) {
          throw new Error(`API quota exceeded. Please check your Gemini API usage limits.`);
        }
        if (error.message.includes('invalid') || error.message.includes('auth')) {
          throw new Error(`API authentication failed. Please check your API key configuration on the backend.`);
        }
        if (error.message.includes('preview') || error.message.includes('not available')) {
          throw new Error(`TTS preview model is not available. This feature might require special access.`);
        }
        throw new Error(`Voice synthesis failed: ${error.message}`);
      }
      
      throw new Error(`Voice synthesis failed: Unknown error`);
    }
  }

  /**
   * Generate story from image analysis and then synthesize voice
   */
  async generateStoryAndVoice(
    imageDescription: string,
    userContext?: string,
    voiceName: string = 'Kore'
  ): Promise<{ story: StoryGenerationResult; audio: VoiceSynthesisResult }> {
    // First generate the story
    const story = await this.generateKenyanStory(imageDescription, userContext);
    
    // Then synthesize the voice
    const audio = await this.synthesizeVoice(story.story, voiceName);

    return { story, audio };
  }

  /**
   * Generate a Kenyan heritage story from image analysis
   */
  async generateKenyanStory(
    imageDescription: string,
    userContext?: string
  ): Promise<StoryGenerationResult> {
    try {
      const storyPrompt = this.createStoryPrompt(imageDescription, userContext);
      
      // Call Flask backend instead of Gemini directly
      const response = await api.generateText(storyPrompt);
      const generatedText = response.text;

      // Extract title and story from the generated text
      const { title, story, culturalContext } = this.parseStoryResponse(generatedText);

      return {
        story,
        title,
        culturalContext,
      };
    } catch (error) {
      console.error('Error generating story:', error);
      throw new Error(`Story generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a culturally-aware prompt for Kenyan storytelling
   */
  private createStoryPrompt(imageDescription: string, userContext?: string): string {
    const basePrompt = `
You are a modern Kenyan narrator — witty, expressive, and emotionally intelligent — observing a historical or cultural image. 
You speak with the heart of a Gen Z Kenyan who appreciates the past but lives in the present.

Based on the following image description, create a spoken-style narration that:

1. Paints a vivid picture of what’s happening in the image, using natural, conversational language.  
2. Captures the expressions, atmosphere, and emotions of the people in the picture.  
3. Relates the moment to modern Kenyan life — drawing contrasts, humor, or reflection.  
4. Inspires the listener to appreciate history and heritage in a fresh, relatable way.  
5. Is around 1–2 minutes when spoken aloud.  
6. Avoids heavy academic or formal tone — it should feel human, youthful, and real.

**Image Description:** ${imageDescription}

${userContext ? `Additional Context: ${userContext}` : ''}

Please structure your response as:

**TITLE:** [Short catchy title or quote-like line]  
**NARRATION:** [The spoken narration text]  
**REFLECTION:** [One or two sentences that sum up the feeling or message]  

Tone reference: modern Kenyan Gen Z — think smooth storytelling like a TikTok voiceover or Instagram reel with meaning; respectful, funny, but real. Use Kenyan English or light Sheng expressions naturally if it fits.`;

    return basePrompt;
  }

  /**
   * Parse the generated story response
   */
  private parseStoryResponse(text: string): { title: string; story: string; culturalContext: string } {
    const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n|STORY:)/i);
    const storyMatch = text.match(/STORY:\s*([\s\S]*?)(?:CULTURAL_CONTEXT:|$)/i);
    const contextMatch = text.match(/CULTURAL_CONTEXT:\s*([\s\S]*?)$/i);

    return {
      title: titleMatch?.[1]?.trim() || 'A Kenyan Story',
      story: storyMatch?.[1]?.trim() || text,
      culturalContext: contextMatch?.[1]?.trim() || '',
    };
  }

  /**
   * Prepare text for natural narration
   */
  private prepareNarrativeText(text: string): string {
    // Add pauses and natural speech patterns
    let narrativeText = text
      .replace(/\./g, '. ') // Add space after periods
      .replace(/,/g, ', ') // Add space after commas
      .replace(/\n\n/g, '\n\n[pause] ') // Add pauses for paragraphs
      .replace(/"/g, '') // Remove quotes for better narration
      .trim();

    // Add storytelling introduction
    narrativeText = `Listen carefully to this story from the heart of Kenya... ${narrativeText}`;

    return narrativeText;
  }

  /**
   * Estimate audio duration based on text length
   */
  private estimateAudioDuration(text: string): number {
    // Average speaking rate: ~150 words per minute
    const words = text.split(/\s+/).length;
    const minutes = words / 150;
    return Math.ceil(minutes * 60); // Return duration in seconds
  }

  /**
   * Convert base64 audio to blob URL for playback
   */
  static createAudioUrl(base64Data: string, mimeType: string = 'audio/wav'): string {
    try {
      // Validate base64 data
      if (!base64Data || base64Data.length === 0) {
        throw new Error('Empty audio data');
      }

      console.log('Processing audio format:', mimeType);

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const audioData = new Uint8Array(byteNumbers);
      
      // Check if it's PCM format that needs conversion to WAV
      if (mimeType.includes('L16') || mimeType.includes('pcm')) {
        console.log('Converting PCM to WAV format...');
        const wavData = VoiceSynthesisService.convertPCMToWAV(audioData, mimeType);
        
        // Create a proper ArrayBuffer for the Blob
        const arrayBuffer = new ArrayBuffer(wavData.length);
        const view = new Uint8Array(arrayBuffer);
        view.set(wavData);
        
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
        
        console.log('Created WAV blob:', {
          size: blob.size,
          type: blob.type,
          originalSize: audioData.length
        });
        
        return URL.createObjectURL(blob);
      }
      
      // For other formats, try as-is first
      const finalMimeType = mimeType || 'audio/wav';
      const blob = new Blob([audioData], { type: finalMimeType });
      
      console.log('Created blob:', {
        size: blob.size,
        type: blob.type,
        dataLength: base64Data.length
      });
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating audio URL:', error);
      throw new Error(`Failed to create audio URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert PCM audio data to WAV format
   */
  static convertPCMToWAV(pcmData: Uint8Array, mimeType: string): Uint8Array {
    // Parse sample rate from MIME type (default 24000)
    const sampleRateMatch = mimeType.match(/rate=(\d+)/);
    const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1]) : 24000;
    
    const numChannels = 1; // Mono
    const bitsPerSample = 16; // 16-bit
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    
    // Calculate lengths
    const dataLength = pcmData.length;
    const fileLength = 36 + dataLength;
    
    // Create WAV header
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, fileLength, true);  // File size
    view.setUint32(8, 0x57415645, false); // "WAVE"
    
    // fmt sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);          // Sub-chunk size
    view.setUint16(20, 1, true);           // Audio format (PCM)
    view.setUint16(22, numChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true);  // Sample rate
    view.setUint32(28, byteRate, true);    // Byte rate
    view.setUint16(32, blockAlign, true);  // Block align
    view.setUint16(34, bitsPerSample, true); // Bits per sample
    
    // data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataLength, true);  // Data size
    
    // Combine header and data
    const wavData = new Uint8Array(44 + dataLength);
    wavData.set(new Uint8Array(wavHeader), 0);
    wavData.set(pcmData, 44);
    
    console.log('WAV conversion complete:', {
      sampleRate,
      channels: numChannels,
      bitsPerSample,
      originalSize: pcmData.length,
      wavSize: wavData.length
    });
    
    return wavData;
  }

  /**
   * Create audio result object from saved story data
   */
  static createAudioResultFromStory(story: MashujaaStory): VoiceSynthesisResult | null {
    if (!story.audioUrl || typeof story.audioUrl !== 'string') {
      return null;
    }

    return {
      audioData: story.audioUrl,
      format: story.audioFormat || 'audio/wav',
      duration: undefined // Will be calculated when loaded
    };
  }

  /**
   * Save audio data as WAV file
   */
  static async saveAudioFile(
    base64Data: string, 
    filename: string = 'mashujaa-story.wav'
  ): Promise<void> {
    const audioUrl = VoiceSynthesisService.createAudioUrl(base64Data);
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    URL.revokeObjectURL(audioUrl);
  }
}

// Default service instance
let defaultVoiceService: VoiceSynthesisService | null = null;

/**
 * Initialize the default voice synthesis service
 */
export const initializeVoiceService = (): VoiceSynthesisService => {
  // No longer need API key since we're using Flask backend
  const config: GeminiConfig = {
    apiKey: '', // Not used anymore
    ttsModel: '',
    model: '',
  };

  defaultVoiceService = new VoiceSynthesisService(config);
  return defaultVoiceService;
};

/**
 * Get the default voice service instance
 */
export const getVoiceService = (): VoiceSynthesisService => {
  if (!defaultVoiceService) {
    return initializeVoiceService();
  }
  return defaultVoiceService;
};