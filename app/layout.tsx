import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://thesaju-boostweb.vercel.app'),
  title: 'THE SAJU — Traditional Korean Fortune Mapping',
  description: 'Decode your destiny through 5,000 years of Eastern wisdom. Enter your birth date and time to receive your personalized Saju (Four Pillars of Destiny) reading.',
  keywords: ['saju', '사주', '사주팔자', 'four pillars', 'korean fortune', 'destiny', '운세', '사주명리'],
  authors: [{ name: 'THE SAJU' }],
  openGraph: {
    title: 'THE SAJU — Traditional Korean Fortune Mapping',
    description: 'Decode your destiny through 5,000 years of Eastern wisdom.',
    url: 'https://thesaju-boostweb.vercel.app',
    siteName: 'THE SAJU',
    images: [{ url: '/images/guide-seoha.png', alt: 'THE SAJU · Seoha' }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE SAJU',
    description: 'Decode your destiny through 5,000 years of Eastern wisdom.',
    images: ['/images/guide-seoha.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
