import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THE SAJU — Traditional Korean Fortune Mapping',
  description: 'Decode your destiny through 5,000 years of Eastern wisdom. Enter your birth date and time to receive your personalized Saju (Four Pillars of Destiny) reading.',
  keywords: ['saju', '사주', '사주팔자', 'four pillars', 'korean fortune', 'destiny', '운세', '사주명리'],
  authors: [{ name: 'THE SAJU' }],
  openGraph: {
    title: 'THE SAJU — Traditional Korean Fortune Mapping',
    description: 'Decode your destiny through 5,000 years of Eastern wisdom.',
    url: 'https://thesaju.vercel.app',
    siteName: 'THE SAJU',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'THE SAJU' }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE SAJU',
    description: 'Decode your destiny through 5,000 years of Eastern wisdom.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0A0F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
