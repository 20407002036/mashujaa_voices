/**
 * API Connection Test Component
 * Test Google Gemini API connectivity and functionality
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, Loader2, TestTube } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { checkServiceConfiguration, initializeAllServices } from '../../services';
import { useImageAnalysis, useStoryGeneration, useVoiceSynthesis } from '../../hooks/useGeminiServices';

interface TestResult {
  name: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  duration?: number;
}

export const APITestComponent = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Flask Backend Connection', status: 'idle', message: 'Check Flask backend connectivity' },
    { name: 'Service Initialization', status: 'idle', message: 'Initialize frontend services' },
    { name: 'Text Generation', status: 'idle', message: 'Test story generation via Flask' },
    { name: 'Image Analysis', status: 'idle', message: 'Test image analysis via Flask' },
    { name: 'Story Generation', status: 'idle', message: 'Test Kenyan story generation' },
    { name: 'Voice Synthesis', status: 'idle', message: 'Test TTS via Flask backend' },
  ]);

  const imageAnalysis = useImageAnalysis();
  const storyGeneration = useStoryGeneration();
  const voiceSynthesis = useVoiceSynthesis();

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  // Test 1: Environment Configuration
  const testEnvironment = async () => {
    const startTime = Date.now();
    updateTest(0, { status: 'testing', message: 'Checking Flask backend connectivity...' });

    try {
      const config = await checkServiceConfiguration();
      if (config.configured) {
        updateTest(0, {
          status: 'success',
          message: `✅ ${config.backend}: ${config.message}`,
          duration: Date.now() - startTime
        });
        return true;
      } else {
        throw new Error(config.message || 'Backend not accessible');
      }
    } catch (error) {
      updateTest(0, {
        status: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Backend connection failed'}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Test 2: Service Initialization
  const testServiceInit = async () => {
    const startTime = Date.now();
    updateTest(1, { status: 'testing', message: 'Initializing AI services...' });

    try {
      const services = initializeAllServices();
      updateTest(1, {
        status: 'success',
        message: '✅ Frontend services initialized (using Flask backend)',
        duration: Date.now() - startTime
      });
      return services;
    } catch (error) {
      updateTest(1, {
        status: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Initialization failed'}`,
        duration: Date.now() - startTime
      });
      return null;
    }
  };

  // Test 3: Basic Text Generation
  const testTextGeneration = async () => {
    const startTime = Date.now();
    updateTest(2, { status: 'testing', message: 'Testing basic text generation...' });

    try {
      // Simple text generation test
      const result = await storyGeneration.generateStory(
        'A simple test image of a traditional Kenyan village.',
        'This is a test to verify the API connection.'
      );

      if (result && result.story) {
        updateTest(2, {
          status: 'success',
          message: `✅ Generated ${result.story.length} characters`,
          duration: Date.now() - startTime
        });
        return true;
      } else {
        throw new Error('No story generated');
      }
    } catch (error) {
      updateTest(2, {
        status: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Text generation failed'}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Test 4: Image Analysis (with a test base64 image)
  const testImageAnalysis = async () => {
    const startTime = Date.now();
    updateTest(3, { status: 'testing', message: 'Testing image analysis...' });

    try {
      // Create a simple test image (1x1 pixel red PNG)
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      // Convert to File
      const response = await fetch(testImageData);
      const blob = await response.blob();
      const file = new File([blob], 'test.png', { type: 'image/png' });

      const result = await imageAnalysis.analyzeImage(file, 'This is a test image for API connectivity.');

      if (result && result.description) {
        updateTest(3, {
          status: 'success',
          message: `✅ Analysis completed: ${result.description.substring(0, 50)}...`,
          duration: Date.now() - startTime
        });
        return true;
      } else {
        throw new Error('No analysis result');
      }
    } catch (error) {
      updateTest(3, {
        status: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Image analysis failed'}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Test 5: Voice Synthesis
  const testVoiceSynthesis = async () => {
    const startTime = Date.now();
    updateTest(5, { status: 'testing', message: 'Testing voice synthesis...' });

    try {
      const testText = 'Habari, this is a test of the Mashujaa Voices system.';
      const result = await voiceSynthesis.synthesizeVoice(testText, 'Kore');

      if (result && result.audioData) {
        updateTest(5, {
          status: 'success',
          message: `✅ Audio generated: ${result.format}, ~${result.duration}s`,
          duration: Date.now() - startTime
        });
        return true;
      } else {
        throw new Error('No audio data generated');
      }
    } catch (error) {
      updateTest(5, {
        status: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Voice synthesis failed'}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Run all tests sequentially
  const runAllTests = async () => {
    toast.success('Starting API connectivity tests...');

    // Test 1: Environment
    const envOk = await testEnvironment();
    if (!envOk) return;

    // Test 2: Service Init
    const servicesOk = await testServiceInit();
    if (!servicesOk) return;

    // Test 3: Text Generation
    await testTextGeneration();

    // Test 4: Image Analysis
    await testImageAnalysis();

    // Test 5: Voice Synthesis
    await testVoiceSynthesis();

    // Check overall results
    const successCount = tests.filter(test => test.status === 'success').length;
    const totalTests = tests.length;

    if (successCount === totalTests) {
      toast.success('🎉 All tests passed! API is fully connected.');
    } else {
      toast.error(`${successCount}/${totalTests} tests passed. Check failed tests above.`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <TestTube className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const isRunning = tests.some(test => test.status === 'testing');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2 text-kenyan-black">
          API Connection Test
        </h2>
        <p className="text-gray-600">
          Test Google Gemini API connectivity and Mashujaa Voices services
        </p>
      </div>

      {/* Test Results */}
      <div className="space-y-3 mb-6">
        {tests.map((test, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg transition-all duration-300 ${getStatusColor(test.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <h3 className="font-semibold text-gray-800">{test.name}</h3>
                  <p className="text-sm text-gray-600">{test.message}</p>
                </div>
              </div>
              {test.duration && (
                <span className="text-xs text-gray-500">
                  {test.duration}ms
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={runAllTests}
          disabled={isRunning}
          className="bg-kenyan-red hover:bg-kenyan-red/90"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            setTests(prev => prev.map(test => ({ 
              ...test, 
              status: 'idle' as const, 
              message: test.name.includes('Environment') ? 'Check API key and configuration' :
                       test.name.includes('Service') ? 'Initialize Gemini services' :
                       test.name.includes('Text') ? 'Test basic text generation' :
                       test.name.includes('Image') ? 'Test image analysis with sample' :
                       test.name.includes('Story') ? 'Test Kenyan story generation' :
                       'Test TTS with sample text',
              duration: undefined 
            })));
            toast.success('Tests reset');
          }}
          disabled={isRunning}
        >
          Reset Tests
        </Button>
      </div>

      {/* API Key Info */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">API Key Status</h4>
        <p className="text-sm text-yellow-700">
          API Key: {import.meta.env.VITE_GEMINI_API_KEY ? 
            `${import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10)}...` : 
            'Not configured'
          }
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          Make sure your .env file contains a valid VITE_GEMINI_API_KEY
        </p>
      </div>
    </div>
  );
};