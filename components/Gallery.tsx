
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { fetchGalleryStories, fetchStory } from '../services/backendService';
import Result from './Result';
import { GeneratedContent } from '../types';


const Gallery: React.FC = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<GeneratedContent | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  useEffect(() => {
    fetchGalleryStories()
      .then(data => {
        setStories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load stories.');
        setLoading(false);
      });
  }, []);

  const handleStoryClick = async (storyId: string) => {
    console.log('Card clicked! Story ID:', storyId);
    try {
      setLoadingStory(true);
      console.log('Fetching story from backend...');
      const fullStory = await fetchStory(storyId);
      console.log('Received full story:', fullStory);
      
      // Convert to GeneratedContent format for Result component
      setSelectedStory({
        story: {
          title: fullStory.title,
          content: fullStory.content,
          year: fullStory.year || undefined,
          region: fullStory.region || undefined,
        },
        audio: {
          buffer: null,
          blobUrl: fullStory.audio_url,
        },
        imageUrl: fullStory.image_url,
      });
      console.log('Selected story set, rendering Result component');
      setLoadingStory(false);
    } catch (err) {
      console.error('Failed to load story:', err);
      setLoadingStory(false);
    }
  };

  const handleBackToGallery = () => {
    setSelectedStory(null);
  };

  // If a story is selected, show Result component
  if (selectedStory) {
    return <Result content={selectedStory} onBack={handleBackToGallery} />;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
       <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-heritage-green mb-3">The Archives</h2>
          <p className="text-stone-600">Explore generated stories from our community.</p>
       </div>

       {loading ? (
         <div className="text-center py-20 text-stone-400">Loading stories...</div>
       ) : error ? (
         <div className="text-center py-20 text-red-500">{error}</div>
       ) : stories.length === 0 ? (
         <div className="text-center py-20 text-stone-400">No stories yet. Be the first to contribute!</div>
       ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
           {stories.map((item, index) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               onClick={() => handleStoryClick(item.id)}
               className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-stone-100 cursor-pointer"
             >
               <div className="relative aspect-[4/3] overflow-hidden">
                 <img 
                   src={item.image_url} 
                   alt={item.title} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter sepia-[0.2]"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                 <div className="absolute bottom-4 left-4 right-4 text-white">
                   <span className="text-xs font-bold bg-papaya px-2 py-0.5 rounded text-white mb-2 inline-block">
                     {item.year}
                   </span>
                   <h3 className="font-serif text-xl font-bold leading-tight mb-1">{item.title}</h3>
                 </div>
                 {/* Hover Overlay with Play Button */}
                 {item.audio_url && (
                   <div className="absolute inset-0 bg-heritage-green/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <audio controls src={item.audio_url} className="hidden" />
                      <button className="w-16 h-16 rounded-full bg-white text-papaya flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg"
                        onClick={e => {
                          e.stopPropagation();
                          const audio = (e.currentTarget.parentElement?.querySelector('audio') as HTMLAudioElement);
                          if (audio) audio.play();
                        }}
                      >
                        <Play size={32} fill="currentColor" className="ml-1" />
                      </button>
                   </div>
                 )}
               </div>
               <div className="p-5">
                 <p className="text-stone-600 text-sm line-clamp-3 leading-relaxed">
                   {item.excerpt || item.content}
                 </p>
                 <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center text-xs font-medium text-stone-400 uppercase tracking-wider">
                   <span>{item.category || item.region || 'Story'}</span>
                   <span>{item.audio_url ? 'Audio Available' : 'No Audio'}</span>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       )}
    </div>
  );
};

export default Gallery;