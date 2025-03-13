import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import PersistentPlayer from '@/components/PersistentPlayer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'Rose Kestrelle Music',
  description: 'Immerse yourself in the sonic landscapes of Rose Kestrelle - Ambient Electronic Music Artist',
  openGraph: {
    title: 'Rose Kestrelle Music',
    description: 'Discover and share ambient music by Rose Kestrelle',
    type: 'website',
    locale: 'en_US',
  },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {

  
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <MusicPlayerProvider>
          {children}
          <PersistentPlayer />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}