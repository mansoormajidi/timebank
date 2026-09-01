'use client';
import { useRef, useState, useSyncExternalStore } from 'react';
import { getCardOtp, getServerCardOtp, isValidCardOtp, subscribeCardOtp } from '../lib/card-otp';
import { persianDigits } from '../lib/forms';
import type { ActivityEvent } from '../lib/activity';
import { Icon } from './Icon';

export function CardOtpPanel({ onComplete }: { onComplete: (event: ActivityEvent) => void }) {
  const otp = useSyncExternalStore(subscribeCardOtp, getCardOtp, getServerCardOtp);
  const [copiedCode, setCopiedCode] = useState('');
  const [error, setError] = useState('');
  const logged = useRef(false);
  async function copy() {
    if (!otp || !isValidCardOtp(otp.code)) return;
    try {
      await navigator.clipboard.writeText(otp.code);
      setCopiedCode(otp.code); setError('');
      if (!logged.current) { logged.current = true; onComplete({ title: 'دریافت رمز پویای گرین‌کارت', value: 'کپی شد', icon: 'card' }); }
    } catch { setError('کپی خودکار در دسترس نیست؛ عدد رمز را انتخاب و کپی کنید.'); }
  }
  return <div className="card-otp-panel">
    <p className="sheet-description">رمز دوم گرین‌کارت شما</p>
    <div className="card-otp-code" dir="ltr" aria-label="رمز دوم پویا">{otp ? persianDigits(otp.code) : '••••••'}</div>
    <div className="card-otp-timer"><span>صدور رمز جدید تا</span><strong dir="ltr">۰۰:{persianDigits(String(otp?.seconds ?? 30).padStart(2, '0'))}</strong></div>
    <div className="card-otp-progress" role="progressbar" aria-label="اعتبار رمز پویا" aria-valuemin={0} aria-valuemax={30} aria-valuenow={otp?.seconds ?? 30}><span style={{ width: `${(otp?.seconds ?? 30) / 30 * 100}%` }} /></div>
    <button className="primary-button otp-copy-button" disabled={!otp} onClick={copy}><Icon name="copy" size={20} />{copiedCode && copiedCode === otp?.code ? 'رمز پویا کپی شد' : 'کپی رمز پویا'}</button>
    <p className="otp-copy-status" role="status">{copiedCode && copiedCode === otp?.code ? 'رمز برای استفاده در انتقال نمایشی کپی شد.' : ''}</p>
    {error && <p role="alert" className="camera-error">{error}</p>}
    <p className="sheet-note">رمز هر ۳۰ ثانیه عوض می‌شود. فقط در همین پروتوتایپ اعتبار دارد.</p>
  </div>;
}
