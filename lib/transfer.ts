import { latinDigits } from './forms';
export type DestinationKind = 'card' | 'iban' | 'account';
export const sourceAccounts = [
  { id: 'daily', title: 'هزینه‌های روزمره', number: '0108274567001', card: '6219675489475376', balance: 248560000 },
  { id: 'saving', title: 'پس‌انداز', number: '0108274567002', card: '6219675489475311', balance: 1250000000 },
];
export const recipients: { id: string; name: string; value: string; kind: DestinationKind; initials: string }[] = [
  { id: 'hesam-card', name: 'حسام بیات', value: '6037990000001234', kind: 'card', initials: 'ح ب' },
  { id: 'mansoor-card', name: 'منصور مجیدی', value: '6104330000005678', kind: 'card', initials: 'م م' },
  { id: 'hesam-iban', name: 'حسام بیات', value: 'IR000000000000000000001234', kind: 'iban', initials: 'ح ب' },
  { id: 'mansoor-account', name: 'منصور مجیدی', value: '0108274567014', kind: 'account', initials: 'م م' },
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
export const methods = [
  { id: 'card', title: 'کارت به کارت', caption: 'انتقال در لحظه', fee: 6000, min: 10000, max: 100000000, kinds: ['card'] },
  { id: 'internal', title: 'انتقال به سپرده', caption: 'انتقال در لحظه', fee: 0, min: 10000, max: 2000000000, kinds: ['account'] },
  { id: 'pol', title: 'بین بانکی (پل)', caption: 'انتقال در لحظه', fee: 5000, min: 10000, max: 200000000, kinds: ['iban'] },
  { id: 'paya', title: 'بین بانکی (پایا)', caption: 'تسویه در چرخهٔ بعد', fee: 2000, min: 10000, max: 1000000000, kinds: ['iban'] },
  { id: 'satna', title: 'بین بانکی (ساتنا)', caption: 'برای مبالغ بالاتر', fee: 10000, min: 500000000, max: 2000000000, kinds: ['iban'] },
] as const;
export type Method = typeof methods[number];
// All limits, fees, numbers and recipients here are fixtures, not banking rules.
export function methodError(method: Method, kind: DestinationKind | null, amount: number, balance: number) {
  if (!kind || !(method.kinds as readonly string[]).includes(kind)) return 'برای این نوع مقصد در دسترس نیست';
  if (amount < method.min) return `حداقل مبلغ نمونه: ${method.min.toLocaleString('fa-IR')} ریال`;
  if (amount > method.max) return `حداکثر مبلغ نمونه: ${method.max.toLocaleString('fa-IR')} ریال`;
  if (amount + method.fee > balance) return 'موجودی برای مبلغ و کارمزد کافی نیست';
  return '';
}
