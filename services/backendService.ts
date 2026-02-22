/**
 * Backend API Service
 * Handles all communication with the Django backend
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface GenerateFullRequest {
  image: File;
  context?: string;
  user_consented: boolean;
  is_public: boolean;
  user_id?: string;
}

interface StoryData {
  title: string;
  content: string;
  year?: string;
  region?: string;
}

interface GenerateFullResponse {
  story: StoryData;
  audio_url: string;
  story_id: number;
  image_url: string;
}

interface GalleryStory {
  id: string;
  title: string;
  content: string;
  year: string | null;
  region: string | null;
  image_url: string;
  audio_url: string | null;
  created_at: string;
}

/**
 * Generate complete story with audio from an image
 */
export async function generateFullStory(request: GenerateFullRequest): Promise<GenerateFullResponse> {
  const formData = new FormData();
  formData.append('image', request.image);
  if (request.context) {
    formData.append('context', request.context);
  }
  formData.append('user_consented', request.user_consented.toString());
  formData.append('is_public', request.is_public.toString());
  formData.append('user_id', request.user_id || 'anonymous');

  const response = await fetch(`${API_BASE_URL}/api/generate/full/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Backend error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch public stories for the gallery
 */
export async function fetchGalleryStories(): Promise<GalleryStory[]> {
  const response = await fetch(`${API_BASE_URL}/api/gallery/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch gallery: ${response.status}`);
  }

  const data = await response.json();
  console.log("fetchGalleryStories: Received response from backend:", data);
  
  // Handle paginated response from Django REST Framework
  return data.results || data;
}


/**
 * Fetch a single story by ID
 */
export async function fetchStory(id: string): Promise<GalleryStory> {
  const response = await fetch(`${API_BASE_URL}/api/stories/${id}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch story: ${response.status}`);
  }

  return await response.json();
}

/**
 * Delete a story by ID
 */
export async function deleteStory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/stories/${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete story: ${response.status}`);
  }
}

/**
 * Get list of available providers
 */
export async function getProviders(): Promise<{ vision_providers: string[]; tts_providers: string[] }> {
  const response = await fetch(`${API_BASE_URL}/api/generate/providers/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch providers: ${response.status}`);
  }

  return await response.json();
}
