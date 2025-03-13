import React from 'react';
import { Disc3, Calendar, Tag, Play, Pause } from 'lucide-react';
import type { Album, Track } from '@/lib/music';
import TrackItem from './TrackItem';

interface AlbumItemProps {
  album: Album;
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, album: Album) => void;
}

export default function AlbumItem({
  album,
  currentTrack,
  isPlaying,
  onPlayTrack
}: AlbumItemProps) {
  // Check if this album is currently playing
  const isAlbumPlaying = isPlaying && currentTrack && 
    album.tracks.some(track => track.id === currentTrack.id);
  
  // Play the first track of the album
  const handlePlayAlbum = () => {
    if (album.tracks.length > 0) {
      const firstTrack = album.tracks[0];
      // If the first track is already the current track, toggle play instead
      if (currentTrack?.id === firstTrack.id) {
        onPlayTrack(firstTrack, album); // Will trigger togglePlay via parent
      } else {
        onPlayTrack(firstTrack, album);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden group cursor-pointer" onClick={handlePlayAlbum}>
          {album.imageUrl ? (
            <img 
              src={album.imageUrl} 
              alt={album.name}
              className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
            />
          ) : (
            <div className="w-full h-full rounded-md bg-gradient-to-br from-[rgba(var(--accent-primary),0.2)] to-[rgba(var(--accent-secondary),0.2)] flex items-center justify-center group-hover:opacity-90 transition-opacity">
              <Disc3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400/50" />
            </div>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
            {isAlbumPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" />
            )}
          </div>
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="text-lg sm:text-xl font-bold gradient-text hover:underline cursor-pointer line-clamp-1" onClick={handlePlayAlbum}>
            {album.name}
          </h3>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
            {album.year && (
              <span className="text-xs sm:text-sm text-purple-300 flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {album.year}
              </span>
            )}
            {album.genre && (
              <span className="text-xs sm:text-sm text-purple-300 flex items-center">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="truncate">{album.genre}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="tracklist space-y-1 sm:space-y-2">
        {album.tracks.map((track) => (
          <TrackItem
            key={track.id}
            track={track}
            isPlaying={isPlaying}
            isActive={currentTrack?.id === track.id}
            onPlay={() => onPlayTrack(track, album)}
            showArtist={false}
            showTrackNumber={true}
            album={album}
          />
        ))}
      </div>
    </div>
  );
}
