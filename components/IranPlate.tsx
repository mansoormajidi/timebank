'use client';
import { digits, persianDigits } from '../lib/forms';

export type PlateKind = 'private' | 'public' | 'agricultural' | 'government' | 'disabled' | 'taxi' | 'police' | 'sepah' | 'protocol' | 'armed' | 'defense' | 'army' | 'diplomatic';
export type PlateValue = { left: string; letter: string; middle: string; city: string };

export const initialPlate: PlateValue = { left: '', letter: 'ب', middle: '', city: '' };

const letters = ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'د', 'ز', 'س', 'ش', 'ص', 'ط', 'ع', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی', 'معلولین', 'تشریفات', 'D', 'S'];

export function resolvePlateKind(letter: string): PlateKind {
  if (letter === 'الف') return 'government';
  if (letter === 'ک') return 'agricultural';
  if (letter === 'ع') return 'public';
  if (letter === 'ت') return 'taxi';
  if (letter === 'پ') return 'police';
  if (letter === 'ث') return 'sepah';
  if (letter === 'تشریفات') return 'protocol';
  if (letter === 'ف') return 'armed';
  if (letter === 'ز') return 'defense';
  if (letter === 'ش') return 'army';
  if (letter === 'D' || letter === 'S') return 'diplomatic';
  if (letter === 'معلولین') return 'disabled';
  return 'private';
}

export function plateKindLabel(letter: string) {
  const labels: Record<PlateKind, string> = { private: 'پلاک شخصی', public: 'پلاک عمومی', agricultural: 'پلاک کشاورزی', government: 'پلاک دولتی', disabled: 'پلاک معلولین', taxi: 'پلاک تاکسی', police: 'پلاک نیروی انتظامی', sepah: 'پلاک سپاه', protocol: 'پلاک تشریفات', armed: 'پلاک نیروهای مسلح', defense: 'پلاک وزارت دفاع', army: 'پلاک ارتش', diplomatic: 'پلاک سیاسی و خدمت' };
  return labels[resolvePlateKind(letter)];
}

export function IranPlate({ value, onChange, readOnly = false }: { value: PlateValue; onChange?: (next: PlateValue) => void; readOnly?: boolean }) {
  const kind = resolvePlateKind(value.letter);
  const updateDigits = (key: 'left' | 'middle' | 'city', raw: string, max: number) => onChange?.({ ...value, [key]: digits(raw).slice(0, max) });
  const placeholder = (count: number) => '–'.repeat(count);
  const letterValue = kind === 'disabled' ? '♿' : value.letter;
  return <div className={`iran-plate plate-${kind} ${readOnly ? 'is-readonly' : ''}`} dir="ltr">
    <span className="plate-country"><i aria-hidden="true"><b/><b/><b/></i><small>I.R.<br/>IRAN</small></span>
    {readOnly ? <strong className="plate-part plate-left">{value.left ? persianDigits(value.left) : placeholder(2)}</strong> : <input className="plate-part plate-left" value={persianDigits(value.left)} inputMode="numeric" maxLength={2} aria-label="دو رقم سمت چپ پلاک" placeholder="– –" onChange={event => updateDigits('left', event.target.value, 2)}/>}
    {readOnly ? <strong className="plate-letter">{letterValue}</strong> : <select className="plate-letter" value={value.letter} aria-label="حرف و نوع پلاک" onChange={event => onChange?.({ ...value, letter: event.target.value })}>{letters.map(letter => <option key={letter} value={letter}>{letter === 'معلولین' ? '♿ معلولین' : letter}</option>)}</select>}
    {readOnly ? <strong className="plate-part plate-middle">{value.middle ? persianDigits(value.middle) : placeholder(3)}</strong> : <input className="plate-part plate-middle" value={persianDigits(value.middle)} inputMode="numeric" maxLength={3} aria-label="سه رقم میانی پلاک" placeholder="– – –" onChange={event => updateDigits('middle', event.target.value, 3)}/>}
    <span className="plate-separator">−</span>
    <span className="plate-city"><small>ایران</small>{readOnly ? <strong>{value.city ? persianDigits(value.city) : placeholder(2)}</strong> : <input value={persianDigits(value.city)} inputMode="numeric" maxLength={2} aria-label="کد شهر پلاک" placeholder="– –" onChange={event => updateDigits('city', event.target.value, 2)}/>}</span>
  </div>;
}
