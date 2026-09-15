'use client';

import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { ActivityEvent } from '../lib/activity';
import { cardChoices, type CardIssuanceState, type IssuedCardId } from '../lib/card-issuance';
import { DEMO_OTP, digits } from '../lib/forms';
import { ActionButton } from './ui/ActionButton';
import { FlowShell } from './FlowShell';
import { Icon } from './Icon';
import { MaterialField } from './MaterialField';
import { OtpField } from './OtpField';
import { SuccessAnimation } from './SuccessAnimation';

type Step = 'select' | 'address' | 'tracking' | 'otp' | 'active';
const DEFAULT_ADDRESS = 'تهران، خیابان شهید بهشتی، خیابان سرافراز، پلاک ۲۴، واحد ۶';

function CardSelector({ selected, onSelect }: { selected: IssuedCardId; onSelect: (id: IssuedCardId) => void }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const initialIndex = Math.max(0, cardChoices.findIndex(card => card.id === selected));
  const [index, setIndex] = useState(initialIndex);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const control = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { x.set(-index * width); }, [index, width, x]);
  useEffect(() => () => control.current?.stop(), []);

  function go(next: number) {
    const safe = Math.max(0, Math.min(cardChoices.length - 1, next));
    setIndex(safe);
    onSelect(cardChoices[safe].id);
    control.current?.stop();
    control.current = animate(x, -safe * width, reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 34 });
  }

  return <div className="issuance-selector">
    <div className="issuance-card-viewport" ref={viewport} dir="ltr">
      <motion.div className="issuance-card-track" style={{ x }} drag={width ? 'x' : false} dragConstraints={{ left: -(cardChoices.length - 1) * width, right: 0 }} dragElastic={0.1} dragMomentum={false}
        onDragEnd={(_, info) => { const next = Math.abs(info.offset.x) > width * .16 || Math.abs(info.velocity.x) > 350 ? index + (info.offset.x < 0 ? 1 : -1) : index; go(next); }}>
        {cardChoices.map((card, cardIndex) => <button key={card.id} className={`issuance-card-option ${cardIndex === index ? 'selected' : ''}`} style={{ width: width || '100%' }} onClick={() => go(cardIndex)} aria-pressed={cardIndex === index}>
          <img src={card.image} alt={`${card.title} تایم‌بانک`} draggable={false} />
          <span><strong>{card.title}</strong><small>{card.caption}</small></span>
        </button>)}
      </motion.div>
    </div>
    <div className="issuance-carousel-controls">
      <button className="issuance-arrow previous" aria-label="کارت قبلی" disabled={index === 0} onClick={() => go(index - 1)}><Icon name="chevron" size={18} /></button>
      <div className="page-dots" dir="ltr">{cardChoices.map((card, item) => <button key={card.id} aria-label={card.title} aria-pressed={index === item} onClick={() => go(item)}><span className={index === item ? 'selected' : ''} /></button>)}</div>
      <button className="issuance-arrow next" aria-label="کارت بعدی" disabled={index === cardChoices.length - 1} onClick={() => go(index + 1)}><Icon name="chevron" size={18} /></button>
    </div>
  </div>;
}

