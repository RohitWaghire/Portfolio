import type { Metadata, Viewport } from 'next';
import './globals.css';
import './theme.css';
import { siteConfig } from '@/data/site-config';
import { PROJECTS } from '@/data/projects';

const CARD_IMAGE_SIZES = '(max-width: 428px) 84vw, (max-width: 767px) 360px, 520px';
const poster640 = (url: string) => url.replace(/\.webp(\?.*)?$/, '-640.webp$1');

// The canvas centres project 5 on load; preload its neighbours so whichever
// poster ends up as LCP is already in flight before hydration.
const INITIAL_POSTERS = PROJECTS.slice(4, 8)
  .map((project) => project.video?.poster)
  .filter((poster): poster is string => Boolean(poster));

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
        url: '/opengraph-image.jpg?v=2',
        width: 1200,
        height: 630,
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
    images: ['/twitter-image.jpg?v=2']
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
        {/* Start render-critical assets before hydration paints the canvas. */}
        <link
          rel="preload"
          as="font"
          href="/inter_tight.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {INITIAL_POSTERS.map((poster) => (
          <link
            key={poster}
            rel="preload"
            as="image"
            href={poster640(poster)}
            imageSrcSet={`${poster640(poster)} 640w, ${poster} 960w`}
            imageSizes={CARD_IMAGE_SIZES}
            fetchPriority="high"
          />
        ))}
        {children}
      </body>
    </html>
  );
}
