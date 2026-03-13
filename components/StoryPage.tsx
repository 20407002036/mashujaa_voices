import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPublicStory } from '../services/backendService';
import Result from './Result';
import { GeneratedContent } from '../types';

const StoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetchPublicStory(id)
      .then((story) => {
        if (!story) {
          setNotFound(true);
        } else {
          setContent({
            story: {
              title: story.title,
              content: story.content,
              year: story.year || undefined,
              region: story.region || undefined,
            },
            audio: {
              buffer: null,
              blobUrl: story.audio_url,
            },
            imageUrl: story.image_url,
          });
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500 text-lg">Loading story...</p>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <p className="text-stone-600 text-lg">This story could not be found or is not publicly available.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-heritage-green text-white rounded-full hover:bg-green-800 transition-colors font-medium"
        >
          Go Home
        </button>
      </div>
    );
  }

  return <Result content={content} storyId={id} viewOnly onBack={() => navigate('/')} />;
};

export default StoryPage;
