import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  blobUrl: string | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, blobUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [pausedAt, setPausedAt] = useState(0);
  
  // For visualization
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Initialize Audio Context on mount
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    
    return () => {
      ctx.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#FAF9F6'; // Clear with background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#E55F32'; // Papaya
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  const playAudio = async () => {
    if (!audioContext || !audioBuffer) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyserRef.current = analyser;

    source.start(0, pausedAt);
    setStartTime(audioContext.currentTime - pausedAt);
    setSourceNode(source);
    setIsPlaying(true);

    source.onended = () => {
        // If it ended naturally (not stopped by us)
        if (audioContext.currentTime - startTime >= audioBuffer.duration) {
            setIsPlaying(false);
            setPausedAt(0);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
             // Reset canvas
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.fillStyle = '#FAF9F6';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Draw a straight line
                ctx.beginPath();
                ctx.strokeStyle = '#E55F32';
                ctx.moveTo(0, canvas.height/2);
                ctx.lineTo(canvas.width, canvas.height/2);
                ctx.stroke();
            }
        }
    };
    
    draw();
  };

  const pauseAudio = () => {
    if (sourceNode && audioContext) {
      sourceNode.stop();
      setPausedAt(audioContext.currentTime - startTime);
      setSourceNode(null);
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };
  
  // Initial draw of flat line
  useEffect(() => {
    if (canvasRef.current && !isPlaying) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#FAF9F6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.strokeStyle = '#E55F32'; // Papaya
            ctx.lineWidth = 2;
            ctx.moveTo(0, canvas.height/2);
            ctx.lineTo(canvas.width, canvas.height/2);
            ctx.stroke();
        }
    }
  }, [isPlaying]);


  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 w-full">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-heritage-green hover:bg-green-800 text-white flex items-center justify-center transition-colors"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        
        <div className="flex-grow h-16 bg-heritage-cream rounded-md overflow-hidden relative border border-stone-100">
           <canvas 
             ref={canvasRef} 
             width={600} 
             height={100} 
             className="w-full h-full object-cover"
           />
        </div>

        {blobUrl && (
          <a
            href={blobUrl}
            download="mashujaa-story.wav"
            className="flex-shrink-0 w-10 h-10 rounded-full border border-stone-300 text-stone-600 hover:text-papaya hover:border-papaya flex items-center justify-center transition-colors"
            title="Download Audio"
          >
            <Download size={18} />
          </a>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;