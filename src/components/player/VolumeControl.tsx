import React, { useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  compact?: boolean;
}

export default function VolumeControl({ 
  volume, 
  isMuted, 
  onVolumeChange, 
  onMuteToggle, 
  compact = false 
}: VolumeControlProps) {
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleVolumeChange = (clientX: number) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos)); // Clamp between 0 and 1
      onVolumeChange(pos);
    }
  };

  const handleBarClick = (e: React.MouseEvent) => {
    handleVolumeChange(e.clientX);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    handleVolumeChange(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingRef.current) {
      handleVolumeChange(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Add and remove touch event listeners
  useEffect(() => {
    const handleTouchEndGlobal = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('touchend', handleTouchEndGlobal);
    
    return () => {
      document.removeEventListener('touchend', handleTouchEndGlobal);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={onMuteToggle} 
        className="text-purple-300 hover:text-white"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? 
          <VolumeX className={compact ? "w-4 h-4" : "w-5 h-5"} /> : 
          <Volume2 className={compact ? "w-4 h-4" : "w-5 h-5"} />
        }
      </button>
      <div 
        ref={volumeBarRef}
        onClick={handleBarClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`progress-bar ${compact ? "w-12 sm:w-16" : "w-16 sm:w-20"}`}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isMuted ? 0 : Math.round(volume * 100)}
        aria-label="Volume"
      >
        <div 
          className="progress-fill" 
          style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
        ></div>
        <div className="progress-handle"></div>
      </div>
    </div>
  );
}
