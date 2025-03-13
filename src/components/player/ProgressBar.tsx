import React, { useRef, useEffect } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (e: React.MouseEvent | React.TouchEvent) => void;
  showTimeLabels?: boolean;
  compact?: boolean;
}

export default function ProgressBar({ 
  currentTime, 
  duration, 
  onSeek, 
  showTimeLabels = true, 
  compact = false 
}: ProgressBarProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    onSeek(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingRef.current) {
      onSeek(e);
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
    <div className={compact ? "space-y-1" : "mb-4 sm:mb-6 space-y-1 sm:space-y-2"}>
      <div
        ref={progressBarRef}
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          onSeek(e); 
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          isDraggingRef.current = true;
          onSeek(e);
        }}
        onTouchMove={(e) => {
          if (isDraggingRef.current) {
            e.stopPropagation();
            onSeek(e);
          }
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          isDraggingRef.current = false;
        }}
        className="progress-bar"
      >
        <div
          className="progress-fill"
          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
        >
          <div className="progress-handle"></div>
        </div>
      </div>
      {showTimeLabels && (
        <div className="flex justify-between text-xs text-purple-300">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      )}
    </div>
  );
}
