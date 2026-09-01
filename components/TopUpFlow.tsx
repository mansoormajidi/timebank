'use client';

import { useEffect, useRef, useState } from 'react';
import type { ActivityEvent } from '../lib/activity';

type Step = 'amount' | 'gateway' | 'processing' | 'success';
const faMoney = (value: number) => new Intl.NumberFormat('fa-IR').format(value);
const normalizeDigits = (value: string) => value.replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/\D/g, '');

export function TopUpFlow({ onClose, onComplete }: { onClose: () => void; onComplete: (event: ActivityEvent) => void }) {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const recorded = useRef(false);
  const numericAmount = Number(amount);
  const validAmount = numericAmount >= 100000 && numericAmount <= 500000000;

  useEffect(() => {
    if (step !== 'processing') return;
    const timer = window.setTimeout(() => {
      if (!recorded.current) {
        recorded.current = true;
        onComplete({ title: 'افزایش موجودی', value: `${faMoney(numericAmount)} ریال`, icon: 'plus', details: [['حساب مقصد', 'هزینه‌های روزمره'], ['شماره پیگیری', '۸۴۶۲۹۱۷۵۳۰'], ['روش پرداخت', 'درگاه پرداخت اینترنتی']] });
      }
      setStep('success');
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [step, numericAmount, onComplete]);

  function pay() {
    if (card.replace(/\s/g, '').length !== 16 || cvv.length < 3 || expiry.length < 4 || password.length < 5) {
      setError('برای ادامه، اطلاعات آزمایشی کارت را کامل کنید.'); return;
    }
    setError(''); setStep('processing');
  }
  function fillDemo() { setCard('۶۲۱۹ ۸۶۱۹ ۱۰۱۱ ۱۲۱۳'); setCvv('۱۲۳'); setExpiry('۰۷۰۸'); setPassword('۱۲۳۴۵۶'); setError(''); }

  if (step === 'processing') return <div className="topup-processing" role="status"><div className="processing-spinner" /><h3>در حال تأیید پرداخت</h3><p>لطفاً این صفحه را نبندید…</p></div>;
  if (step === 'success') return <div className="topup-success"><div className="success-mark">✓</div><span className="success-kicker">پرداخت موفق</span><h3>موجودی با موفقیت افزایش یافت</h3><p className="topup-success-amount">+{faMoney(numericAmount)} <small>ریال</small></p><dl><div><dt>حساب مقصد</dt><dd>هزینه‌های روزمره</dd></div><div><dt>شماره پیگیری</dt><dd>۸۴۶۲۹۱۷۵۳۰</dd></div><div><dt>زمان پرداخت</dt><dd>همین حالا</dd></div></dl><button className="primary-button" onClick={onClose}>بازگشت به خانه</button><p className="sheet-note">این رسید و پرداخت صرفاً نمایشی است.</p></div>;
  if (step === 'gateway') return <div className="demo-gateway">
    <header><div className="gateway-shield">✓</div><div><strong>درگاه پرداخت امن</strong><small>شبکه پرداخت تایم · نسخه آزمایشی</small></div><span>۰۹:۵۹</span></header>
    <section className="gateway-invoice"><div><small>پذیرنده</small><strong>تایم‌بانک</strong></div><div><small>مبلغ پرداخت</small><strong>{faMoney(numericAmount)} ریال</strong></div></section>
    <p className="gateway-warning">اطلاعات واقعی کارت را وارد نکنید. این درگاه فقط برای نمایش جریان پرداخت است.</p>
    <button className="demo-data-button" onClick={fillDemo}>پر کردن اطلاعات آزمایشی</button>
    <div className="gateway-form"><label>شماره کارت<input dir="ltr" inputMode="numeric" value={card} onChange={event => setCard(event.target.value.slice(0, 19))} placeholder="----  ----  ----  ----" /></label><div><label>CVV2<input dir="ltr" inputMode="numeric" value={cvv} onChange={event => setCvv(normalizeDigits(event.target.value).slice(0, 4))} /></label><label>تاریخ انقضا<input dir="ltr" inputMode="numeric" value={expiry} onChange={event => setExpiry(normalizeDigits(event.target.value).slice(0, 4))} placeholder="ماه / سال" /></label></div><label>رمز پویای آزمایشی<input dir="ltr" inputMode="numeric" type="password" value={password} onChange={event => setPassword(normalizeDigits(event.target.value).slice(0, 8))} /></label></div>
    {error && <p className="topup-error" role="alert">{error}</p>}
    <div className="gateway-actions"><button onClick={pay}>پرداخت آزمایشی</button><button onClick={() => setStep('amount')}>انصراف و بازگشت</button></div>
  </div>;

  return <div className="topup-entry">
    <div className="topup-account"><span className="topup-wallet">＋</span><div><small>واریز به</small><strong>حساب هزینه‌های روزمره</strong><span>مانده فعلی: ۲۴۸٬۵۶۰٬۰۰۰ ریال</span></div></div>
    <label className={`topup-amount ${amount ? 'has-value' : ''}`}><span>مبلغ افزایش موجودی</span><div><input autoFocus dir="ltr" inputMode="numeric" value={amount ? faMoney(numericAmount) : ''} onChange={event => setAmount(normalizeDigits(event.target.value))} placeholder="۰" /><small>ریال</small></div></label>
    <div className="amount-suggestions">{[1000000, 5000000, 10000000].map(value => <button key={value} onClick={() => setAmount(String(value))}>+ {faMoney(value)}</button>)}</div>
    {amount && !validAmount && <p className="topup-error" role="alert">مبلغ باید بین ۱۰۰٬۰۰۰ تا ۵۰۰٬۰۰۰٬۰۰۰ ریال باشد.</p>}
    <section className="topup-summary"><div><span>مبلغ واریز</span><strong>{amount ? faMoney(numericAmount) : '۰'} ریال</strong></div><div><span>کارمزد</span><strong>رایگان</strong></div></section>
    <button className="primary-button topup-submit" disabled={!validAmount} onClick={() => setStep('gateway')}>واریز به حساب</button>
    <p className="topup-security"><span>✓</span> پرداخت در درگاه امن و آزمایشی انجام می‌شود.</p>
  </div>;
}
