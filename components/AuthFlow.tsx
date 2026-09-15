'use client';
import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { BottomSheet } from './BottomSheet';
import { MaterialField } from './MaterialField';
import { OtpField } from './OtpField';
import { SplashScreen } from './SplashScreen';
import { ActionButton } from './ui/ActionButton';
import { DEMO_OTP, digits, persianDigits } from '../lib/forms';
import { findPrototypeMobile, registerPrototypeUser } from '../lib/auth-directory';

type Step = 'nationalId' | 'mobile' | 'otp';

function maskMobile(value: string) {
  const normalized = digits(value);
  if (normalized.length !== 11) return 'شماره همراه شما';
  return persianDigits(`${normalized.slice(0, 4)}***${normalized.slice(-4)}`);
}

export type AuthenticatedUser = { nationalId: string; mobile: string; isNew: boolean };

export function AuthFlow({ onClose, playSplash = false }: { initialMode?: 'login' | 'signup'; onClose: (user: AuthenticatedUser) => void; playSplash?: boolean }) {
  const [splashDone, setSplashDone] = useState(!playSplash);
  const [step, setStep] = useState<Step>('nationalId');
  const [nationalId, setNationalId] = useState('');
  const [mobile, setMobile] = useState('');
  const [resolvedMobile, setResolvedMobile] = useState('');
  const [existingUser, setExistingUser] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submitNationalId() {
    const normalized = digits(nationalId);
    if (normalized.length !== 10) { setErrors({ nationalId: 'کد ملی باید ۱۰ رقم باشد.' }); return; }
    const knownMobile = findPrototypeMobile(normalized);
    setErrors({});
    if (knownMobile) {
      setExistingUser(true);
      setResolvedMobile(knownMobile);
      setStep('otp');
    } else {
      setExistingUser(false);
      setStep('mobile');
    }
  }

  function submitMobile() {
    const normalized = digits(mobile);
    if (!/^09\d{9}$/.test(normalized)) { setErrors({ mobile: 'شماره موبایل معتبر وارد کنید.' }); return; }
    setResolvedMobile(normalized);
    setErrors({});
    setStep('otp');
  }

  function submitOtp() {
    if (digits(otp) !== DEMO_OTP) { setErrors({ otp: 'کد آزمایشی ۱۲۳۴۵۶ را وارد کنید.' }); return; }
    const normalizedNationalId = digits(nationalId);
    if (!existingUser) registerPrototypeUser(normalizedNationalId, resolvedMobile);
    setErrors({});
    onClose({ nationalId: normalizedNationalId, mobile: resolvedMobile, isNew: !existingUser });
  }

  function back() {
    setErrors({});
    setOtp('');
    if (step === 'otp') setStep(existingUser ? 'nationalId' : 'mobile');
    else setStep('nationalId');
  }

  const title = step === 'nationalId' ? 'ورود به تایم‌بانک' : step === 'mobile' ? 'شماره همراه شما' : 'کد تأیید را وارد کنید';
  const subtitle = step === 'nationalId'
    ? 'برای ورود یا ساخت حساب، کد ملی خود را وارد کنید.'
    : step === 'mobile'
      ? 'این کد ملی هنوز در تایم‌بانک ثبت نشده است. شماره موبایل متعلق به خودتان را وارد کنید.'
      : `کد ۶ رقمی به ${maskMobile(resolvedMobile)} ارسال شد.`;

  const content = step === 'nationalId' ? <form className="flow-form" onSubmit={event => { event.preventDefault(); submitNationalId(); }}>
    <MaterialField label="کد ملی" value={nationalId} inputMode="numeric" autoComplete="username" maxLength={10} dir="ltr" leading={<img src="/assets/kodemelli.svg" alt="" />} error={errors.nationalId} onChange={event => { setNationalId(digits(event.target.value)); setErrors({}); }} />
    <button type="button" className="demo-fill" onClick={() => { setNationalId('1234567890'); setErrors({}); }}>درج کد ملی کاربر آزمایشی</button>
    <ActionButton type="submit" className="flow-button">ادامه</ActionButton>
  </form> : step === 'mobile' ? <form className="flow-form" onSubmit={event => { event.preventDefault(); submitMobile(); }}>
    <div className="auth-identity-chip"><span>کد ملی</span><strong dir="ltr">{persianDigits(nationalId)}</strong></div>
    <MaterialField label="شماره موبایل" value={mobile} inputMode="tel" autoComplete="tel" maxLength={11} dir="ltr" error={errors.mobile} hint="شماره موبایل باید به نام صاحب کد ملی باشد." onChange={event => { setMobile(digits(event.target.value)); setErrors({}); }} />
    <button type="button" className="demo-fill" onClick={() => { setMobile('09120000000'); setErrors({}); }}>درج شماره آزمایشی</button>
    <ActionButton type="submit" className="flow-button">ارسال کد تأیید</ActionButton>
  </form> : <div className="flow-form"><OtpField value={otp} onChange={value => { setOtp(value); setErrors({}); }} error={errors.otp} /><ActionButton className="flow-button" onClick={submitOtp}>{existingUser ? 'ورود به تایم‌بانک' : 'تأیید و ساخت حساب'}</ActionButton></div>;

  return <div className="auth-splash-stage"><div inert={splashDone}><SplashScreen animateEntrance={playSplash && !splashDone} onFinished={() => setSplashDone(true)} /></div><AnimatePresence>{splashDone && <BottomSheet key={`authentication-${step}`} className={`auth-sheet ${step === 'otp' ? 'auth-otp-sheet' : ''}`} title={title} subtitle={subtitle} onBack={step !== 'nationalId' ? back : undefined}><div key={step}>{content}</div></BottomSheet>}</AnimatePresence></div>;
}
