'use client';
import { useState } from 'react';
import type { ActivityEvent } from '../lib/activity';
import type { CardIssuanceState, IssuedCardId } from '../lib/card-issuance';
import { latinDigits, digits } from '../lib/forms';
import { AuthAnimation } from './AuthAnimation';
import { BirthDatePicker } from './BirthDatePicker';
import { CameraCapture } from './CameraCapture';
import { CardIssuanceFlow } from './CardIssuanceFlow';
import { FlowShell } from './FlowShell';
import { IdentityAnimation } from './IdentityAnimation';
import { MaterialField } from './MaterialField';
import { SuccessAnimation } from './SuccessAnimation';
import { ActionButton } from './ui/ActionButton';

type Step = 'overview' | 'card' | 'cardDetails' | 'videoGuide' | 'video' | 'cardIssuance' | 'success';

export function IdentityVerificationFlow({ issuance, onRequest, onActivate, onComplete, onVerified, onClose }: {
  issuance: CardIssuanceState;
  onRequest: (cardId: IssuedCardId, address: string) => CardIssuanceState;
  onActivate: () => CardIssuanceState;
  onComplete: (event: ActivityEvent) => void;
  onVerified: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>('overview');
  const [photo, setPhoto] = useState('');
  const [serial, setSerial] = useState('');
  const [birthday, setBirthday] = useState('');
  const [noCard, setNoCard] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function back() {
    setErrors({});
    if (step === 'card') setStep('overview');
    else if (step === 'cardDetails') setStep('card');
    else if (step === 'videoGuide') setStep('cardDetails');
    else if (step === 'video') setStep('videoGuide');
    else onClose();
  }

  function confirmIdentityDetails() {
    const nextErrors: Record<string, string> = {};
    if (serial.trim().length < 6) nextErrors.serial = 'حداقل ۶ کاراکتر وارد کنید.';
    if (digits(birthday).length !== 8) nextErrors.birthday = 'تاریخ را به‌صورت سال/ماه/روز وارد کنید.';
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setStep('videoGuide');
  }

  function requestMandatoryCard(cardId: IssuedCardId, address: string) {
    const saved = onRequest(cardId, address);
    onVerified();
    onComplete({ id: 'identity-verification', title: 'تکمیل احراز هویت', value: 'تأیید شد', icon: 'card', details: [['نتیجه', 'هویت تأیید و حساب بانکی افتتاح شد'], ['وضعیت کارت', 'در حال صدور']] });
    return saved;
  }

  if (step === 'cardIssuance') return <CardIssuanceFlow issuance={issuance} onRequest={requestMandatoryCard} onActivate={onActivate} onComplete={onComplete} onRequested={() => setStep('success')} onClose={onClose}/>;

  const title: Record<Exclude<Step, 'cardIssuance'>, string> = {
    overview: 'احراز هویت بانکی', card: 'تصویر پشت کارت ملی', cardDetails: 'تأیید اطلاعات هویتی', videoGuide: 'راهنمای ویدیوی سلفی', video: 'احراز ویدیویی', success: 'احراز هویت تکمیل شد',
  };
  const progress: Record<Exclude<Step, 'cardIssuance'>, number> = { overview: 10, card: 25, cardDetails: 40, videoGuide: 55, video: 70, success: 100 };

  return <FlowShell variant={`auth-full-page banking-identity-flow internal-flow ${step === 'success' ? 'identity-success-flow' : ''}`} title={title[step]} subtitle={step === 'overview' ? 'برای افتتاح حساب و فعال شدن خدمات بانکی، این مراحل را کامل کنید.' : undefined} stepKey={step} onBack={back} onClose={onClose} progress={progress[step]}>
    {step === 'overview' && <div className="identity-overview banking-identity-overview"><IdentityAnimation />{[
      ['اطلاعات هویتی', 'تصویر پشت کارت ملی و تاریخ تولد', 'hoviati'],
      ['ویدیوی سلفی', 'تأیید زنده بودن و تطبیق چهره', 'selfie'],
      ['انتخاب و درخواست کارت', 'مرحله پایانی و الزامی افتتاح حساب', 'imgCreditCard'],
    ].map(([label, caption, icon]) => <div className="identity-card" key={label}><span className="service-icon"><img src={`/assets/${icon}.${icon === 'imgCreditCard' ? 'svg' : 'svg'}`} width="40" height="40" alt="" /></span><span><strong>{label}</strong><small>{caption}</small></span></div>)}<ActionButton className="flow-button" onClick={() => setStep('card')}>شروع احراز هویت</ActionButton></div>}
    {step === 'card' && <><div className="capture-copy"><b>مرحله ۱ از ۳</b><p>پشت کارت ملی را در کادر بگیرید. تصویر در همین مرورگر می‌ماند.</p></div><CameraCapture key={step} kind="photo" onSkip={() => { setNoCard(true); setSerial(''); setStep('cardDetails'); }} onDone={url => { setPhoto(url); setSerial('1G234245'); setNoCard(false); setStep('cardDetails'); }} /></>}
    {step === 'cardDetails' && <div className="flow-form identity-details-form">{photo && <div className="captured-card-preview"><img src={photo} alt="عکس ثبت‌شدهٔ پشت کارت" /></div>}<p className="sheet-description">{noCard ? 'کد رهگیری رسید کارت ملی را وارد کنید.' : 'سریال خوانده‌شده را بررسی کنید؛ در صورت نیاز می‌توانید آن را تغییر دهید.'}</p><MaterialField label={noCard ? 'کد رهگیری کارت ملی' : 'سریال پشت کارت ملی'} value={serial} dir="ltr" maxLength={24} error={errors.serial} onChange={event => setSerial(latinDigits(event.target.value).toUpperCase())} /><BirthDatePicker value={birthday} onChange={setBirthday} error={errors.birthday} /><div className="button-stack"><ActionButton className="flow-button" onClick={confirmIdentityDetails}>تأیید و ادامه</ActionButton>{!noCard && <ActionButton variant="secondary" className="flow-button secondary" onClick={() => setStep('card')}>گرفتن دوبارهٔ عکس</ActionButton>}</div></div>}
    {step === 'videoGuide' && <div className="identity-overview video-guide"><AuthAnimation kind="face-id" />{[['نور کافی','محیط روشن و بدون نور پشت سر','noor'],['چهره کامل در کادر','تمام صورت داخل کادر نمایش داده شود','chehre'],['بدون ماسک و عینک','پوشش رایج مانعی ندارد','mask'],['محیط آرام','بدون صدای مزاحم','aram']].map(([label, caption, icon]) => <div className="identity-card" key={label}><span className="service-icon"><img src={`/assets/${icon}.svg`} width="40" height="40" alt="" /></span><span><strong>{label}</strong><small>{caption}</small></span></div>)}<ActionButton className="flow-button" onClick={() => setStep('video')}>شروع احراز هویت ویدیویی</ActionButton></div>}
    {step === 'video' && <><div className="capture-copy"><b>مرحله ۲ از ۳</b><p>در ویدیوی سلفی با صدای بلند بخوانید:</p><blockquote>«نگاه به آسمان آبی در ارتفاعات بلند کوه‌های سبلان»</blockquote></div><CameraCapture key={step} kind="video" onDone={() => setStep('cardIssuance')} /></>}
    {step === 'success' && <section className="identity-success-panel"><SuccessAnimation/><span className="receipt-status">تأیید شد</span><h2>احراز هویت با موفقیت انجام شد</h2><p>حساب بانکی شما افتتاح شد و درخواست صدور کارت نیز ثبت شد. وضعیت ارسال کارت را می‌توانید از بخش کارت‌ها پیگیری کنید.</p><ActionButton shape="pill" className="flow-button" onClick={onClose}>ورود به صفحه اصلی</ActionButton></section>}
  </FlowShell>;
}
