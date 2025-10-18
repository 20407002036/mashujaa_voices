/**
 * Custom Audio Player Component for Mashujaa Voices
 * Plays AI-generated Kenyan heritage stories with custom controls
 */

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { VoiceSynthesisService } from '../../services/voiceSynthesis';
import { VoiceSynthesisResult } from '../../types/gemini';
import { Button } from '../ui/Button';

interface AudioPlayerProps {
  audioData: string; // base64 audio data
  format?: string;
  autoPlay?: boolean;
  className?: string;
  title?: string;
  duration?: number;
}

export const AudioPlayer = ({
  audioData,
  format = 'wav',
  autoPlay = false,
  onEnded,
  className = '',
  title = 'Kenyan Heritage Story',
  duration: propDuration = 0
}: AudioPlayerProps & { onEnded?: () => void }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Initialize audio URL when component mounts
  useEffect(() => {
    console.log('AudioPlayer - Received audioData:', {
      type: typeof audioData,
      length: audioData?.length,
      format: format,
      first100chars: audioData?.substring?.(0, 100)
    });

    if (audioData && audioData.length > 0) {
      try {
        console.log('Creating audio URL with format:', format);
        const url = VoiceSynthesisService.createAudioUrl(audioData, format);
        setAudioUrl(url);
        setIsLoading(false);
        console.log('Audio URL created successfully:', url);
      } catch (error) {
        console.error('Failed to create audio URL:', error);
        setIsLoading(false);
        setAudioUrl(null);
        toast.error('Failed to create audio player');
      }
    } else {
      // No audio data available
      console.warn('AudioPlayer - No audio data provided or empty data');
      setIsLoading(false);
      setAudioUrl(null);
    }

    // Cleanup URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioData]);

  // Auto play functionality
  useEffect(() => {
    if (autoPlay && audioRef.current && !isLoading) {
      handlePlay();
    }
  }, [autoPlay, isLoading]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [onEnded]);

  const handlePlay = async () => {
    if (!audioRef.current || isLoading) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleDownload = () => {
    if (audioData) {
      VoiceSynthesisService.saveAudioFile(
        audioData,
        `${title.toLowerCase().replace(/\s+/g, '-')}-mashujaa-story.wav`
      );
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl || !audioData || audioData.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-semibold mb-1">Audio Coming Soon!</p>
          <p className="text-sm">Voice narration is temporarily unavailable, but your story is ready to read above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 border-orange-200 p-6 ${className}`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">
          🎙️ Kenyan Heritage Story • {formatTime(duration || propDuration || 0)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${progressPercentage}%, #e5e7eb ${progressPercentage}%, #e5e7eb 100%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSkip(-10)}
          disabled={isLoading}
          className="p-2"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRestart}
          disabled={isLoading}
          className="p-2"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          onClick={handlePlay}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSkip(10)}
          disabled={isLoading}
          className="p-2"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          disabled={isLoading}
          className="p-2"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <Volume2 className="w-4 h-4 text-gray-600" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={handleVolumeChange}
          disabled={isLoading}
          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f97316 0%, #f97316 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
          }}
        />
        <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading audio...</p>
          </div>
        </div>
      )}

      {/* Custom CSS for sliders */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};