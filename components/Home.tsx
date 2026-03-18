import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, ChevronRight, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { wakeUpTtsProvider } from '../services/backendService';

const images = [
  "https://images.unsplash.com/photo-1533645782036-997947a9d529?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1670689708073-995104fd2e8d?q=80&w=1615&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1515658323406-25d61c141a6e?q=80&w=709&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1603703182693-51a19941fa59?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fGtlbnlhfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1515657241610-a6b33f0f6c5a?q=80&w=1576&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  // "https://images.unsplash.com/photo-1547926587-cfe2e564883a?q=80&w=2000&auto=format&fit=crop", // African landscape/people (sepia placeholder)
  "https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=2000&auto=format&fit=crop", // Vintage texture
  "https://images.unsplash.com/photo-1447958272669-9c562446304f?q=80&w=2000&auto=format&fit=crop"  // Nature/Hills
];

const Home: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  

  useEffect(() => {
    wakeUpTtsProvider();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden flex items-center justify-center">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${images[currentImage]})` }}
          />
        </AnimatePresence>
        {/* Overlays for readability and tint */}
        <div className="absolute inset-0 bg-heritage-green/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 text-sm font-medium tracking-wider uppercase text-papaya-100">
             <span className="w-2 h-2 rounded-full bg-papaya animate-pulse"></span>
             AI Storyteller
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight text-shadow-lg">
            Where Kenya’s <br/> 
            <span className="text-papaya italic">Past Speaks Again.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Upload a historical image. Let AI narrate its untold story.
            Rediscover the voices of Mashujaa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/upload" 
              className="group flex items-center gap-3 bg-papaya hover:bg-papaya-600 text-white text-lg font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <Upload size={20} />
              <span>Upload Photo</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/gallery" 
              className="group flex items-center gap-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 text-lg font-medium px-8 py-4 rounded-full transition-all duration-300"
            >
              <PlayCircle size={20} />
              <span>Explore Gallery</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 z-10 text-white/50"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent mx-auto"></div>
      </motion.div>
    </div>
  );
};

export default Home;