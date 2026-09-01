import type { Metadata } from 'next';
import '@fontsource-variable/vazirmatn';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://waqf-bank-home-light-mansvr.mansoormajidi.chatgpt.site'),
  title: 'تایم‌بانک | خانه — نسخهٔ نمایشی',
  description: 'پروتوتایپ تعاملی نسخهٔ روشن تایم‌بانک با خدمات بانکی، وقف و امور اوقاف. اطلاعات و عملیات کاملاً نمایشی هستند.',
  robots: { index: false, follow: false },
  openGraph: { title: 'تایم‌بانک | خانه — نسخهٔ روشن', description: 'پروتوتایپ تعاملی Home با خدمات بانکی و اوقاف؛ تمام اطلاعات نمایشی هستند.', locale: 'fa_IR', type: 'website', url: 'https://waqf-bank-home-light-mansvr.mansoormajidi.chatgpt.site', images: [{ url: 'https://waqf-bank-home-light-mansvr.mansoormajidi.chatgpt.site/og.png', width: 1731, height: 909, alt: 'تایم‌بانک، خانه، نسخهٔ روشن' }] },
  twitter: { card: 'summary_large_image', title: 'تایم‌بانک | خانه — نسخهٔ روشن', description: 'پروتوتایپ تعاملی Home با خدمات بانکی و اوقاف؛ تمام اطلاعات نمایشی هستند.', images: ['https://waqf-bank-home-light-mansvr.mansoormajidi.chatgpt.site/og.png'] },
  icons: { icon: '/assets/imgGroup2.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
