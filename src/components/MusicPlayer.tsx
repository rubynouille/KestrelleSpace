'use client';

import React, { useEffect } from 'react';
import { Music2, Disc3 } from 'lucide-react';
import { FaSoundcloud } from 'react-icons/fa';
import type { MusicLibrary, Track, Album } from '@/lib/music';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import TrackItem from './player/TrackItem';
import AlbumItem from './player/AlbumItem';

interface MusicPlayerProps {
  library: MusicLibrary;
  initialTrack?: Track;
  initialAlbum?: Album;
}

export default function MusicPlayer({ library }: MusicPlayerProps) {
  const { isPlaying, currentTrack, currentAlbum, playTrack, togglePlay } = useMusicPlayer();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <header className="mb-8 sm:mb-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 gradient-text">Rose Kestrelle</h1>
        <p className="text-base sm:text-lg md:text-xl text-purple-200 mb-4 sm:mb-8">Ambient Electronic Music Artist</p>
        <div className="flex justify-center space-x-3 sm:space-x-6">
          <a href="https://soundcloud.com/rosekestrelle" target="_blank" rel="noopener noreferrer" 
             className="glass-button px-3 py-2 sm:px-4 sm:py-2 rounded-full flex items-center text-purple-200 hover:text-white transition-colors text-sm sm:text-base">
            <FaSoundcloud className='w-5 h-5 mr-2'/>
            SoundCloud
          </a>
        </div>
      </header>
      
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-6 sm:space-y-8">
          {library.singles.length > 0 && (
            <section className="music-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                <Music2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-400" />
                {library.singles.length === 1 ? 'Featured Track' : 'Latest Singles'}
              </h2>
              <div className="tracklist space-y-1 sm:space-y-2">
                {library.singles.map((track) => (
                  <TrackItem
                    key={track.id}
                    track={track}
                    isPlaying={isPlaying}
                    isActive={currentTrack?.id === track.id}
                    onPlay={() => {
                        if (currentTrack?.id === track.id) {
                          togglePlay();
                        } else {
                          playTrack(track);
                        }
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {library.albums.length > 0 && (
            <section className="music-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center">
                <Disc3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-400" />
                Albums
              </h2>
              <div className="space-y-8 sm:space-y-12">
                {library.albums.map((album) => (
                  <AlbumItem
                    key={album.id}
                    album={album}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlayTrack={(track, album) => {
                        if (currentTrack?.id === track.id) {
                          togglePlay();
                        } else {
                          playTrack(track, album);
                        }
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      
      {/* Add spacing at the bottom for the persistent player */}
      <div className="h-24 sm:h-20"></div>
    </div>
  );
}