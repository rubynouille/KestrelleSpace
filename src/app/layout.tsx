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
const ogImage = '/opengraph-image.png';
export const metadata: Metadata = {
  metadataBase: new URL('https://kestrelle.space'),
  title: 'Rose Kestrelle Music',
  description: 'Immerse yourself in the sonic landscapes of Rose Kestrelle - Ambient Electronic Music Artist',
  openGraph: {
    title: 'Rose Kestrelle Music',
    description: 'Discover and share ambient music by Rose Kestrelle',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Rose Kestrelle Music',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rose Kestrelle Music',
    description: 'Ambient Electronic Music by Rose Kestrelle',
    images: [ogImage],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <MusicPlayerProvider>
          <main>
          {children}
          </main>
          <PersistentPlayer />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}