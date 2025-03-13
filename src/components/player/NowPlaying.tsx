import React from 'react';
import { Music2 } from 'lucide-react';
import type { Track } from '@/lib/music';

interface NowPlayingProps {
  track: Track | null;
  isPlaying: boolean;
  compact?: boolean;
}

export default function NowPlaying({ track, isPlaying, compact = false }: NowPlayingProps) {
  if (!track) {
    return (
      <div className={`text-center ${compact ? '' : 'mb-8'}`}>
        <h2 className="text-lg sm:text-2xl font-bold truncate">Select a track</h2>
        <p className="text-purple-300 truncate">Rose Kestrelle</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden flex-shrink-0">
          {track.imageUrl ? (
            <img 
              src={track.imageUrl} 
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[rgba(var(--accent-primary),0.2)] to-[rgba(var(--accent-secondary),0.2)] flex items-center justify-center">
              <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400/50" />
            </div>
          )}
        </div>
        <div className="truncate max-w-[130px] sm:max-w-[200px]">
          <p className="font-medium truncate text-sm sm:text-base">{track.title}</p>
          <p className="text-xs sm:text-sm text-purple-300 truncate">{track.artist}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold truncate">{track.title}</h2>
      <p className="text-purple-300 truncate">{track.artist}</p>
    </div>
  );
}
