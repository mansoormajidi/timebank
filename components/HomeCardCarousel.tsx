'use client';

import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { CardIssuanceState } from '../lib/card-issuance';
import { cardChoices } from '../lib/card-issuance';
import { Icon } from './Icon';

export function HomeCardCarousel({ issuance, hidden, blocked, onOpenIssuance, onOpenCard }: {
  issuance: CardIssuanceState;
  hidden: boolean;
  blocked: boolean;
  onOpenIssuance: () => void;
  onOpenCard: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const dragging = useRef(false);
  const control = useRef<ReturnType<typeof animate> | null>(null);
  const stride = width + 12;
  const issuedCard = cardChoices.find(card => card.id === issuance.cardId) || cardChoices[0];

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { control.current?.stop(); x.set(-index * stride); }, [index, stride, x]);
  useEffect(() => () => control.current?.stop(), []);

  function go(next: number) {
    const safe = Math.max(0, Math.min(1, next));
    setIndex(safe);
    control.current?.stop();
    control.current = animate(x, -safe * stride, reduced ? { duration: 0 } : { type: 'spring', stiffness: 310, damping: 34 });
  }

  const issuanceTitle = issuance.status === 'none' ? 'درخواست صدور کارت' : issuance.status === 'tracking' ? 'پیگیری صدور کارت' : issuedCard.title;
  const issuanceSubtitle = issuance.status === 'none' ? 'XXX XXX XXX XXX' : issuance.status === 'tracking' ? `کد پیگیری ${issuance.trackingCode}` : issuedCard.number;

  return <section className="glass-card home-cards" id="cards">
    <h2 className="section-title">کارت‌ها<Icon name="chevron" size={12} /></h2>
    <div className="home-card-viewport" ref={viewport} dir="ltr">
      <motion.div className="home-card-track" style={{ x }} drag={width ? 'x' : false} dragConstraints={{ left: -stride, right: 0 }} dragElastic={0.1} dragMomentum={false}
        onDragStart={() => { dragging.current = true; control.current?.stop(); }}
        onDragEnd={(_, info) => { const next = Math.abs(info.offset.x) > width * .18 || Math.abs(info.velocity.x) > 400 ? index + (info.offset.x < 0 ? 1 : -1) : index; go(next); requestAnimationFrame(() => { dragging.current = false; }); }}>
        <button className={`home-card-slide issuance-slide status-${issuance.status}`} style={{ width: width || '100%' }} onClick={() => { if (!dragging.current) onOpenIssuance(); }} dir="rtl">
          {issuance.status === 'active' ? <img className="issued-card-thumb" src={issuedCard.image} alt="" draggable={false} /> : <span className="request-card-thumb"><Icon name={issuance.status === 'tracking' ? 'card' : 'plus'} size={24} /></span>}
          <span className="card-info"><strong>{issuanceTitle}</strong><span dir="ltr">{hidden && issuance.status === 'active' ? '•••• •••• •••• ' + issuedCard.number.slice(-4) : issuanceSubtitle}</span>{issuance.status === 'tracking' && <small>در مسیر آماده‌سازی و ارسال</small>}</span>
          <Icon name="chevron" size={18} />
        </button>
        <button className="home-card-slide existing-card-slide" style={{ width: width || '100%' }} onClick={() => { if (!dragging.current) onOpenCard(); }} dir="rtl">
          <div className="mini-bank-card"><Icon name="logo" size={21} /></div>
          <span className="card-info"><strong>{blocked ? 'گرین‌کارت · مسدود' : 'گرین‌کارت'}</strong><span dir="ltr">{hidden ? '•••• •••• •••• ۵۳۷۶' : '۶۲۱۹ ۶۷۵۴ ۸۹۴۷ ۵۳۷۶'}</span></span>
          <Icon name="chevron" size={18} />
        </button>
      </motion.div>
    </div>
    <div className="page-dots home-card-dots" aria-label="کارت‌های حساب" dir="ltr">
      {[0, 1].map(item => <button key={item} aria-label={`کارت ${item + 1}`} aria-pressed={index === item} onClick={() => go(item)}><span className={index === item ? 'selected' : ''} /></button>)}
    </div>
  </section>;
}
