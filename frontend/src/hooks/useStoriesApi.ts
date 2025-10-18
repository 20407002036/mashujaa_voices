/**
 * Stories API hooks - Replaces hardcoded sampleStories with API calls
 * Mashujaa Voices - Kenyan Heritage Storytelling Platform
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/apiClient';
import { MashujaaStory } from '../types/gemini';

// Loading state interface
interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Stories hook return type
interface UseStoriesReturn extends LoadingState {
  stories: MashujaaStory[];
  refreshStories: () => Promise<void>;
}

// Featured stories hook return type
interface UseFeaturedStoriesReturn extends LoadingState {
  featuredStories: MashujaaStory[];
  refreshFeatured: () => Promise<void>;
}

// Categories hook return type
interface UseCategoriesReturn extends LoadingState {
  categories: string[];
  refreshCategories: () => Promise<void>;
}

// Themes hook return type
interface UseThemesReturn extends LoadingState {
  themes: string[];
  refreshThemes: () => Promise<void>;
}

/**
 * Hook to fetch all stories from the API
 */
export const useStoriesApi = (category?: string, theme?: string): UseStoriesReturn => {
  const [stories, setStories] = useState<MashujaaStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching stories from API...', { category, theme });
      
      const response = await api.getStories(category, theme);
      
      if (response.success && response.stories) {
        setStories(response.stories);
        console.log('✅ Stories loaded successfully:', {
          count: response.stories.length,
          category,
          theme
        });
      } else {
        throw new Error('Failed to fetch stories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Failed to fetch stories:', errorMessage);
      
      // Set empty array on error
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, theme]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    isLoading,
    error,
    refreshStories: fetchStories,
  };
};

/**
 * Hook to fetch featured stories from the API
 */
export const useFeaturedStoriesApi = (limit: number = 3): UseFeaturedStoriesReturn => {
  const [featuredStories, setFeaturedStories] = useState<MashujaaStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching featured stories from API...', { limit });
      
      const response = await api.getFeaturedStories(limit);
      
      if (response.success && response.stories) {
        setFeaturedStories(response.stories);
        console.log('✅ Featured stories loaded successfully:', {
          count: response.stories.length,
          limit
        });
      } else {
        throw new Error('Failed to fetch featured stories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Failed to fetch featured stories:', errorMessage);
      
      // Set empty array on error
      setFeaturedStories([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return {
    featuredStories,
    isLoading,
    error,
    refreshFeatured: fetchFeatured,
  };
};

/**
 * Hook to fetch story categories from the API
 */
export const useCategoriesApi = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching categories from API...');
      
      const response = await api.getStoryCategories();
      
      if (response.success && response.categories) {
        setCategories(response.categories);
        console.log('✅ Categories loaded successfully:', {
          count: response.categories.length
        });
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Failed to fetch categories:', errorMessage);
      
      // Set default categories on error
      setCategories(['All Stories']);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refreshCategories: fetchCategories,
  };
};

/**
 * Hook to fetch cultural themes from the API
 */
export const useThemesApi = (): UseThemesReturn => {
  const [themes, setThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching themes from API...');
      
      const response = await api.getCulturalThemes();
      
      if (response.success && response.themes) {
        setThemes(response.themes);
        console.log('✅ Themes loaded successfully:', {
          count: response.themes.length
        });
      } else {
        throw new Error('Failed to fetch themes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Failed to fetch themes:', errorMessage);
      
      // Set empty array on error
      setThemes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return {
    themes,
    isLoading,
    error,
    refreshThemes: fetchThemes,
  };
};

/**
 * Hook to fetch a single story by ID
 */
export const useStoryByIdApi = (storyId: string) => {
  const [story, setStory] = useState<MashujaaStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching story by ID from API...', { storyId });
      
      const response = await api.getStoryById(storyId);
      
      if (response.success && response.story) {
        setStory(response.story);
        console.log('✅ Story loaded successfully:', {
          id: response.story.id,
          title: response.story.title
        });
      } else {
        throw new Error('Story not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Failed to fetch story:', errorMessage);
      
      // Set null on error
      setStory(null);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    if (storyId) {
      fetchStory();
    }
  }, [fetchStory, storyId]);

  return {
    story,
    isLoading,
    error,
    refreshStory: fetchStory,
  };
};

/**
 * Hook for creating a new story
 */
export const useCreateStoryApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStory = useCallback(async (storyData: Partial<MashujaaStory>): Promise<MashujaaStory | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Creating new story...', { title: storyData.title });
      
      const response = await api.createStory(storyData);
      
      if (response.success && response.story) {
        console.log('✅ Story created successfully:', {
          id: response.story.id,
          title: response.story.title
        });
        return response.story;
      } else {
        throw new Error('Failed to create story');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Failed to create story:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createStory,
    isLoading,
    error,
  };
};

// Compatibility hooks for gradual migration
/**
 * @deprecated Use useStoriesApi instead
 */
export const useStoriesByCategory = (category: string) => {
  console.warn('useStoriesByCategory is deprecated. Use useStoriesApi with category parameter instead.');
  return useStoriesApi(category);
};

/**
 * @deprecated Use useFeaturedStoriesApi instead
 */
export const useFeaturedStories = () => {
  console.warn('useFeaturedStories is deprecated. Use useFeaturedStoriesApi instead.');
  return useFeaturedStoriesApi();
};

/**
 * @deprecated Use useCategoriesApi instead
 */
export const useStoryCategories = () => {
  console.warn('useStoryCategories is deprecated. Use useCategoriesApi instead.');
  return useCategoriesApi();
};

/**
 * @deprecated Use useThemesApi instead
 */
export const useCulturalThemes = () => {
  console.warn('useCulturalThemes is deprecated. Use useThemesApi instead.');
  return useThemesApi();
};