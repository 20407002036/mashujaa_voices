import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  blobUrl: string | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, blobUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Use URL-based audio (blobUrl is always provided now)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Set initial duration if already loaded
    if (audio.duration) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [isDragging]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.error('Playback error:', err));
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const audio = audioRef.current;
      const progressBar = progressBarRef.current;
      if (!audio || !progressBar) return;

      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(clickX / rect.width, 1));
      const newTime = percentage * duration;
      
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-heritage-cream to-white rounded-xl shadow-lg border border-stone-200 p-6 w-full">
      {blobUrl && (
        <audio 
          ref={audioRef} 
          src={blobUrl} 
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
      
      <div className="space-y-4">
        {/* Main Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => skip(-10)}
            className="flex-shrink-0 w-10 h-10 rounded-full text-stone-600 hover:text-heritage-green hover:bg-stone-100 flex items-center justify-center transition-all"
            title="Rewind 10s"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-14 h-14 rounded-full bg-heritage-green hover:bg-green-800 text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="flex-shrink-0 w-10 h-10 rounded-full text-stone-600 hover:text-heritage-green hover:bg-stone-100 flex items-center justify-center transition-all"
            title="Forward 10s"
          >
            <SkipForward size={20} />
          </button>

          <div className="flex-grow" />

          {blobUrl && (
            <a
              href={blobUrl}
              download="mashujaa-story.wav"
              className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-stone-300 text-stone-600 hover:text-papaya hover:border-papaya flex items-center justify-center transition-all hover:shadow-md"
              title="Download Audio"
            >
              <Download size={18} />
            </a>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            ref={progressBarRef}
            onMouseDown={handleProgressMouseDown}
            onClick={handleProgressClick}
            className="relative h-2 bg-stone-200 rounded-full cursor-pointer group overflow-hidden"
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-papaya to-papaya-600 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-papaya opacity-0 group-hover:opacity-10 transition-opacity" />
            
            {/* Progress handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-papaya rounded-full shadow-md transform scale-0 group-hover:scale-100 transition-transform"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-sm text-stone-500 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Audio Info */}
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-papaya animate-pulse' : 'bg-stone-300'}`} />
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
          <span>Kenyan Heritage Story</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;