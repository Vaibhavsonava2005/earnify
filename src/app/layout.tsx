import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://earnify.site'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'Earnify - Watch Ads & Earn Real Money',
    template: '%s | Earnify'
  },
  description: 'Join 50,000+ users earning ₹1 Lakh/Month by watching ads and completing simple tasks. Instant UPI withdrawals. 100% Safe & Secure.',
  keywords: ['earn money online', 'watch ads earn money', 'earnify', 'earnify.site', 'online earning app', 'work from home', 'daily cash', 'upi withdrawal app'],
  authors: [{ name: 'Earnify Team' }],
  creator: 'Earnify',
  publisher: 'Earnify',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Earnify - Watch Ads & Earn Real Money',
    description: 'Start earning daily cash by watching ads and completing simple tasks. Trusted by 50k+ users.',
    url: 'https://earnify.site',
    siteName: 'Earnify',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Earnify Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earnify - Watch Ads & Earn Real Money',
    description: 'Join 50k+ users earning daily cash via UPI! 💰',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  verification: {
    google: '1WjBcTHROyg0lp8O5khehrTQgUVUuMhNOjoT5z1iFCU',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebApplication',
                  name: 'Earnify',
                  url: 'https://earnify.site',
                  applicationCategory: 'FinanceApplication',
                  operatingSystem: 'Any',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'INR',
                  },
                  description: 'Earnify is India\'s trusted online earning platform. Earn real money by watching ads, completing tasks, referring friends, and playing games. Instant UPI withdrawals.',
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    ratingCount: '50000',
                    bestRating: '5',
                    worstRating: '1',
                  },
                },
                {
                  '@type': 'Organization',
                  name: 'Earnify',
                  url: 'https://earnify.site',
                  logo: 'https://earnify.site/icon-512.png',
                  description: 'Earn real money online by watching ads and completing simple tasks on earnify.site.',
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: 'support@earnify.site',
                    availableLanguage: ['English', 'Hindi'],
                  },
                },
                {
                  '@type': 'WebSite',
                  name: 'Earnify',
                  url: 'https://earnify.site',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://earnify.site/?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://earnify.site' },
                    { '@type': 'ListItem', position: 2, name: 'About Earnify', item: 'https://earnify.site/about' },
                    { '@type': 'ListItem', position: 3, name: 'How It Works', item: 'https://earnify.site/how-it-works' },
                    { '@type': 'ListItem', position: 4, name: 'Contact', item: 'https://earnify.site/contact' },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
