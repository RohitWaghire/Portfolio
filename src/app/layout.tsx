import type { Metadata, Viewport } from 'next';
import './globals.css';
import './theme.css';
import { siteConfig } from '@/data/site-config';

/**
 * Browser metadata. Everything here comes from `siteConfig` in
 * `src/data/site-config.ts` — edit it there, not here.
 */
export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.headline,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 2400,
        height: 1260,
        alt: `${siteConfig.name}, ${siteConfig.headline}`,
        type: 'image/jpeg'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    creator: siteConfig.x.label,
    title: siteConfig.headline,
    description: siteConfig.description,
    images: ['/twitter-image.jpg']
  }
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="sansfont_657bc9a0-module__p_Gyiq__variable antialiased">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
