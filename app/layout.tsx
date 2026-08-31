import type { Metadata } from 'next';
import '@fontsource-variable/vazirmatn';
import './globals.css';
export const metadata: Metadata = {
  title: 'همراه‌بانک | خانه — نسخهٔ نمایشی',
  description: 'پروتوتایپ تعاملی نسخهٔ روشن همراه‌بانک با خدمات بانکی، وقف و امور اوقاف. اطلاعات و عملیات کاملاً نمایشی هستند.',
  robots: { index: false, follow: false },
  openGraph: { title: 'همراه‌بانک | خانه — نسخهٔ روشن', description: 'پروتوتایپ تعاملی Home با خدمات بانکی و اوقاف؛ تمام اطلاعات نمایشی هستند.', locale: 'fa_IR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'همراه‌بانک | خانه — نسخهٔ روشن', description: 'پروتوتایپ تعاملی Home با خدمات بانکی و اوقاف؛ تمام اطلاعات نمایشی هستند.' },
  icons: { icon: '/assets/imgGroup2.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
