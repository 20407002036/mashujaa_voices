import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { useStoriesStore } from '../store/uploadFlowStore';
import { toast } from 'react-hot-toast';

const Story = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stories } = useStoriesStore();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Story page - ID from params:', id);
    console.log('Story page - Available stories:', stories);
    
    if (!id) {
      toast.error('No story ID provided');
      navigate('/gallery');
      return;
    }

    const foundStory = stories.find(s => s.id === id);
    console.log('Story page - Found story:', foundStory);
    console.log('Story page - Audio data check:', {
      hasAudioUrl: !!foundStory?.audioUrl,
      hasAudioFormat: !!foundStory?.audioFormat,
      audioUrlType: typeof foundStory?.audioUrl,
      audioUrlLength: foundStory?.audioUrl?.length,
      audioFormat: foundStory?.audioFormat
    });
    
    if (foundStory) {
      setStory(foundStory);
      setLoading(false);
    } else {
      console.error('Story not found with ID:', id);
      toast.error(`Story not found with ID: ${id}`);
      navigate('/gallery');
    }
  }, [id, stories, navigate]);

  if (loading || !story) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-light dark:text-text-dark">Loading story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-text-light/10 dark:border-text-dark/10 px-6 md:px-10 py-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M2 7L12 12L22 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M12 22V12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <h1 className="text-xl font-bold tracking-tight">Mashujaa Voices</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/gallery" className="text-primary font-semibold">Stories</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
        </nav>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="aspect-[3/4] w-full bg-surface-light dark:bg-surface-dark rounded-lg p-2 border border-text-light/10 dark:border-text-dark/10 shadow-lg">
              {story.imageUrl ? (
                <img 
                  src={`http://localhost:5000${story.imageUrl}`}
                  alt={story.title}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-subtle-light to-subtle-dark rounded flex items-center justify-center ${story.imageUrl ? 'hidden' : ''}`}>
                <p className="text-text-light dark:text-text-dark">Image Preview</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-light dark:text-text-dark">
                {story.title}
              </h2>
              <p className="text-accent-gold mt-1 text-sm">
                {new Date(story.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="mb-6 h-64 overflow-y-auto pr-4 rounded-lg bg-surface-light dark:bg-surface-dark/50 p-4 border border-text-light/10 dark:border-text-dark/10">
              <div className="text-base leading-relaxed text-text-light/90 dark:text-text-dark/80">
                {story.story.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            {(story.audioUrl || story.audioFormat) && (
              <div className="mb-8 p-4 rounded-lg bg-surface-light dark:bg-surface-dark">
                {typeof story.audioUrl === 'string' && story.audioUrl.startsWith('/api/audio/') ? (
                  // File URL from Flask backend - use HTML5 audio player with full URL
                  <div className="space-y-4">
                    <audio 
                      controls 
                      className="w-full"
                      preload="metadata"
                      crossOrigin="anonymous"
                    >
                      <source src={`http://localhost:5000${story.audioUrl}`} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                    <p className="text-sm text-gray-600">
                      Audio file: {story.audioFileName || 'Generated audio'}
                    </p>
                  </div>
                ) : typeof story.audioUrl === 'string' && story.audioUrl.startsWith('/') ? (
                  // Other file URLs
                  <div className="space-y-4">
                    <audio 
                      controls 
                      className="w-full"
                      preload="metadata"
                    >
                      <source src={story.audioUrl} type={story.audioFormat || 'audio/wav'} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  // Custom AudioPlayer for base64 audio data from AI generation
                  <AudioPlayer
                    audioData={story.audioUrl}
                    format={story.audioFormat || 'audio/wav'}
                    title={story.title}
                    autoPlay={false}
                    onEnded={() => console.log('Audio ended')}
                  />
                )}
              </div>
            )}

            {/* Debug info - remove this later */}
            <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Debug Info:</strong><br/>
              Has audioUrl: {!!story.audioUrl ? 'Yes' : 'No'}<br/>
              AudioUrl type: {typeof story.audioUrl}<br/>
              AudioUrl length: {story.audioUrl?.length || 0}<br/>
              Audio format: {story.audioFormat || 'none'}<br/>
              Audio filename: {story.audioFileName || 'none'}<br/>
              First 50 chars: {story.audioUrl?.substring?.(0, 50) || 'none'}...
            </div>

            <div className="mt-auto pt-6">
              <Link to="/gallery">
                <Button variant="secondary" className="inline-flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Story;
