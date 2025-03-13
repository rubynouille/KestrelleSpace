'use client';

import dynamic from 'next/dynamic';
import { MusicLibrary, Track, Album } from '@/lib/music';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useEffect } from 'react';

const MusicPlayer = dynamic(() => import('@/components/MusicPlayer'), {
  ssr: false
});

export default function MusicPlayerWrapper({ 
  library, 
  initialTrack,
  initialAlbum
}: { 
  library: MusicLibrary, 
  initialTrack?: Track,
  initialAlbum?: Album
}) {
  const { updateLibrary } = useMusicPlayer();

  // Update the global player with this page's library and initial track
  useEffect(() => {
    updateLibrary(library, initialTrack, initialAlbum);
  }, [library, initialTrack, initialAlbum, updateLibrary]);

  return <MusicPlayer 
    library={library} 
    initialTrack={initialTrack} 
    initialAlbum={initialAlbum} 
  />;
}
