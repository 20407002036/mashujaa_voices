import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Upload as UploadIcon, 
  Camera, 
  FileText, 
  Mic, 
  ImageIcon,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStorytellingWorkflow } from '../hooks/useGeminiServices';
import { useUploadFlowStore, useStoriesStore } from '../store/uploadFlowStore';
import { ImageAnalysisService } from '../services/imageAnalysis';

const Upload = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  
  const {
    processImage,
    currentStep,
    isLoading
  } = useStorytellingWorkflow();

  const {
    setImageFile,
    setUserPrompt: setStorePrompt,
    setImageAnalysis,
    setGeneratedStory,
    setAudioResult,
    saveStory
  } = useUploadFlowStore();

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file
    const validation = ImageAnalysisService.validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setUploadedFile(file);
    toast.success('Image uploaded successfully!');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB to match mockup
  });

  const handleGenerateStory = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an image first');
      return;
    }

    setImageFile(uploadedFile);
    setStorePrompt(userPrompt);
    
    try {
      console.log('📤 Upload: Starting processImage...', { 
        fileName: uploadedFile.name, 
        fileSize: uploadedFile.size,
        userPrompt: userPrompt || 'none'
      });
      
      const results = await processImage(uploadedFile, userPrompt || undefined);
      
      console.log('📤 Upload: processImage completed:', {
        hasAnalysis: !!results?.analysis,
        hasStory: !!results?.story,
        hasAudio: !!results?.audio,
        audioDetails: results?.audio ? {
          hasAudioData: !!results.audio.audioData,
          audioDataLength: results.audio.audioData?.length,
          format: results.audio.format
        } : 'no audio'
      });
      
      if (results) {
        console.log('📤 Upload: Saving results to store...');
        
        // Save the results to the store before calling saveStory
        setImageAnalysis(results.analysis);
        setGeneratedStory(results.story);
        if (results.audio) {
          console.log('📤 Upload: Setting audio result...', {
            hasAudioData: !!results.audio.audioData,
            audioDataLength: results.audio.audioData?.length,
            format: results.audio.format
          });
          setAudioResult(results.audio);
        } else {
          console.warn('📤 Upload: No audio result to save');
        }
        
        console.log('📤 Upload: Calling saveStory...');
        // Save the story and get the returned story ID
        const storyId = await saveStory();
        
        console.log('📤 Upload: saveStory returned:', storyId);
        
        if (storyId) {
          console.log('Navigating to story:', storyId);
          // Navigate to the story page with the actual story ID
          navigate(`/story/${storyId}`);
          toast.success('Story generated and saved successfully!');
        } else {
          console.error('No story ID returned from saveStory');
          // Fallback: navigate to gallery if no story ID
          navigate('/gallery');
          toast.success('Story generated successfully! Check the gallery.');
        }
      }
    } catch (error) {
      console.error('Story generation error:', error);
      toast.error('Failed to generate story. Please try again.');
    }
  };

  const getLoadingMessage = () => {
    switch (currentStep) {
      case 'analyzing':
        return 'Analyzing your image...';
      case 'generating':
        return "Discovering Kenya's story...";
      case 'synthesizing':
        return 'Weaving the narrative...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 md:px-8 lg:py-24">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-text-light dark:text-text-dark">
              Upload Your Image
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-subtle-light dark:text-subtle-dark">
              Uncover the hidden stories within your photos. Our AI will help you discover the rich tapestry of Kenyan history and culture.
            </p>
          </div>

          {/* Main Upload Card */}
          <div className="w-full bg-surface-light dark:bg-surface-dark rounded-xl shadow-soft p-6 md:p-8">
            {/* Upload Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 md:p-12 text-center flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : uploadedFile
                  ? 'border-accent-green bg-accent-green/5'
                  : 'border-subtle-light dark:border-subtle-dark bg-background-light dark:bg-background-dark/50 hover:border-primary hover:bg-primary/5'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className={`mb-4 ${uploadedFile ? 'text-accent-green' : 'text-subtle-light dark:text-subtle-dark'}`}>
                {uploadedFile ? (
                  <CheckCircle className="w-16 h-16" />
                ) : (
                  <UploadIcon className="w-16 h-16" />
                )}
              </div>
              
              {uploadedFile ? (
                <div>
                  <p className="text-lg font-bold mb-1 text-accent-green">
                    Image uploaded: {uploadedFile.name}
                  </p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                    Click to select a different image
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold mb-1">
                    {isDragActive ? 'Drop your image here' : 'Drag and drop an image here'}
                  </p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                    Maximum file size: 10MB
                  </p>
                  <p className="text-subtle-light dark:text-subtle-dark mb-4">or</p>
                  <Button className="inline-flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Select Image
                  </Button>
                </div>
              )}
            </div>

            {/* Description Input */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                Describe what you know about this image (optional)
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full resize-none rounded-lg border border-subtle-light/50 dark:border-subtle-dark/50 bg-background-light dark:bg-background-dark/50 text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:border-primary focus:ring-primary focus:ring-2 p-4 text-base transition-colors"
                placeholder="E.g., This photo was taken in Nairobi around 1963..."
                rows={4}
              />
            </div>

            {/* Generate Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleGenerateStory}
                disabled={!uploadedFile || isLoading}
                className="min-w-[200px] w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </div>
                ) : (
                  'Generate Story'
                )}
              </Button>
            </div>

            {/* Loading Animation */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 text-center"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-8 h-8 border-4 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin"></div>
                    <div className="relative h-6 w-64 overflow-hidden">
                      <motion.p
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-0 text-accent-green font-medium"
                      >
                        {getLoadingMessage()}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Guidelines */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            >
              <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-6 text-center shadow-soft">
                <Camera className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-text-light dark:text-text-dark">
                  Quality Images
                </h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Upload clear, high-resolution images for best AI analysis and storytelling
                </p>
              </div>
              
              <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-6 text-center shadow-soft">
                <FileText className="w-8 h-8 text-accent-green mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-text-light dark:text-text-dark">
                  Cultural Context
                </h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Images with Kenyan cultural significance create the most authentic stories
                </p>
              </div>
              
              <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-6 text-center shadow-soft">
                <Mic className="w-8 h-8 text-accent-gold mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-text-light dark:text-text-dark">
                  AI Narration
                </h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Get professional voice narration of your heritage story in minutes
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;