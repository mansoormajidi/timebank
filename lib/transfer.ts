import { latinDigits } from './forms';
export type DestinationKind = 'card' | 'iban' | 'account';
export const sourceAccounts = [
  { id: 'daily', title: 'هزینه‌های روزمره', number: '0108274567001', card: '6219675489475376', balance: 248560000 },
  { id: 'saving', title: 'پس‌انداز', number: '0108274567002', card: '6219675489475311', balance: 1250000000 },
];
export const recipients: { id: string; name: string; value: string; kind: DestinationKind; avatar: string }[] = [
  { id: 'hesam-card', name: 'حسام بیات', value: '6037990000001234', kind: 'card', avatar: '/assets/avatars/avtr02.svg' },
  { id: 'mansoor-card', name: 'منصور مجیدی', value: '6104330000005678', kind: 'card', avatar: '/assets/avatars/avtr05.svg' },
  { id: 'hesam-iban', name: 'حسام بیات', value: 'IR000000000000000000001234', kind: 'iban', avatar: '/assets/avatars/avtr07.svg' },
  { id: 'mansoor-account', name: 'منصور مجیدی', value: '0108274567014', kind: 'account', avatar: '/assets/avatars/avtr03.svg' },
];
export const kindLabels: Record<DestinationKind, string> = { card: 'کارت', iban: 'شبا', account: 'سپرده' };
export function cleanDestination(value: string) { return latinDigits(value).replace(/[\s\-٬,]/g, '').toUpperCase(); }
export function destinationKind(value: string): DestinationKind | null {
  const clean = cleanDestination(value);
  if (/^IR\d{24}$/.test(clean)) return 'iban';
  if (/^\d{16}$/.test(clean)) return 'card';
  if (/^\d{10,14}$/.test(clean)) return 'account';
  return null;
}
export function formattedDestination(value: string) { return value.startsWith('IR') ? value.match(/.{1,4}/g)?.join(' ') || value : value.length === 16 ? value.match(/.{1,4}/g)?.join(' ') || value : value; }

const cardIbans: Record<string, string> = {
  '6037990000001234': 'IR000000000000000000001234',
  '6104330000005678': 'IR000000000000000000005678',
  '6219675489475376': 'IR000000000010827456700001',
  '6219675489475311': 'IR000000000010827456700002',
};

export function destinationIban(value: string) {
  const clean = cleanDestination(value);
  if (/^IR\d{24}$/.test(clean)) return clean;
  if (!/^\d{16}$/.test(clean)) return null;
  return cardIbans[clean] || `IR${clean.padStart(24, '0')}`;
}

export const methods = [
  { id: 'card', title: 'کارت به کارت', caption: 'انتقال در لحظه', fee: 6000, min: 10000, max: 100000000, kinds: ['card'] },
  { id: 'time', title: 'تایم به تایم', caption: 'انتقال حساب به حساب', fee: 0, min: 10000, max: 2000000000, kinds: ['account'] },
  { id: 'pol', title: 'بین بانکی (پل)', caption: 'انتقال در لحظه', fee: 5000, min: 10000, max: 200000000, kinds: ['iban', 'card'] },
  { id: 'paya', title: 'بین بانکی (پایا)', caption: 'تسویه در چرخهٔ بعد', fee: 2000, min: 10000, max: 1000000000, kinds: ['iban', 'card'] },
  { id: 'satna', title: 'بین بانکی (ساتنا)', caption: 'برای مبالغ بالاتر', fee: 10000, min: 500000000, max: 2000000000, kinds: ['iban', 'card'] },
] as const;
export type Method = typeof methods[number];

export function methodDestination(methodId: Method['id'], value: string) {
  if (methodId === 'pol' || methodId === 'paya' || methodId === 'satna') return destinationIban(value) || cleanDestination(value);
  return cleanDestination(value);
}
// All limits, fees, numbers and recipients here are fixtures, not banking rules.
export function methodError(method: Method, kind: DestinationKind | null, amount: number, balance: number) {
  if (!kind || !(method.kinds as readonly string[]).includes(kind)) return 'برای این نوع مقصد در دسترس نیست';
  if (amount < method.min) return `حداقل مبلغ نمونه: ${method.min.toLocaleString('fa-IR')} ریال`;
  if (amount > method.max) return `حداکثر مبلغ نمونه: ${method.max.toLocaleString('fa-IR')} ریال`;
  if (amount + method.fee > balance) return 'موجودی برای مبلغ و کارمزد کافی نیست';
  return '';
}
