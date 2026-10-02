import Script from 'next/script';
import localFont from 'next/font/local';
import '@/css/site.css';
import { site, origin } from '@/content/site';
import { Analytics } from '@/components/Analytics';

// Self-hosted Cyrillic fonts: no requests to Google Fonts from visitors.
const sans = localFont({ src: [
  { path: '../node_modules/@fontsource/manrope/files/manrope-cyrillic-400-normal.woff2', weight: '400' },
  { path: '../node_modules/@fontsource/manrope/files/manrope-cyrillic-600-normal.woff2', weight: '600' }
], variable: '--font-sans', display: 'swap' });
const serif = localFont({ src: '../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-500-normal.woff2', weight: '500', variable: '--font-serif', display: 'swap' });
export const metadata = { metadataBase: new URL(origin), icons: { icon: '/icon.svg' } };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#f7f5ee' };
export default function RootLayout({ children }) {
  return <html lang="ru" className={`${sans.variable} ${serif.variable}`}><body><Script src="/site-config.js" strategy="beforeInteractive" />
    <a className="skip" href="#main">{site.skip}</a>{children}<Analytics />
  </body></html>;
}
