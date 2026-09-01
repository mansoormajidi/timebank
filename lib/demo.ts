import type { IconName } from '../components/Icon';
export const account = { name: 'هزینه‌های روزمره', balance: '۲۴۸٬۵۶۰٬۰۰۰', number: '۰۱۰۸۲۷۴۵۶۷۰۰۱', iban: 'IR۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰', card: '۶۲۱۹ ۶۷۵۴ ۸۹۴۷ ۵۳۷۶' };
export const quickActions: { id: string; title: string; icon: IconName }[] = [
  { id: 'transfer', title: 'انتقال وجه', icon: 'transfer' }, { id: 'statement', title: 'صورتحساب', icon: 'statement' },
  { id: 'numbers', title: 'شماره‌ها', icon: 'numbers' }, { id: 'topup', title: 'افزایش موجودی', icon: 'plus' },
];
export const navigation: { id: string; title: string; icon: IconName }[] = [
  { id: 'home', title: 'خانه', icon: 'home' }, { id: 'services', title: 'خدمات', icon: 'services' },
  { id: 'transfer', title: 'انتقال', icon: 'transfer' }, { id: 'statement', title: 'صورتحساب', icon: 'statement' },
];
export const services: { id: string; title: string; icon: IconName; description: string }[] = [
  { id: 'bill', title: 'قبض', icon: 'receipt', description: 'استعلام و پرداخت قبض‌های خدماتی' },
  { id: 'shrines', title: 'امام‌زاده‌ها', icon: 'mosque', description: 'آشنایی با بقاع متبرکه و خدمات زیارتی' },
  { id: 'lease', title: 'اجاره‌نامه', icon: 'lease', description: 'مشاهده و پیگیری قراردادهای املاک موقوفه' },
];
export const activities: { id: string; title: string; subtitle: string; value: string; icon: IconName; pending?: boolean }[] = [
  { id: 'new-card', title: 'صدور کارت جدید', subtitle: 'کد پیگیری ۵۳۴۵۷۹', value: 'در حال بررسی', icon: 'card', pending: true },
  { id: 'donation', title: 'کمک به امام‌زاده عبدالله', subtitle: 'امروز، ۱۰:۳۵', value: '۲۵۰٬۰۰۰٬۰۰۰ ریال', icon: 'receipt' },
  { id: 'hold', title: 'مسدودی مبلغ', subtitle: 'حساب خرج روزمره', value: '۱۲٬۰۰۰٬۰۰۰ ریال', icon: 'blocked' },
];
