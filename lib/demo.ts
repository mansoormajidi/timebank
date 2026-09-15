import type { IconName } from '../components/Icon';
export const account = { name: 'نبض زمان و خرج', balance: '۲۴۸٬۵۶۰٬۰۰۰', number: '۰۱۰۸۲۷۴۵۶۷۰۰۱', iban: 'IR۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰', card: '۶۲۱۹ ۶۷۵۴ ۸۹۴۷ ۵۳۷۶' };
export const quickActions: { id: string; title: string; icon: IconName }[] = [
  { id: 'transfer', title: 'جابه‌جایی', icon: 'transfer' }, { id: 'statement', title: 'ردپای مالی', icon: 'statement' },
  { id: 'numbers', title: 'شناسه‌ها', icon: 'numbers' }, { id: 'topup', title: 'کوک کردن حساب', icon: 'plus' },
];
export const navigation: { id: string; title: string; icon: IconName }[] = [
  { id: 'home', title: 'خانه', icon: 'home' }, { id: 'services', title: 'خدمات', icon: 'services' },
  { id: 'assistant', title: 'دستیار', icon: 'assistant' }, { id: 'support', title: 'پشتیبانی', icon: 'support' },
];
export const services: { id: string; title: string; icon: IconName; description: string }[] = [
  { id: 'gold-fund', title: 'صندوق طلا', icon: 'gold', description: 'سرمایه‌گذاری آسان در صندوق‌های مبتنی بر طلا' },
  { id: 'token', title: 'توکن', icon: 'token', description: 'مدیریت توکن‌ها و دارایی‌های دیجیتال تایم‌بانک' },
  { id: 'time-fund', title: 'صندوق زمان', icon: 'timeFund', description: 'پس‌انداز هدفمند برای برنامه‌های آینده' },
];
export const activities: { id: string; title: string; subtitle: string; value: string; icon: IconName; pending?: boolean }[] = [
  { id: 'donation', title: 'امامزاده صالح عزیز تجریش', subtitle: 'امروز، ۱۰:۳۵', value: '۲۵۰٬۰۰۰٬۰۰۰ ریال', icon: 'receipt' },
  { id: 'hold', title: 'مسدودی مبلغ', subtitle: 'حساب خرج روزمره', value: '۱۲٬۰۰۰٬۰۰۰ ریال', icon: 'blocked' },
];
