'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react';
import type { MusicLibrary, Track, Album } from '@/lib/music';

type RepeatMode = 'none' | 'all' | 'one';

interface MusicPlayerContextType {
  // Player state
  isPlaying: boolean;
  currentTrack: Track | null;
  currentAlbum: Album | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  showMiniPlaylist: boolean;
  
  // Library data
  library: MusicLibrary;
  
  // Control functions
  playTrack: (track: Track, album?: Album) => void;
  togglePlay: () => void;
  skipTrack: (direction: 'next' | 'prev') => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleMiniPlaylist: () => void;
  updateLibrary: (
    library: MusicLibrary, 
    initialTrack?: Track, 
    initialAlbum?: Album
  ) => void;
}

const defaultLibrary: MusicLibrary = {
  singles: [],
  albums: []
};

const MusicPlayerContext = createContext<MusicPlayerContextType>({
  isPlaying: false,
  currentTrack: null,
  currentAlbum: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  repeatMode: 'none',
  isShuffle: false,
  showMiniPlaylist: false,
  library: defaultLibrary,
  
  playTrack: () => {},
  togglePlay: () => {},
  skipTrack: () => {},
  seek: () => {},
  setVolume: () => {},
  toggleMute: () => {},
  toggleRepeat: () => {},
  toggleShuffle: () => {},
  toggleMiniPlaylist: () => {},
  updateLibrary: () => {}
});

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isShuffle, setIsShuffle] = useState(false);
  const [showMiniPlaylist, setShowMiniPlaylist] = useState(false);
  
  // Library data
  const [library, setLibrary] = useState<MusicLibrary>(defaultLibrary);
  
  // Queue management
  const [playQueue, setPlayQueue] = useState<Track[]>([]);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  
  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Declare skipToNextTrack function ref - we'll assign its implementation after defining functions
  const skipToNextTrackRef = useRef<() => void>(() => {});
  
  // Define handleTrackEnded using the ref to avoid circular dependencies
  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error("Autoplay was prevented:", error);
          setIsPlaying(false);
        });
      }
    } else {
      // Use our skipToNextTrack function for consistency
      skipToNextTrackRef.current();
    }
  }, [repeatMode]);
  
  // Initialize audio element
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;
      
      // Set initial volume
      audio.volume = volume;
      
      // Only set up metadata and error listeners here
      // (events that don't depend on changing state)
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
      }
    };
  }, []);
  
  // Set up the 'ended' event listener separately so it always has the latest state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Clean up previous listener before adding a new one
    audio.removeEventListener('ended', handleTrackEnded);
    audio.addEventListener('ended', handleTrackEnded);
    
    return () => {
      audio.removeEventListener('ended', handleTrackEnded);
    };
  }, [handleTrackEnded]); // This will update when handleTrackEnded changes

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        
        // Handle autoplay restrictions
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Autoplay was prevented:", error);
            setIsPlaying(false);
          });
        }
      }
      
      // Reset time
      setCurrentTime(0);
    }
  }, [currentTrack]);
  
  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      
      // Handle autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback was prevented:", error);
          setIsPlaying(false);
        });
      }
      
      // Start time update interval
      if (!timeUpdateIntervalRef.current) {
        timeUpdateIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }, 1000 / 60); // ~60fps updates
      }
    } else {
      audioRef.current.pause();
      
      // Clear time update interval
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Save player state to localStorage
  useEffect(() => {
    try {
      const playerState = {
        volume,
        isMuted,
        repeatMode,
        isShuffle,
        currentTrackId: currentTrack?.id,
        currentAlbumId: currentAlbum?.id
      };
      
      localStorage.setItem('musicPlayerState', JSON.stringify(playerState));
    } catch (error) {
      console.error('Failed to save player state:', error);
    }
  }, [volume, isMuted, repeatMode, isShuffle, currentTrack?.id, currentAlbum?.id]);
  
  // Load player state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('musicPlayerState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setVolumeState(parsed.volume ?? 0.8);
        setIsMuted(parsed.isMuted ?? false);
        setRepeatMode(parsed.repeatMode ?? 'none');
        setIsShuffle(parsed.isShuffle ?? false);
      }
    } catch (error) {
      console.error('Failed to load player state:', error);
    }
  }, []);
  
  // Build play queue based on current album and shuffle mode
  useEffect(() => {
    if (!currentAlbum) return;
    
    let queue = [...currentAlbum.tracks];
    
    // If shuffle is active, randomize the queue except for the current track
    if (isShuffle && currentTrack) {
      const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
      if (currentIndex !== -1) {
        // Remove current track from queue
        const currentTrackItem = queue.splice(currentIndex, 1)[0];
        
        // Shuffle the remaining tracks
        for (let i = queue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [queue[i], queue[j]] = [queue[j], queue[i]];
        }
        
        // Put current track back at the start
        queue = [currentTrackItem, ...queue];
      }
    }
    
    setPlayQueue(queue);
  }, [currentAlbum, isShuffle, currentTrack]);
  
  // Simplify skipTrack function to reuse the same logic
  const skipToNextTrack = useCallback(() => {
    // For album tracks
    if (currentAlbum && currentTrack && playQueue.length > 0) {
      const currentIndex = playQueue.findIndex(track => track.id === currentTrack.id);
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % playQueue.length;
        
        // If we've reached the end and repeat is off, stop playback
        if (nextIndex === 0 && repeatMode === 'none') {
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.currentTime = 0;
          return;
        }
        
        // Play the next track
        setCurrentTrack(playQueue[nextIndex]);
        setIsPlaying(true);
        return;
      }
    }
    
    // For singles
    if (!currentAlbum && currentTrack && library.singles.length > 0) {
      const currentIndex = library.singles.findIndex(track => track.id === currentTrack.id);
      if (currentIndex !== -1) {
        // If not the last track, play next
        if (currentIndex < library.singles.length - 1) {
          setCurrentTrack(library.singles[currentIndex + 1]);
          setIsPlaying(true);
          return;
        }
        // If last track and repeat all, go back to first
        else if (repeatMode === 'all') {
          setCurrentTrack(library.singles[0]);
          setIsPlaying(true);
          return;
        }
        // Otherwise stop playback
        else {
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.currentTime = 0;
          return;
        }
      }
    }
  }, [currentTrack, currentAlbum, playQueue, library.singles, repeatMode]);
  
  // Update the ref to the latest implementation
  useEffect(() => {
    skipToNextTrackRef.current = skipToNextTrack;
  }, [skipToNextTrack]);
  
  // Play track function
  const playTrack = useCallback((track: Track, album?: Album) => {
    setCurrentTrack(track);
    
    if (album) {
      setCurrentAlbum(album);
    } else {
      // If no album provided, check if track is in an album
      const trackAlbum = library.albums.find(a => 
        a.tracks.some(t => t.id === track.id)
      );
      
      if (trackAlbum) {
        setCurrentAlbum(trackAlbum);
      } else {
        // If track is not in an album, clear album context
        setCurrentAlbum(null);
      }
    }
    
    setIsPlaying(true);
  }, [library.albums]);
  
  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
      // The effect hook will handle the actual audio playing/pausing
      // This avoids potential race conditions with the state update
    }
  }, [currentTrack]);
  
  // Update skipTrack to use skipToNextTrack for the 'next' direction
  const skipTrack = useCallback((direction: 'next' | 'prev') => {
    if (!currentTrack) return;
    
    if (direction === 'next') {
      skipToNextTrack();
    } else {
      // Previous track or restart current if < 3 seconds in
      if (currentAlbum && playQueue.length > 0) {
        const currentIndex = playQueue.findIndex(track => track.id === currentTrack.id);
        if (currentIndex !== -1) {
          if (currentTime < 3) {
            const prevIndex = (currentIndex - 1 + playQueue.length) % playQueue.length;
            setCurrentTrack(playQueue[prevIndex]);
          } else {
            // Just restart current track
            if (audioRef.current) audioRef.current.currentTime = 0;
          }
        }
      } else if (library.singles.length > 0) {
        const currentIndex = library.singles.findIndex(track => track.id === currentTrack.id);
        if (currentIndex !== -1) {
          if (currentTime < 3) {
            if (currentIndex > 0) {
              setCurrentTrack(library.singles[currentIndex - 1]);
            } else if (repeatMode === 'all') {
              setCurrentTrack(library.singles[library.singles.length - 1]);
            } else {
              // Just restart current track
              if (audioRef.current) audioRef.current.currentTime = 0;
            }
          } else {
            // Just restart current track
            if (audioRef.current) audioRef.current.currentTime = 0;
          }
        }
      }
    }
  }, [currentTrack, currentAlbum, currentTime, playQueue, library.singles, repeatMode, skipToNextTrack]);
  
  // Seek to a specific time
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);
  
  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.min(1, Math.max(0, newVolume));
    setVolumeState(clampedVolume);
    
    if (isMuted && clampedVolume > 0) {
      setIsMuted(false);
    }
  }, [isMuted]);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    // When enabling any repeat mode, turn off shuffle
    setRepeatMode(current => {
      const nextMode = current === 'none' ? 'all' : current === 'all' ? 'one' : 'none';
      if (nextMode !== 'none' && isShuffle) {
        setIsShuffle(false);
      }
      return nextMode;
    });
  }, [isShuffle]);
  
  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    // When enabling shuffle, turn off repeat mode
    const willBeShuffle = !isShuffle;
    if (willBeShuffle && repeatMode !== 'none') {
      setRepeatMode('none');
    }
    setIsShuffle(willBeShuffle);
  }, [isShuffle, repeatMode]);
  
  // Toggle mini playlist
  const toggleMiniPlaylist = useCallback(() => {
    setShowMiniPlaylist(prev => !prev);
  }, []);
  
  // Update library and optionally set initial track/album
  const updateLibrary = useCallback((
    newLibrary: MusicLibrary, 
    initialTrack?: Track, 
    initialAlbum?: Album
  ) => {
    setLibrary(newLibrary);
    
    if (initialTrack) {
      setCurrentTrack(initialTrack);
      
      if (initialAlbum) {
        setCurrentAlbum(initialAlbum);
      } else {
        // Check if track belongs to an album
        const trackAlbum = newLibrary.albums.find(album =>
          album.tracks.some(track => track.id === initialTrack.id)
        );
        
        if (trackAlbum) {
          setCurrentAlbum(trackAlbum);
        }
      }
    }
  }, []);
  
  // Create memoized context value
  const contextValue = useMemo(() => ({
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
    library,
    
    playTrack,
    togglePlay,
    skipTrack,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleMiniPlaylist,
    updateLibrary
  }), [
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
    library,
    playTrack,
    togglePlay,
    skipTrack,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleMiniPlaylist,
    updateLibrary
  ]);
  
  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}
