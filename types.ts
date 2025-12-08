export interface StoryData {
  title: string;
  content: string;
  year?: string;
  region?: string;
}

export interface AudioState {
  buffer: AudioBuffer | null;
  blobUrl: string | null;
}

export interface GeneratedContent {
  story: StoryData;
  audio: AudioState;
  imageUrl: string; // Base64 or Object URL
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  excerpt: string;
  category: string;
  year: string;
}