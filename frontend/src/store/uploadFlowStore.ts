/**
 * Zustand Store for Mashujaa Voices Upload Flow
 * Manages state for the complete storytelling workflow and local storage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import {
  UploadFlowState,
  UploadFlowActions,
  MashujaaStory,
  // ImageAnalysisResult,
  // StoryGenerationResult,
  // VoiceSynthesisResult,
} from '../types/gemini';

// Initial state
const initialState: UploadFlowState = {
  step: 'upload',
  imageFile: null,
  userPrompt: '',
  imageAnalysis: null,
  generatedStory: null,
  audioResult: null,
  error: null,
  progress: 0,
};

// Upload flow store
interface UploadFlowStore extends UploadFlowState, UploadFlowActions {}

export const useUploadFlowStore = create<UploadFlowStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setStep: (step) => set({ step }),
      
      setImageFile: (imageFile) => set({ imageFile }),
      
      setUserPrompt: (userPrompt) => set({ userPrompt }),
      
      setImageAnalysis: (imageAnalysis) => set({ imageAnalysis }),
      
      setGeneratedStory: (generatedStory) => set({ generatedStory }),
      
      setAudioResult: (audioResult) => set({ audioResult }),
      
      setError: (error) => set({ error }),
      
      setProgress: (progress) => set({ progress }),

      reset: () => set(initialState),

      saveStory: async () => {
        const state = get();
        
        console.log('saveStory called, checking state:', {
          hasGeneratedStory: !!state.generatedStory,
          hasImageAnalysis: !!state.imageAnalysis,
          generatedStory: state.generatedStory,
          imageAnalysis: state.imageAnalysis
        });
        
        if (!state.generatedStory || !state.imageAnalysis) {
          console.error('Missing required data for saving story:', {
            generatedStory: !!state.generatedStory,
            imageAnalysis: !!state.imageAnalysis
          });
          toast.error('No story to save');
          return null;
        }

        try {
          // Create story object with persistent audio storage
          const story: MashujaaStory = {
            id: `story-${Date.now()}`,
            title: state.generatedStory.title || 'Untitled Story',
            story: state.generatedStory.story,
            imageDescription: state.imageAnalysis.description,
            imageUrl: state.imageAnalysis.imageUrl || undefined,
            imageFilename: state.imageAnalysis.imageFilename || undefined,
            // Store both base64 data and file URL for flexibility
            audioUrl: state.audioResult?.audioFileUrl || state.audioResult?.audioData || undefined,
            audioFormat: state.audioResult?.format || undefined,
            audioFileName: state.audioResult?.filename || undefined,
            createdAt: new Date().toISOString(),
            culturalThemes: state.imageAnalysis.suggestedThemes,
          };

          console.log('Created story object:', story);

          // Save to stories store
          useStoriesStore.getState().addStory(story);
          toast.success('Story saved to your collection! 📚');
          
          console.log('Story saved successfully, returning ID:', story.id);
          // Return the story ID for navigation
          return story.id;
        } catch (error) {
          console.error('Error saving story:', error);
          toast.error('Failed to save story');
          return null;
        }
      },
    }),
    {
      name: 'upload-flow',
      storage: createJSONStorage(() => sessionStorage), // Use session storage for workflow state
      partialize: (state) => ({
        // Only persist the current workflow state, not the files
        step: state.step,
        userPrompt: state.userPrompt,
        progress: state.progress,
        error: state.error,
      }),
    }
  )
);

// Stories collection store for persistent storage
interface StoriesState {
  stories: MashujaaStory[];
  isLoading: boolean;
  error: string | null;
}

interface StoriesActions {
  addStory: (story: MashujaaStory) => void;
  removeStory: (id: string) => void;
  updateStory: (id: string, updates: Partial<MashujaaStory>) => void;
  getStory: (id: string) => MashujaaStory | undefined;
  clearAllStories: () => void;
  clearOldStories: () => void;
  removeAudioFromStories: () => void;
  exportStories: () => void;
  saveAllStoriesToJSON: () => void;
  importStories: (stories: MashujaaStory[]) => void;
}

interface StoriesStore extends StoriesState, StoriesActions {}

export const useStoriesStore = create<StoriesStore>()(
  persist(
    (set, get) => ({
      // State - Initialize with empty array (stories will be loaded from API)
      stories: [],
      isLoading: false,
      error: null,

      // Actions
      addStory: (story) => {
        try {
          set((state) => ({
            stories: [story, ...state.stories], // Add new stories at the beginning
          }));
          
          // Also save to JSON file for backup
          const updatedStories = [story, ...get().stories];
          saveStoriesToJSON(updatedStories);
        } catch (error) {
          // Handle storage quota exceeded
          if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded, attempting cleanup...');
            
            // Remove oldest stories with audio data to free space
            const state = get();
            const storiesWithoutAudio = state.stories.map(s => ({
              ...s,
              audioUrl: undefined,
              audioFormat: undefined
            }));
            
            try {
              // Try saving without audio data
              set({ stories: [{ ...story, audioUrl: undefined, audioFormat: undefined }, ...storiesWithoutAudio] });
              toast.error('Story saved but audio removed due to storage limits. Consider clearing old stories.');
            } catch (secondError) {
              // If still failing, keep only recent stories
              const recentStories = state.stories.slice(0, 5); // Keep only 5 most recent
              set({ stories: [story, ...recentStories] });
              toast.error('Storage full! Removed old stories to save new one.');
            }
          } else {
            throw error; // Re-throw if it's not a quota error
          }
        }
      },

      removeStory: (id) => {
        set((state) => ({
          stories: state.stories.filter((story) => story.id !== id),
        }));
        toast.success('Story removed');
      },

      updateStory: (id, updates) => {
        set((state) => ({
          stories: state.stories.map((story) =>
            story.id === id ? { ...story, ...updates } : story
          ),
        }));
      },

      getStory: (id) => {
        return get().stories.find((story) => story.id === id);
      },

      clearAllStories: () => {
        set({ stories: [] });
        toast.success('All stories cleared');
      },

      clearOldStories: () => {
        const state = get();
        // Keep only the 5 most recent stories
        const recentStories = state.stories.slice(0, 5);
        set({ stories: recentStories });
        toast.success(`Cleared old stories, kept ${recentStories.length} most recent`);
      },

      removeAudioFromStories: () => {
        const state = get();
        const storiesWithoutAudio = state.stories.map(story => ({
          ...story,
          audioUrl: undefined,
          audioFormat: undefined
        }));
        set({ stories: storiesWithoutAudio });
        toast.success('Removed audio from all stories to free storage space');
      },

      exportStories: () => {
        const stories = get().stories;
        
        if (stories.length === 0) {
          toast.error('No stories to export');
          return;
        }
        
        // Force download all stories
        const exportData = {
          metadata: {
            exportDate: new Date().toISOString(),
            version: "1.0",
            totalStories: stories.length,
            platform: "Mashujaa Voices Frontend",
            exportType: "manual"
          },
          stories: stories
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const fileName = `mashujaa-stories-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(link.href);
        
        toast.success(`📄 Exported ${stories.length} stories as ${fileName}!`);
      },

      saveAllStoriesToJSON: () => {
        const stories = get().stories;
        saveStoriesToJSON(stories);
      },

      importStories: (importedStories) => {
        // Validate imported stories
        const validStories = importedStories.filter(isValidStory);
        
        set((state) => ({
          stories: [...validStories, ...state.stories],
        }));
        
        toast.success(`Imported ${validStories.length} stories! 📚`);
      },
    }),
    {
      name: 'mashujaa-stories',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// Helper functions
function saveStoriesToJSON(stories: MashujaaStory[]) {
  try {
    // Create JSON data with metadata
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
        totalStories: stories.length,
        platform: "Mashujaa Voices Frontend"
      },
      stories: stories
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    
    // Save as downloadable file
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const fileName = `mashujaa-stories-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName;
    
    // Auto-download in development, or when explicitly requested
    if (import.meta.env.DEV || stories.length === 1) {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Stories saved to: ${fileName}`);
      toast.success(`Stories saved as ${fileName}`, { duration: 3000 });
    }
    
    // Clean up the blob URL
    URL.revokeObjectURL(link.href);
    
    // Also save to a persistent location if we have one
    saveToPersistentStorage(exportData);
    
  } catch (error) {
    console.error('Error saving stories to JSON:', error);
    toast.error('Failed to save stories as JSON');
  }
}

// Save to persistent storage (localStorage backup + indexedDB)
function saveToPersistentStorage(exportData: any) {
  try {
    // Save a backup in localStorage with timestamp
    const backupKey = `mashujaa-backup-${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(backupKey, JSON.stringify(exportData));
    
    // Keep only the last 7 days of backups
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(key => key.startsWith('mashujaa-backup-'));
    
    if (backupKeys.length > 7) {
      backupKeys.sort();
      const oldKeys = backupKeys.slice(0, backupKeys.length - 7);
      oldKeys.forEach(key => localStorage.removeItem(key));
    }
    
    console.log(`📚 Backup created: ${backupKey}`);
  } catch (error) {
    console.error('Error creating backup:', error);
  }
}

function isValidStory(story: any): story is MashujaaStory {
  return (
    story &&
    typeof story.id === 'string' &&
    typeof story.title === 'string' &&
    typeof story.story === 'string' &&
    typeof story.imageDescription === 'string' &&
    typeof story.createdAt === 'string'
  );
}

// Selector hooks for better performance
export const useCurrentStory = () => useUploadFlowStore((state) => ({
  step: state.step,
  progress: state.progress,
  imageAnalysis: state.imageAnalysis,
  generatedStory: state.generatedStory,
  audioResult: state.audioResult,
  error: state.error,
}));

export const useStoriesCount = () => useStoriesStore((state) => state.stories.length);

export const useRecentStories = (limit: number = 5) => 
  useStoriesStore((state) => state.stories.slice(0, limit));

// Progress helper
export const getProgressMessage = (step: UploadFlowState['step']): string => {
  switch (step) {
    case 'upload':
      return 'Upload your image to begin...';
    case 'analyzing':
      return 'Analyzing your image for cultural elements...';
    case 'generating-story':
      return 'Creating your Kenyan heritage story...';
    case 'generating-voice':
      return 'Generating voice narration...';
    case 'complete':
      return 'Your story is ready! 🎉';
    case 'error':
      return 'Something went wrong. Please try again.';
    default:
      return 'Processing...';
  }
};