/**
 * Custom hooks for story data management (API-based)
 * Mashujaa Voices - Kenyan Heritage Storytelling Platform
 */

import { useStoriesStore } from '../store/uploadFlowStore';
import { 
  useFeaturedStoriesApi, 
  useCategoriesApi, 
  useThemesApi, 
  useStoriesApi 
} from './useStoriesApi';

/**
 * Hook to get featured stories for homepage carousel
 * Returns a mix of API stories and user-created stories
 */
export const useFeaturedStories = () => {
  const { stories: userStories } = useStoriesStore();
  const { featuredStories: apiStories, isLoading, error } = useFeaturedStoriesApi();
  
  // If user has created stories, mix them with API stories
  if (userStories.length > 0) {
    // Mix of latest user stories and API stories
    const userStoriesFiltered = userStories.filter(story => !story.id.startsWith('sample-')).slice(0, 2);
    const combinedStories = [...apiStories.slice(0, 1), ...userStoriesFiltered];
    
    return {
      stories: combinedStories,
      isLoading,
      error
    };
  }
  
  return {
    stories: apiStories,
    isLoading,
    error
  };
};

/**
 * Hook to get story categories for filtering
 */
export const useStoryCategories = () => {
  return useCategoriesApi();
};

/**
 * Hook to get available cultural themes
 */
export const useCulturalThemes = () => {
  return useThemesApi();
};

/**
 * Hook to get stories by category
 */
export const useStoriesByCategory = (category: string) => {
  const { stories: userStories } = useStoriesStore();
  const { stories: apiStories, isLoading, error } = useStoriesApi(category);
  
  // Combine API stories with user stories
  const allStories = [...apiStories, ...userStories.filter(story => !story.id.startsWith('sample-'))];
  
  if (category === 'All Stories') {
    return {
      stories: allStories,
      isLoading,
      error
    };
  }
  
  const filteredStories = allStories.filter(story => 
    story.culturalThemes?.some(theme => 
      theme.toLowerCase().includes(category.toLowerCase())
    )
  );
  
  return {
    stories: filteredStories,
    isLoading,
    error
  };
};

/**
 * Hook to get recent stories (excluding samples for user content)
 */
export const useRecentStories = (limit: number = 5, excludeSamples: boolean = false) => {
  const { stories: userStories } = useStoriesStore();
  const { stories: apiStories, isLoading, error } = useStoriesApi();
  
  let allStories = [...apiStories, ...userStories];
  
  if (excludeSamples) {
    allStories = allStories.filter(story => !story.id.startsWith('sample-'));
  }
    
  return {
    stories: allStories.slice(0, limit),
    isLoading,
    error
  };
};