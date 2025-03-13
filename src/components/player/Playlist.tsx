import React from 'react';
import { Album, Track } from '@/lib/music';
import { Music2, Disc3 } from 'lucide-react';

interface PlaylistProps {
  currentTrack: Track | null;
  currentAlbum: Album | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
}

export default function Playlist({ 
  currentTrack, 
  currentAlbum, 
  isPlaying, 
  onTrackSelect 
}: PlaylistProps) {
  if (!currentAlbum || currentAlbum.tracks.length === 0) {
    return null; // Don't render anything if no album is playing
  }

  return (
    <div className="playlist-container">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 flex-shrink-0">
          {currentAlbum.imageUrl ? (
            <img 
              src={currentAlbum.imageUrl} 
              alt={currentAlbum.name} 
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[rgba(var(--accent-primary),0.2)] to-[rgba(var(--accent-secondary),0.2)] rounded-md flex items-center justify-center">
              <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400/60" />
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium text-xs sm:text-sm">Now Playing from Album</h4>
          <h3 className="text-base sm:text-lg font-semibold gradient-text truncate max-w-[200px] sm:max-w-none">{currentAlbum.name}</h3>
        </div>
      </div>
      
      <ul className="playlist-tracks space-y-1 max-h-[30vh] sm:max-h-[30vh] overflow-y-auto pr-1 sm:pr-2 pb-1 sm:pb-2">
        {currentAlbum.tracks.map((track) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          
          return (
            <li 
              key={track.id}
              onClick={() => onTrackSelect(track)}
              className={`flex items-center p-1.5 sm:p-2 rounded-md cursor-pointer transition-all ${
                isCurrentTrack ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative w-5 h-5 sm:w-7 sm:h-7 flex-shrink-0 mr-1.5 sm:mr-2">
                {track.imageUrl ? (
                  <img 
                    src={track.imageUrl} 
                    alt={track.title} 
                    className="w-full h-full object-cover rounded-sm"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[rgba(var(--accent-primary),0.2)] to-[rgba(var(--accent-secondary),0.2)] rounded-sm flex items-center justify-center">
                    <Music2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400/60" />
                  </div>
                )}
                
                {isCurrentTrack && isPlaying && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="playing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
              
              {track.trackNumber && (
                <div className="w-4 text-xs text-purple-300 text-center">
                  {track.trackNumber}
                </div>
              )}
              
              <div className="ml-1 sm:ml-2 min-w-0 flex-grow">
                <div className={`truncate text-xs sm:text-sm ${isCurrentTrack ? 'font-medium' : ''}`}>{track.title}</div>
                <div className="text-2xs sm:text-xs text-purple-300">{track.duration || '—:—'}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
