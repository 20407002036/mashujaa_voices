import React, { useState, useCallback, useRef } from 'react';
import { Upload as UploadIcon, X, FileImage, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { GeneratedContent, AppStatus, ValidationDetails } from '../types';
import Result from './Result';
import { generateFullStory } from '../services/backendService';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [storyId, setStoryId] = useState<string | undefined>(undefined);
  const [userConsented, setUserConsented] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [validationWarning, setValidationWarning] = useState<ValidationDetails | null>(null);
  const [requiresApproval, setRequiresApproval] = useState(false);
  
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

  const handleGenerate = async (forceGenerate: boolean = false) => {
    if (!imagePreview || !file) return;
    if (!userConsented) {
      setErrorMsg('You must consent to save your story.');
      return;
    }
    try {
      setStatus(AppStatus.ANALYZING);
      setErrorMsg(null);
      setValidationWarning(null);
      
      // Call backend API to generate full story with audio
      const response = await generateFullStory({
        image: file,
        context: context || undefined,
        user_consented: userConsented,
        is_public: isPublic,
        user_id: 'anonymous',
        force_generate: forceGenerate,
      });

      // Backend returns the story data, audio URL, and image URL
      setStatus(AppStatus.GENERATING_AUDIO);
      
      // Log the response for debugging
      console.log('Backend response:', response);
      console.log('Image URL:', response.image_url);
      console.log('Audio URL:', response.audio_url);
      
      // Check if story requires approval
      if (response.requires_approval) {
        setRequiresApproval(true);
      }
      
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
      setStoryId(response.story_id ? String(response.story_id) : undefined);
      
      console.log('Set result with imageUrl:', response.image_url);
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.IDLE);
      
      // Check if it's a validation warning
      if (err.errorType === 'validation_warning' && err.validationDetails) {
        setValidationWarning(err.validationDetails);
      } else {
        setErrorMsg(err.message || "Something went wrong. Please try again.");
      }
    }
  };
  
  const handleForceGenerate = () => {
    setValidationWarning(null);
    handleGenerate(true);
  };
  
  const handleCancelValidation = () => {
    setValidationWarning(null);
    setStatus(AppStatus.IDLE);
  };

  const handleReset = () => {
    setResult(null);
    setStoryId(undefined);
    setStatus(AppStatus.IDLE);
    setContext('');
    clearImage();
  };

  if (result) {
    return (
      <>
        <Result content={result} storyId={storyId} onBack={handleReset} />
        {requiresApproval && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-amber-100 text-amber-900 px-6 py-4 rounded-lg shadow-xl border border-amber-300 max-w-md text-center">
            <AlertTriangle className="inline-block mr-2" size={20} />
            <span className="font-medium">Your story is pending moderator approval before appearing in the gallery.</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      {/* Validation Warning Modal */}
      <AnimatePresence>
        {validationWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCancelValidation}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="text-amber-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-heritage-green mb-2">
                    This doesn't appear to be a historical photo
                  </h3>
                  <p className="text-stone-600 text-sm mb-4">
                    {validationWarning.reason}
                  </p>
                  {validationWarning.issues && validationWarning.issues.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-amber-900 mb-2">Issues detected:</p>
                      <ul className="text-xs text-amber-800 space-y-1">
                        {validationWarning.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-600">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-stone-500 italic">
                    Confidence: {Math.round(validationWarning.confidence * 100)}%
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>You can still proceed,</strong> but your submission will require moderator approval before appearing in the public gallery.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelValidation}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleForceGenerate}
                  className="flex-1 px-4 py-3 rounded-lg bg-papaya text-white font-medium hover:bg-papaya-600 transition-colors shadow-md"
                >
                  Upload Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  onClick={() => handleGenerate(false)}
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