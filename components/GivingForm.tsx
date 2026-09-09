'use client';
import { useRef, useState } from 'react';
import { SuccessAnimation } from './SuccessAnimation';
import type { ActivityEvent } from '../lib/activity';
import { MaterialField } from './MaterialField';
import { digits, money } from '../lib/forms';
import { ActionButton } from './ui/ActionButton';
export function GivingForm({ endowment, onClose, onComplete }: { endowment: boolean; onClose: () => void; onComplete:(event:ActivityEvent)=>void }) {
  const submitted=useRef(false);
  const [amount, setAmount] = useState(''); const [error, setError] = useState(''); const [done, setDone] = useState(false);
  return done ? <div className="success-panel"><SuccessAnimation /><h2>درخواست نمایشی ثبت شد</h2><p>{money(Number(amount))} ریال برای {endowment ? 'وقف پول' : 'کمک به امام‌زاده عبدالله'}</p><p className="sheet-note">هیچ مبلغی از حساب کسر نشده است.</p><ActionButton shape="pill" className="primary-button" onClick={onClose}>بازگشت به خانه</ActionButton></div> : <form onSubmit={e => { e.preventDefault(); if (Number(amount) < 10000 || Number(amount) > 248560000) setError('مبلغی بین ۱۰٬۰۰۰ و ۲۴۸٬۵۶۰٬۰۰۰ ریال وارد کنید.'); else if(!submitted.current){submitted.current=true;onComplete({title:endowment?'وقف پول':'کمک به امام‌زاده عبدالله',value:`${money(Number(amount))} ریال`,icon:endowment?'mosque':'receipt',details:[['نوع مشارکت',endowment?'کار ماندگار':'کار خوب'],['وضعیت','ثبت نمایشی موفق']]});setDone(true);} }}><p className="sheet-description">{endowment ? 'وقف پول برای یک اثر ماندگار' : 'کمک به امام‌زاده عبدالله'}</p><MaterialField label="مبلغ مشارکت (ریال)" value={amount ? money(Number(amount)) : ''} inputMode="numeric" dir="ltr" error={error} onChange={e => setAmount(digits(e.target.value))} /><ActionButton type="submit" shape="pill" className="primary-button">{endowment ? 'ثبت وقف نمایشی' : 'ثبت کمک نمایشی'}</ActionButton><p className="sheet-note">فقط تجربهٔ رابط کاربری؛ بدون پرداخت واقعی.</p></form>;
}
