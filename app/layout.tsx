import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/vazirmatn';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://waqf-bank-home-light-mansvr.mansoormajidi.chatgpt.site'),
  title: 'تایم‌بانک | خانه — نسخهٔ نمایشی',
  description: 'پروتوتایپ تعاملی نسخهٔ روشن تایم‌بانک با خدمات بانکی، وقف و امور اوقاف. اطلاعات و عملیات کاملاً نمایشی هستند.',
  robots: { index: false, follow: false },
  openGraph: { title: 'تایم‌بانک | خانه — نسخهٔ روشن', description: 'پروتوتایپ تعاملی Home با خدمات بانکی و اوقاف؛ تمام اطلاعات نمایشی هستند.', locale: 'fa_IR', type: 'website', url: 'https://waqf-bank-home-light-mansvr.mansoormajidi.chatgpt.site', images: [{ url: 'https://waqf-bank-home-light-mansvr.mansoormajidi.chatgpt.site/og.png', width: 1731, height: 909, alt: 'تایم‌بانک، خانه، نسخهٔ روشن' }] },
  twitter: { card: 'summary_large_image', title: 'تایم‌بانک | خانه — نسخهٔ روشن', description: 'پروتوتایپ تعاملی Home با خدمات بانکی و اوقاف؛ تمام اطلاعات نمایشی هستند.', images: ['https://waqf-bank-home-light-mansvr.mansoormajidi.chatgpt.site/og.png'] },
  applicationName: 'تایم‌بانک',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'تایم‌بانک' },
  icons: {
    icon: [
      { url: '/icons/timebank-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/timebank-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/timebank-180.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icons/timebank-192.png',
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f4f6' },
    { media: '(prefers-color-scheme: dark)', color: '#131e3c' },
  ],
};

const themeScript = `(function(){try{var saved=localStorage.getItem('timebank-theme');document.documentElement.dataset.theme=saved==='dark'?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /><script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async /></head><body>{children}</body></html>;
}
