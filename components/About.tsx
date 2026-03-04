import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Github } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-stone-200"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-heritage-green mb-4">About Mashujaa Voices</h1>
          <div className="w-20 h-1 bg-papaya mx-auto rounded-full"></div>
        </div>

        <div className="space-y-6 text-lg text-stone-700 leading-relaxed font-serif">
          <p>
            <span className="font-bold text-papaya text-xl">"Every photo carries a voice."</span>
          </p>
          <p>
            Mashujaa Voices is an AI-powered archive dedicated to preserving Kenya’s untold histories. 
            In a rapidly modernizing world, physical photographs fade, and the oral traditions that accompanied them are often lost to time.
          </p>
          <p>
            Our platform bridges the gap between heritage and technology. By using advanced Generative AI, 
            we analyze visual cues in historical photographs to reconstruct the likely stories, contexts, and emotions of the moment.
          </p>
          
          <div className="bg-stone-50 p-6 rounded-lg border-l-4 border-papaya my-8 italic text-stone-600">
             "Mashujaa" is Swahili for "Heroes". We believe every Kenyan ancestor is a hero of their own story, 
             contributing to the tapestry of our nation.
          </div>

          <h3 className="text-2xl font-bold text-heritage-green mt-8">How it works</h3>
          <ul className="list-disc pl-6 space-y-2 text-base font-sans">
            <li><strong>Vision Analysis:</strong> AI scans clothing, architecture, and landscapes to determine era and location.</li>
            <li><strong>Story Generation:</strong> Based on historical data, a narrative is woven to describe the scene.</li>
            <li><strong>Voice Synthesis:</strong> A warm, documentary-style voice brings the text to life.</li>
          </ul>

          <div className="mt-12 text-center font-sans">
            <p className="text-sm text-stone-600 mb-4">Built with ❤️ by Solomon Kaniaru</p>
            <div className="flex justify-center gap-6">
              <a 
                href="https://twitter.com/KaniaruSolomon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-600 hover:text-papaya transition-colors duration-200"
              >
                <Twitter size={20} />
                <span className="text-sm font-medium">@KaniaruSolomon</span>
              </a>
              <a 
                href="https://github.com/20407002036" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-600 hover:text-heritage-green transition-colors duration-200"
              >
                <Github size={20} />
                <span className="text-sm font-medium">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;