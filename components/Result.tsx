import React from 'react';
import { GeneratedContent } from '../types';
import AudioPlayer from './AudioPlayer';
import { RotateCcw, Share2, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultProps {
  content: GeneratedContent;
  onBack: () => void;
}

const Result: React.FC<ResultProps> = ({ content, onBack }) => {
  const { story, audio, imageUrl } = content;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column: Image */}
          <div className="relative bg-stone-900 flex items-center justify-center p-6 lg:p-12 lg:min-h-[600px]">
            <div className="absolute inset-0 bg-black/30 z-0"></div>
            <img 
              src={imageUrl} 
              alt={story.title} 
              className="relative z-10 max-h-[500px] w-auto max-w-full rounded-lg shadow-2xl border-4 border-white/10" 
            />
          </div>

          {/* Right Column: Story & Audio */}
          <div className="p-8 lg:p-12 flex flex-col h-full bg-heritage-cream">
             {/* Header */}
             <div className="mb-6">
               <div className="flex items-center gap-3 text-papaya text-sm font-bold tracking-widest uppercase mb-2">
                  <span className="w-8 h-[1px] bg-papaya"></span>
                  {story.year || 'Historical Archive'}
               </div>
               <h1 className="font-serif text-3xl md:text-4xl font-bold text-heritage-green leading-tight">
                 {story.title}
               </h1>
               {story.region && (
                 <p className="text-stone-500 mt-2 font-medium italic">{story.region}</p>
               )}
             </div>

             {/* Audio Player */}
             <div className="mb-8">
               <AudioPlayer audioBuffer={audio.buffer} blobUrl={audio.blobUrl} />
             </div>

             {/* Story Text */}
             <div className="relative flex-grow overflow-y-auto max-h-[400px] pr-2 scrollbar-hide mb-8">
               <Quote className="absolute top-0 left-0 text-stone-200 -z-10 transform -translate-x-2 -translate-y-2" size={60} />
               <p className="text-stone-700 leading-relaxed text-lg whitespace-pre-wrap font-serif">
                 {story.content}
               </p>
             </div>

             {/* Actions */}
             <div className="mt-auto pt-6 border-t border-stone-200 flex flex-wrap gap-4">
               <button 
                 onClick={onBack}
                 className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-heritage-green transition-colors font-medium"
               >
                 <RotateCcw size={18} />
                 <span>Narrate Another</span>
               </button>
               <button 
                 onClick={() => {
                   if (navigator.share) {
                     navigator.share({
                       title: story.title,
                       text: story.content,
                     }).catch(console.error);
                   } else {
                     alert("Sharing is not supported on this browser.");
                   }
                 }}
                 className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-heritage-green text-white hover:bg-green-800 transition-colors font-medium shadow-md ml-auto"
               >
                 <Share2 size={18} />
                 <span>Share Story</span>
               </button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Result;