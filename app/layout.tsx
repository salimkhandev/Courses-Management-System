import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import AuthSessionProvider from '@/components/SessionProvider';
import ServiceWorker from '@/components/ServiceWorker';
import PWAInstallButton from '@/components/PWAInstallButton';
import PushNotificationManager from '@/components/PushNotificationManager';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Eng Luqman Hafeez - English Language Academy',
  description:
    'Learn English language and communication skills with Eng Luqman Hafeez.',
  manifest: '/manifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} data-scroll-behavior="smooth">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Eng Luqman Hafeez" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased">
        <AuthSessionProvider>
          {children}
          <PushNotificationManager />
        </AuthSessionProvider>
        <ServiceWorker />
        <PWAInstallButton />
      </body>
    </html>
  );
}
