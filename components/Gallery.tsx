import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const mockStories = [
  {
    id: '1',
    title: 'Dedan Kimathi, 1956',
    year: '1956',
    category: 'Hero',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/25/Dedan_Kimathi.jpg',
    excerpt: 'Field Marshal Dedan Kimathi Waciuri stands defiant, a symbol of the Mau Mau uprising...',
  },
  {
    id: '2',
    title: 'Independence Day',
    year: '1963',
    category: 'Event',
    imageUrl: 'https://images.unsplash.com/photo-1532588326759-5778a4861214?auto=format&fit=crop&q=80&w=800', // Placeholder
    excerpt: 'The Union Jack lowers as the Kenyan flag rises for the first time, marking a new dawn...',
  },
  {
    id: '3',
    title: 'The Lunatic Express',
    year: '1901',
    category: 'Infrastructure',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=800', // Placeholder
    excerpt: 'Steam engines roar through the savannah, cutting a path that would define modern Kenya...',
  },
  {
    id: '4',
    title: 'Wangari Maathai',
    year: '2004',
    category: 'Hero',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Wangari_Maathai_2001.jpg', 
    excerpt: 'Planting seeds of peace and democracy, one tree at a time.',
  },
  {
    id: '5',
    title: 'Traditional Maasai Ceremony',
    year: '1970s',
    category: 'Culture',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800', // Placeholder
    excerpt: 'Vibrant reds and intricate beads tell stories of rites of passage...',
  },
  {
    id: '6',
    title: 'Nairobi Skyline',
    year: '1980',
    category: 'City',
    imageUrl: 'https://images.unsplash.com/photo-1626284695029-79f8c1483cb1?auto=format&fit=crop&q=80&w=800',
    excerpt: 'A city growing from a swamp into the Green City in the Sun.',
  }
];

const Gallery: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
       <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-heritage-green mb-3">The Archives</h2>
          <p className="text-stone-600">Explore generated stories from our community.</p>
          
          {/* Filters (Visual only for demo) */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['All', 'Heroes', 'Culture', 'Events', '1950s', '1960s'].map((filter, idx) => (
              <button 
                key={filter} 
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  idx === 0 
                  ? 'bg-heritage-green text-white border-heritage-green' 
                  : 'bg-white text-stone-600 border-stone-300 hover:border-papaya hover:text-papaya'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
         {mockStories.map((item, index) => (
           <motion.div 
             key={item.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: index * 0.1 }}
             className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-stone-100"
           >
             <div className="relative aspect-[4/3] overflow-hidden">
               <img 
                 src={item.imageUrl} 
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
               <div className="absolute inset-0 bg-heritage-green/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <button className="w-16 h-16 rounded-full bg-white text-papaya flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                    <Play size={32} fill="currentColor" className="ml-1" />
                  </button>
               </div>
             </div>

             <div className="p-5">
               <p className="text-stone-600 text-sm line-clamp-3 leading-relaxed">
                 {item.excerpt}
               </p>
               <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center text-xs font-medium text-stone-400 uppercase tracking-wider">
                 <span>{item.category}</span>
                 <span>Audio Available</span>
               </div>
             </div>
           </motion.div>
         ))}
       </div>
    </div>
  );
};

export default Gallery;