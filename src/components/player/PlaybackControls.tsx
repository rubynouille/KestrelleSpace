import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Repeat, Repeat1, Shuffle, List } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onSkipForward: () => void;
  onSkipBack: () => void;
  disabled?: boolean;
  compact?: boolean;
  onPlayPause: () => void;
  repeatMode?: 'none' | 'all' | 'one';
  onRepeatToggle?: () => void;
  isShuffle?: boolean;
  onShuffleToggle?: () => void;
  showPlaylist?: boolean;
  onPlaylistToggle?: () => void;
  hasAlbum?: boolean;
}

export default function PlaybackControls({
  isPlaying,
  onSkipForward,
  onSkipBack,
  disabled = false,
  compact = false,
  repeatMode = 'none',
  onRepeatToggle,
  isShuffle = false,
  onShuffleToggle,
  showPlaylist = false,
  onPlaylistToggle,
  hasAlbum = false,
  onPlayPause
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center">
      {/* Primary controls - always visible */}
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
        <button 
          onClick={onSkipBack} 
          className="p-1 sm:p-2 text-purple-200 hover:text-white"
          disabled={disabled}
          aria-label="Previous track"
        >
          <SkipBack className={compact ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} />
        </button>
        
        <button
          onClick={onPlayPause}
          className={`${compact ? "p-1.5 sm:p-2" : "p-2 sm:p-3"} bg-gradient-to-br from-[rgba(var(--accent-primary),0.8)] to-[rgba(var(--accent-secondary),0.8)] rounded-full hover:from-[rgba(var(--accent-primary),1)] hover:to-[rgba(var(--accent-secondary),1)] flex items-center justify-center`}
          disabled={disabled}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className={compact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6"} />
          ) : (
            <Play className={compact ? "w-4 h-4 sm:w-5 sm:h-5 ml-0.5" : "w-5 h-5 sm:w-6 sm:h-6 ml-0.5"} />
          )}
        </button>
        
        <button 
          onClick={onSkipForward} 
          className="p-1 sm:p-2 text-purple-200 hover:text-white"
          disabled={disabled}
          aria-label="Next track"
        >
          <SkipForward className={compact ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} />
        </button>
      </div>
      
      {/* Auxiliary controls - visible based on screen size */}
      {(onShuffleToggle || onRepeatToggle || onPlaylistToggle) && (
        <div className="flex items-center ml-2 sm:ml-3">
          {onShuffleToggle && (
            <button
              onClick={onShuffleToggle}
              className={`p-1 ${isShuffle ? 'text-purple-400' : 'text-purple-400/50'} hover:text-purple-300`}
              title="Shuffle"
              aria-label="Toggle shuffle"
              aria-pressed={isShuffle}
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
          
          {onRepeatToggle && (
            <button
              onClick={onRepeatToggle}
              className={`p-1 ml-1 ${repeatMode !== 'none' ? 'text-purple-400' : 'text-purple-400/50'} hover:text-purple-300`}
              title={`Repeat: ${repeatMode}`}
              aria-label={`Toggle repeat mode: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}
          
          {onPlaylistToggle && hasAlbum && (
            <button
              onClick={onPlaylistToggle}
              className={`p-1 ml-1 ${showPlaylist ? 'text-purple-400' : 'text-purple-400/50'} hover:text-purple-300`}
              title="Show playlist"
              aria-label="Toggle playlist visibility"
              aria-pressed={showPlaylist}
            >
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
