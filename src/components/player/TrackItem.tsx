import React from 'react';
import { Music2, Play, Pause, User, Calendar, Tag } from 'lucide-react';
import type { Track, Album } from '@/lib/music';

interface TrackItemProps {
  track: Track;
  isPlaying: boolean;
  isActive: boolean;
  onPlay: () => void;
  showArtist?: boolean;
  showTrackNumber?: boolean;
  album?: Album;
}

export default function TrackItem({
  track,
  isPlaying,
  isActive,
  onPlay,
  showArtist = true,
  showTrackNumber = false,
  album
}: TrackItemProps) {
  return (
    <div
      onClick={onPlay}
      className={`track-hover rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
        isActive ? 'active bg-white/10 glow' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-md overflow-hidden">
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
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              {isActive && isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </div>
          </div>
          
          {showTrackNumber && (
            <div className="hidden sm:block w-8 text-purple-300 text-center">
              {track.trackNumber || '-'}
            </div>
          )}
          
          <div className="min-w-0 flex-grow">
            <div className="font-medium text-base sm:text-lg truncate">{track.title}</div>
            {showArtist && (
              <div className="text-xs sm:text-sm text-purple-300 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-1">
                {track.year && (
                  <span className="hidden sm:flex items-center">
                    <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                    {track.year}
                  </span>
                )}
                {track.genre && (
                  <span className="hidden sm:flex items-center">
                    <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{track.genre}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