export function CardIssuanceFlow({ issuance, onRequest, onActivate, onComplete, onRequested, onClose }: {
  issuance: CardIssuanceState;
  onRequest: (cardId: IssuedCardId, address: string) => CardIssuanceState;
  onActivate: () => CardIssuanceState;
  onComplete: (event: ActivityEvent) => void;
  onRequested?: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>(issuance.status === 'tracking' ? 'tracking' : issuance.status === 'active' ? 'active' : 'select');
  const [selected, setSelected] = useState<IssuedCardId>(issuance.cardId || 'bronze');
  const [addressMode, setAddressMode] = useState<'default' | 'custom'>('default');
  const [customAddress, setCustomAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressError, setAddressError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const card = cardChoices.find(item => item.id === (issuance.status === 'none' ? selected : issuance.cardId)) || cardChoices[0];

  function back() {
    if (step === 'address') setStep('select');
    else if (step === 'otp') { setOtp(''); setOtpError(''); setStep('tracking'); }
    else onClose();
  }
  function submitAddress() {
    const address = addressMode === 'default' ? DEFAULT_ADDRESS : customAddress.trim();
    if (addressMode === 'custom' && (address.length < 12 || digits(postalCode).length !== 10)) {
      setAddressError('آدرس کامل و کد پستی ۱۰ رقمی را وارد کنید.');
      return;
    }
    setAddressError('');
    const saved = onRequest(selected, addressMode === 'default' ? address : `${address}، کد پستی ${postalCode}`);
    onComplete({ id: 'card-issuance-request', title: 'درخواست صدور کارت جدید', value: 'در حال آماده‌سازی', icon: 'card', pending: true, details: [['نوع کارت', cardChoices.find(item => item.id === selected)?.title || 'کارت تایم‌بانک'], ['کد پیگیری', saved.trackingCode], ['نشانی ارسال', saved.address]] });
    if (onRequested) onRequested(); else setStep('tracking');
  }
  function activate() {
    if (otp !== DEMO_OTP) { setOtpError('کد آزمایشی ۱۲۳۴۵۶ را وارد کنید.'); return; }
    const next = onActivate();
    onComplete({ id: 'card-issuance-activation', title: 'فعال‌سازی کارت جدید', value: 'فعال شد', icon: 'card', details: [['نوع کارت', cardChoices.find(item => item.id === next.cardId)?.title || 'کارت تایم‌بانک'], ['وضعیت', 'فعال و آماده استفاده']] });
    setOtpError('');
    setStep('active');
  }

  const title: Record<Step, string> = { select: 'انتخاب کارت', address: 'نشانی دریافت کارت', tracking: 'پیگیری صدور کارت', otp: 'فعال‌سازی کارت', active: 'کارت فعال شد' };
  const subtitle: Partial<Record<Step, string>> = { select: 'طرح دلخواه کارت خود را انتخاب کنید.', address: 'کارت به نشانی انتخاب‌شده ارسال می‌شود.', otp: 'کد تأیید ارسال‌شده را وارد کنید.' };
  const progress: Record<Step, number> = { select: 25, address: 50, tracking: 75, otp: 90, active: 100 };

  return <FlowShell variant="transfer-compact internal-flow card-issuance-flow" title={title[step]} subtitle={subtitle[step]} stepKey={step} onBack={back} onClose={onClose} progress={progress[step]}>
    {step === 'select' && <>
      <section className="issuance-surface issuance-selection"><CardSelector selected={selected} onSelect={setSelected} /><p className="issuance-selection-note">برای دیدن طرح‌های دیگر کارت را با انگشت یا موس بکشید.</p></section>
      <ActionButton className="flow-button" onClick={() => setStep('address')}>انتخاب {card.title}</ActionButton>
    </>}

    {step === 'address' && <>
      <section className="issuance-surface address-options">
        <button className={addressMode === 'default' ? 'selected' : ''} aria-pressed={addressMode === 'default'} onClick={() => { setAddressMode('default'); setAddressError(''); }}><span className="address-radio" /><span><strong>نشانی پیش‌فرض</strong><small>{DEFAULT_ADDRESS}</small></span><Icon name="home" size={22} /></button>
        <button className={addressMode === 'custom' ? 'selected' : ''} aria-pressed={addressMode === 'custom'} onClick={() => setAddressMode('custom')}><span className="address-radio" /><span><strong>ارسال به نشانی جدید</strong><small>نشانی دیگری برای تحویل کارت وارد می‌کنم.</small></span><Icon name="plus" size={22} /></button>
      </section>
      {addressMode === 'custom' && <section className="issuance-surface custom-address"><label>نشانی کامل<textarea value={customAddress} onChange={event => setCustomAddress(event.target.value)} maxLength={400} /></label><MaterialField label="کد پستی" value={postalCode} inputMode="numeric" dir="ltr" maxLength={10} onChange={event => setPostalCode(digits(event.target.value))} /></section>}
      {addressError && <p className="camera-error" role="alert">{addressError}</p>}
      <ActionButton className="flow-button" onClick={submitAddress}>تأیید نشانی و ثبت درخواست</ActionButton>
    </>}

    {step === 'tracking' && <>
      <section className="issuance-surface tracking-card">
        <img src={card.image} alt={card.title} />
        <div className="tracking-summary"><span>کد پیگیری</span><strong>{issuance.trackingCode || '۵۳۴۵۷۹'}</strong><small>زمان تقریبی تحویل: ۳ تا ۵ روز کاری</small></div>
      </section>
      <section className="issuance-surface delivery-timeline">
        {[
          ['درخواست ثبت شد', 'اطلاعات درخواست با موفقیت دریافت شد.'],
          ['کارت صادر شد', 'کارت شما آماده و بسته‌بندی شده است.'],
          ['تحویل به پست', 'مرسوله در مسیر نشانی انتخاب‌شده است.'],
          ['تحویل به شما', 'پس از دریافت کارت این مرحله را تأیید کنید.'],
        ].map(([label, caption], index) => <div key={label} className={index < 3 ? 'done' : 'current'}><i>{index < 3 ? '✓' : index + 1}</i><span><strong>{label}</strong><small>{caption}</small></span></div>)}
      </section>
      <p className="delivery-address"><Icon name="home" size={18} />{issuance.address || DEFAULT_ADDRESS}</p>
      <ActionButton shape="pill" className="flow-button received-card-button" onClick={() => setStep('otp')}>کارت را دریافت کردم</ActionButton>
    </>}

    {step === 'otp' && <section className="issuance-surface activation-panel">
      <img src={card.image} alt={card.title} />
      <h2>تأیید دریافت و فعال‌سازی</h2>
      <p>برای فعال شدن کارت، کد ۶ رقمی ارسال‌شده به شماره ۰۹۱۲***۴۰۸۰ را وارد کنید.</p>
      <OtpField value={otp} onChange={setOtp} error={otpError} label="کد فعال‌سازی کارت" />
      <ActionButton className="flow-button" onClick={activate}>فعال‌سازی کارت</ActionButton>
    </section>}

    {step === 'active' && <section className="issuance-surface activated-card">
      <SuccessAnimation />
      <span className="receipt-status">فعال و آماده استفاده</span>
      <h2>{card.title} فعال شد</h2>
      <img src={card.image} alt={card.title} />
      <p>کارت جدید از همین حالا در بخش کارت‌ها در دسترس است.</p>
      <ActionButton shape="pill" className="flow-button" onClick={onClose}>بازگشت به صفحه اصلی</ActionButton>
    </section>}
  </FlowShell>;
}
