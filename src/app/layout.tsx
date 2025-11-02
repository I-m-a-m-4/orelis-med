
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';

const siteConfig = {
  name: 'Orelis',
  description: 'The ultimate platform for patient management, intelligent scheduling, and AI-powered insights. Streamline your clinic\'s workflow, reduce no-shows, and enhance patient care with Orelis.',
  url: 'https://orelis.app', // Replace with your actual domain
  ogImage: 'https://orelis.app/og.png', // Replace with your actual OG image URL
  links: {
    twitter: 'https://twitter.com/orelisapp', // Replace with your Twitter handle
    github: 'https://github.com/orelisapp', // Replace with your GitHub repo
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
    manifest: '/manifest.json',
  keywords: [
    'Clinic Management Software',
    'Patient Management',
    'EHR',
    'EMR',
    'Healthcare AI',
    'Appointment Scheduling',
    'Medical Practice Software',
  ],
  authors: [
    {
      name: 'Orelis Team',
      url: siteConfig.url,
    },
  ],
  creator: 'Orelis Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@orelisapp', // Replace with your Twitter handle
  },
    icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Geist:wght@300;400;500;600;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body h-full bg-background text-foreground antialiased">
        <FirebaseClientProvider>
          <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
          <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
            >
              {children}
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
