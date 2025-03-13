
import MusicPlayerWrapper from '@/components/MusicPlayerWrapper';
import { getMusicLibrary } from '@/lib/music';
export default async function Home() {
  const library = await getMusicLibrary();
  return (
    <>
              <MusicPlayerWrapper library={library} /></>
  );
}