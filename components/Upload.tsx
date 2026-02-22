import React, { useState, useCallback, useRef } from 'react';
import { Upload as UploadIcon, X, FileImage, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { GeneratedContent, AppStatus } from '../types';
import Result from './Result';
import { generateFullStory } from '../services/backendService';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userConsented, setUserConsented] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setErrorMsg(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setErrorMsg(null);
    }
  };

  const clearImage = () => {
    setFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!imagePreview || !file) return;
    if (!userConsented) {
      setErrorMsg('You must consent to save your story.');
      return;
    }
    try {
      setStatus(AppStatus.ANALYZING);
      
      // Call backend API to generate full story with audio
      const response = await generateFullStory({
        image: file,
        context: context || undefined,
        user_consented: userConsented,
        is_public: isPublic,
        user_id: 'anonymous',
      });

      // Backend returns the story data, audio URL, and image URL
      setStatus(AppStatus.GENERATING_AUDIO);
      
      // Validate response before setting state
      if (!response.story || !response.story.title || !response.story.content) {
        throw new Error('Invalid response from backend: missing story data');
      }
      
      // Convert audio URL to the format expected by Result component
      setResult({
        story: response.story,
        audio: {
          blobUrl: response.audio_url,
          buffer: null, // Not needed when using URL
        },
        imageUrl: response.image_url,
      });
      
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleReset = () => {
    setResult(null);
    setStatus(AppStatus.IDLE);
    setContext('');
    clearImage();
  };

  if (result) {
    return <Result content={result} onBack={handleReset} />;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-heritage-green mb-3">Upload a Historical Photo</h2>
          <p className="text-stone-600">Let us help you uncover the story behind the image.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
          {status === AppStatus.IDLE || status === AppStatus.ERROR ? (
            <div className="p-8 md:p-12">
              {/* Upload Zone */}
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  imagePreview ? 'border-papaya bg-orange-50/50' : 'border-stone-300 hover:border-heritage-green hover:bg-stone-50'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!imagePreview ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4">
                       <UploadIcon size={32} />
                    </div>
                    <p className="text-lg font-medium text-stone-700 mb-2">Drag and drop your image here</p>
                    <p className="text-stone-500 text-sm mb-6">or click to browse from your device</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-heritage-green text-white rounded-lg hover:bg-green-800 transition-colors shadow-md"
                    >
                      Select Image
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-[400px] mx-auto rounded-lg shadow-md object-contain" 
                    />
                    <button 
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-papaya transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Context Input */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  What do you know about this image? (Optional)
                </label>
                <textarea 
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-papaya focus:border-transparent transition-shadow outline-none resize-none h-24 bg-stone-50"
                  placeholder="e.g. My grandfather in Nairobi, 1963..."
                />
              </div>


              {/* Consent and Gallery Visibility */}
              <div className="mt-6 flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userConsented}
                    onChange={e => setUserConsented(e.target.checked)}
                  />
                  <span className="text-stone-700 text-sm">I consent to saving my story and media to Supabase.</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    disabled={!userConsented}
                  />
                  <span className="text-stone-700 text-sm">Allow my story to appear in the public Gallery.</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!imagePreview || !userConsented}
                  className={`flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all ${
                    imagePreview && userConsented
                      ? 'bg-papaya text-white hover:bg-papaya-600 hover:-translate-y-1'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={20} />
                  <span>Generate Story</span>
                </button>
              </div>

              {errorMsg && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center">
                  {errorMsg}
                </div>
              )}
            </div>
          ) : (
             // Loading State
            <div className="p-12 min-h-[500px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full border-4 border-stone-100 border-t-papaya animate-spin mb-8"></div>
              
              <AnimatePresence mode='wait'>
                 {status === AppStatus.ANALYZING && (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                       <h3 className="text-2xl font-serif font-bold text-heritage-green mb-2">Analyzing Image...</h3>
                       <p className="text-stone-500">Identifying historical markers and context.</p>
                    </motion.div>
                 )}
                 {status === AppStatus.GENERATING_AUDIO && (
                    <motion.div
                      key="audio"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                       <h3 className="text-2xl font-serif font-bold text-heritage-green mb-2">Generating Narration...</h3>
                       <p className="text-stone-500">Creating a voice for the past.</p>
                    </motion.div>
                 )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;