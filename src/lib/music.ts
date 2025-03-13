import { readdir, readFile } from 'fs/promises';
import path from 'path';
import * as mm from 'music-metadata';
import crypto from 'crypto';

export interface Track {
  id: string;
  title: string;
  audioUrl: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  trackNumber?: number;
  duration?: string;
  year?: number;
  genre?: string;
  secretKey?: string;
}

export interface Album {
  id: string;
  name: string;
  tracks: Track[];
  year?: number;
  genre?: string;
  imageUrl?: string;
  secretKey?: string;
}

export interface MusicLibrary {
  singles: Track[];
  albums: Album[];
}

// Simplify key functions to directly use names with minimal processing
function generateTrackSecretKey(title: string): string {
  // Just use the title, simplified and lowercase
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function generateAlbumSecretKey(albumName: string): string {
  // Just use the album name, simplified and lowercase
  return albumName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function parseTrackNumber(filename: string): number | undefined {
  const match = filename.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : undefined;
}

function parseTrackTitle(filename: string): string {
  return filename
    .replace(/^\d+-/, '')
    .replace(/\.mp3$/, '')
    .replace(/-/g, ' ');
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function getTrackMetadata(filePath: string): Promise<Partial<Track>> {
  try {
    const buffer = await readFile(filePath);
    const metadata = await mm.parseBuffer(buffer);
    
    // Extract image from metadata if available
    let imageUrl: string | undefined = undefined;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const imageBuffer = picture.data;
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      imageUrl = `data:${picture.format};base64,${base64Image}`;
    }
    
    return {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      trackNumber: metadata.common.track.no ?? undefined,
      duration: formatDuration(metadata.format.duration || 0),
      year: metadata.common.year,
      genre: metadata.common.genre?.[0],
      imageUrl
    };
  } catch (error) {
    return {};
  }
}

export async function getMusicLibrary(secretKey?: string): Promise<MusicLibrary> {
  const musicPath = path.join(process.cwd(), 'public', 'music');
  const library: MusicLibrary = {
    singles: [],
    albums: []
  };

  try {
    // Process singles
    const singlesPath = path.join(musicPath, 'singles');
    const singles = await readdir(singlesPath, { withFileTypes: true });
    
    for (const file of singles) {
      if (file.isFile() && file.name.endsWith('.mp3')) {
        const filePath = path.join(singlesPath, file.name);
        const metadata = await getTrackMetadata(filePath);
        const title = metadata.title || parseTrackTitle(file.name);
        
        // Generate key using just the title - SIMPLE!
        const trackSecretKey = generateTrackSecretKey(title);
        
        const track: Track = {
          id: file.name,
          title: title,
          audioUrl: `/music/singles/${file.name}`,
          artist: metadata.artist || 'Rose Kestrelle',
          duration: metadata.duration,
          genre: metadata.genre,
          year: metadata.year,
          imageUrl: metadata.imageUrl,
          secretKey: trackSecretKey
        };

        if (!secretKey || secretKey === trackSecretKey) {
          library.singles.push(track);
        }
      }
    }

    // Sort singles by title
    library.singles.sort((a, b) => a.title.localeCompare(b.title));

    // Process albums
    const albumsPath = path.join(musicPath, 'albums');
    const albums = await readdir(albumsPath, { withFileTypes: true });
    
    for (const album of albums) {
      if (album.isDirectory()) {
        const albumPath = path.join(albumsPath, album.name);
        const tracks = await readdir(albumPath, { withFileTypes: true });
        const albumTracks: Track[] = [];
        let albumMetadata: Partial<Album> = {};
        let albumName = album.name.replace(/-/g, ' ');
        let albumArtist = 'Rose Kestrelle';
        let albumImageUrl: string | undefined;
        
        for (const track of tracks) {
          if (track.isFile() && track.name.endsWith('.mp3')) {
            const filePath = path.join(albumPath, track.name);
            const metadata = await getTrackMetadata(filePath);
            
            // Use the first track's image as album image if not set yet
            if (!albumImageUrl && metadata.imageUrl) {
              albumImageUrl = metadata.imageUrl;
            }
            
            if (!albumMetadata.year && metadata.year) {
              albumMetadata = {
                year: metadata.year,
                genre: metadata.genre
              };
            }

            albumTracks.push({
              id: track.name,
              title: metadata.title || parseTrackTitle(track.name),
              audioUrl: `/music/albums/${album.name}/${track.name}`,
              artist: metadata.artist || 'Rose Kestrelle',
              album: metadata.album || album.name.replace(/-/g, ' '),
              trackNumber: metadata.trackNumber || parseTrackNumber(track.name),
              duration: metadata.duration,
              year: metadata.year,
              genre: metadata.genre,
              imageUrl: metadata.imageUrl || albumImageUrl,
              secretKey: generateTrackSecretKey(metadata.title || parseTrackTitle(track.name))
            });
          }
        }

        albumTracks.sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));

        // Use album info from first track if available
        if (albumTracks.length > 0) {
          albumName = albumTracks[0].album || albumName;
          albumArtist = albumTracks[0].artist || albumArtist;
        }
        
        // Generate key using just the album name - SIMPLE!
        const albumSecretKey = generateAlbumSecretKey(albumName);

        if (albumTracks.length > 0 && (!secretKey || secretKey === albumSecretKey)) {
          library.albums.push({
            id: album.name,
            name: albumName,
            tracks: albumTracks,
            year: albumMetadata.year,
            genre: albumMetadata.genre,
            imageUrl: albumImageUrl,
            secretKey: albumSecretKey
          });
        }
      }
    }

    library.albums.sort((a, b) => a.name.localeCompare(b.name));

    return library;
  } catch (error) {
    console.error('Error reading music directory:', error);
    return { singles: [], albums: [] };
  }
}

// Add new return type that can include album info
export interface SharedContent {
  track: Track;
  album?: Album;
}

export async function getTrackBySecretKey(secretKey: string): Promise<Track | null> {
  const library = await getMusicLibrary();
  
  // Check singles first
  const track = library.singles.find(t => t.secretKey === secretKey);
  if (track) return track;

  // Check albums and their tracks
  for (const album of library.albums) {
    // If album has this secret key, return first track with album reference
    if (album.secretKey === secretKey && album.tracks.length > 0) {
      return album.tracks[0]; // Return the first track of the album
    }
    
    const track = album.tracks.find(t => t.secretKey === secretKey);
    if (track) return track;
  }

  return null;
}

// Add a new function to get an entire album by key
export async function getAlbumBySecretKey(secretKey: string): Promise<Album | null> {
  const library = await getMusicLibrary();
  
  // Look for album with matching secret key
  const album = library.albums.find(a => a.secretKey === secretKey);
  if (album) return album;
  
  // If not found directly, check if any track in an album has this key
  for (const album of library.albums) {
    const trackInAlbum = album.tracks.find(t => t.secretKey === secretKey);
    if (trackInAlbum) return album;
  }
  
  return null;
}