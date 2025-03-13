'use client';

import React, { useEffect, useRef } from 'react';
import { Disc3, Music2 } from 'lucide-react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import ProgressBar from './player/ProgressBar';
import VolumeControl from './player/VolumeControl';
import PlaybackControls from './player/PlaybackControls';
import NowPlaying from './player/NowPlaying';

export default function PersistentPlayer() {
  // Track when the component has mounted to prevent hydration mismatches
  const hasMounted = useRef(false);
  
  const { 
    isPlaying, 
    currentTrack, 
    currentAlbum, 
    currentTime, 
    duration, 
    volume, 
    isMuted,
    repeatMode,
    isShuffle,
    showMiniPlaylist,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleMiniPlaylist,
    playTrack,
    skipTrack,
    setVolume,
    seek,
    togglePlay
  } = useMusicPlayer();

  // Ensure component is marked as mounted after initial render
  useEffect(() => {
    hasMounted.current = true;
  }, []);
  
  const handleProgressBarClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!duration) return;
    
    // Extract clientX from the event
    let clientX;
    
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX;
    } else {
      clientX = e.clientX;
    }
    
    // Calculate target time
    const progressBarElement = e.currentTarget;
    const rect = progressBarElement.getBoundingClientRect();
    const percentage = (clientX - rect.left) / rect.width;
    const seekTime = percentage * duration;
    
    seek(seekTime);
  };

  // If not mounted yet, use a minimal placeholder to prevent hydration issues
  if (!hasMounted.current) {
    return <div className="w-full fixed bottom-0 left-0 right-0 z-50 h-[72px] bg-black/30"></div>;
  }

  // Handler for track selection in mini playlist with proper event handling
  const handleTrackSelect = (track: any, albumContext: any) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, albumContext);
    }
  };

  return (
    <div className="w-full fixed bottom-0 left-0 right-0 z-50">
      <div className={`persistent-player w-full bg-black/30 backdrop-blur-lg border-t border-white/10 p-4 transition-all duration-300 ${showMiniPlaylist ? 'pb-0' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 items-center gap-2">
            <div className="col-span-4 lg:col-span-3">
              <NowPlaying track={currentTrack} isPlaying={isPlaying} compact={true} />
            </div>
            
            <div className="col-span-4 lg:col-span-3 flex justify-center">
              <PlaybackControls
                isPlaying={isPlaying}
                onPlayPause={() => {
                  if (currentTrack) {
                    togglePlay();
                  }
                }}
                onSkipForward={() => skipTrack('next')}
                onSkipBack={() => skipTrack('prev')}
                compact={true}
                repeatMode={repeatMode}
                onRepeatToggle={toggleRepeat}
                isShuffle={isShuffle}
                onShuffleToggle={toggleShuffle}
                showPlaylist={showMiniPlaylist}
                onPlaylistToggle={toggleMiniPlaylist}
                hasAlbum={!!currentAlbum}
              />
            </div>
            
            <div className="hidden md:block col-span-4 lg:col-span-4">
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={handleProgressBarClick}
                compact={true}
              />
            </div>
            
            <div className="hidden lg:block lg:col-span-2 flex justify-end">
              <VolumeControl
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={setVolume}
                onMuteToggle={toggleMute}
                compact={true}
              />
            </div>
          </div>
          
          {/* Mobile progress bar - shown below controls on small screens */}
          <div className="sm:hidden mt-3">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleProgressBarClick}
              compact={true}
              showTimeLabels={false}
            />
          </div>

          {/* Mini playlist - shown when toggled and an album is available */}
          {showMiniPlaylist && currentAlbum && (
            <div className="mt-2 border-t border-white/10 pt-3 pb-2 max-h-[40vh] overflow-y-auto mini-playlist">
              <div className="mb-2 flex items-center">
                <Disc3 className="w-4 h-4 mr-2 text-purple-400" />
                <h3 className="text-sm font-medium">{currentAlbum.name} • {currentAlbum.tracks.length} tracks</h3>
              </div>
              <ul className="space-y-1">
                {currentAlbum.tracks.map((track) => {
                  const isCurrentTrack = currentTrack?.id === track.id;
                  return (
                    <li
                      key={track.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTrackSelect(track, currentAlbum);
                      }}
                      className={`flex items-center p-2 rounded-md cursor-pointer text-sm ${
                        isCurrentTrack ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-6 text-xs text-purple-300 text-center mr-2">
                        {track.trackNumber || '-'}
                      </div>
                      <div className="flex-grow truncate">
                        <div className={`truncate ${isCurrentTrack ? 'font-medium' : ''}`}>
                          {track.title}
                        </div>
                      </div>
                      <div className="text-xs text-purple-300 ml-2">
                        {track.duration || '—:—'}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
