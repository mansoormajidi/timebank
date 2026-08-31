'use client';
import { useState, useCallback } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { BottomNavigation } from '../components/BottomNavigation';
import { BottomSheet } from '../components/BottomSheet';
import { HomeDetails, detailTitles } from '../components/HomeDetails';
import { Icon } from '../components/Icon';
import { account, quickActions, services, activities } from '../lib/demo';

export default function Home() {
  const [hidden, setHidden] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [active, setActive] = useState('home');
  const [promoVisible, setPromoVisible] = useState(true);
  const [promo, setPromo] = useState(0);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const reduced = useReducedMotion();
  const close = useCallback(() => { setDetail(null); setActive('home'); }, []);
  function open(id: string) { setDetail(id); if (id === 'notifications') setNotificationsRead(true); }
  function navigate(id: string) {
    setActive(id);
    if (id === 'home') { setDetail(null); document.getElementById('home-scroll')?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
    else open(id);
  }
  const banners = [
    ['هر دعوت، یک شانس برنده شدن PS5', 'با دعوت از دوستان خود، در قرعه‌کشی', '۱۱۰ کنسول PS5 شرکت کنید.'],
    ['دوستانت را همراه کن', 'کد دعوتت را با دوستانت به اشتراک بگذار', 'و یک شانس تازه داشته باش.'],
    ['یک دعوت تا یک اتفاق خوب', 'جزئیات طرح دعوت از دوستان را ببین؛', 'این کمپین در نسخهٔ نمایشی فعال نیست.'],
  ];
  return <MotionConfig reducedMotion="user"><div className="preview-stage">
    <header className="preview-heading"><span className="preview-dot" />پروتوتایپ همراه‌بانک<span dir="ltr">HOME / LIGHT</span></header>
    <main className="app-shell" dir="rtl">
      <div className="app-scroll" id="home-scroll" inert={!!detail} aria-hidden={detail ? true : undefined}>
        <section className="hero">
          <div className="hero-texture" />
          <div className="status-bar" dir="ltr"><span>9:41</span><div className="status-levels"><img src="/assets/imgCellularConnection.svg" width="18" height="12" alt="" /><img src="/assets/imgWifi.svg" width="16" height="12" alt="" /><img src="/assets/imgBattery.svg" width="25" height="12" alt="" /></div></div>
          <header className="app-toolbar flex items-center justify-between">
            <button className="avatar" onClick={() => open('profile')} aria-label="حساب کاربری"><img src="/assets/avatar.png" alt="" /></button>
            <div className="toolbar-actions flex gap-2"><button className={`round-button ${hidden ? 'is-hidden' : ''}`} aria-label={hidden ? 'نمایش موجودی' : 'پنهان کردن موجودی'} aria-pressed={hidden} onClick={() => setHidden(!hidden)}><Icon name="eye" /></button><button className="round-button notification-button" aria-label="اعلان‌ها" onClick={() => open('notifications')}><Icon name="bell" size={28} />{!notificationsRead && <span className="notification-dot" />}</button></div>
          </header>
          <div className="balance-block"><h1>{account.name}</h1><div className="balance-number"><strong>{hidden ? '•••٬•••٬•••' : account.balance}</strong><span>ریال</span></div><button className="report-button" onClick={() => open('report')}>گزارش حساب<Icon name="chevron" size={12} /></button></div>
          <div className="quick-actions">{quickActions.map(a => <motion.button key={a.id} whileTap={{ scale: .93 }} onClick={() => open(a.id)} className="quick-action"><span className="action-circle"><Icon name={a.icon} /></span><span>{a.title}</span></motion.button>)}</div>
        </section>
        <div className="home-content flex flex-col gap-4">
          <AnimatePresence initial={false}>{promoVisible && <motion.div className="promo-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, marginBottom: -16 }}><motion.section className="promo-card" drag={reduced ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={.13} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 35) setPromo((promo + (info.offset.x > 0 ? 1 : 2)) % 3); }}><img className="ps5" src="/assets/imgImage18.png" alt="کنسول پلی‌استیشن ۵" /><AnimatePresence mode="wait" initial={false}><motion.div className="promo-copy" key={promo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .15 }}><h2>{banners[promo][0]}</h2><p>{banners[promo][1]}<br />{banners[promo][2]}</p><button onClick={() => open('invite')}>دعوت از دوستان<Icon name="chevron" size={12} /></button></motion.div></AnimatePresence><button className="dismiss-promo" onClick={() => setPromoVisible(false)} aria-label="بستن بنر دعوت"><Icon name="close" size={12} /></button></motion.section><div className="page-dots interactive-dots" aria-label="بنرهای دعوت">{banners.map((_, i) => <button key={i} aria-label={`بنر ${i + 1}`} aria-pressed={promo === i} onClick={() => setPromo(i)}><span className={promo === i ? 'selected' : ''} /></button>)}</div></motion.div>}</AnimatePresence>
          <section className="glass-card"><h2 className="section-title">خدمات روزمره<Icon name="chevron" size={12} /></h2><div className="daily-services">{services.map(s => <button key={s.id} onClick={() => open(s.id)}><span className="service-icon"><Icon name={s.icon} /></span><span>{s.title}</span></button>)}</div><button className="section-link" onClick={() => open('services')}>همه خدمات<Icon name="chevron" size={13} /></button></section>
          <section className="glass-card" id="cards"><h2 className="section-title">کارت‌ها<Icon name="chevron" size={12} /></h2><button className="card-row" onClick={() => open('card')}><div className="mini-bank-card"><Icon name="logo" size={21} /></div><span className="card-info"><strong>گرین‌کارت</strong><span dir="ltr">{hidden ? '•••• •••• •••• ۵۳۷۶' : account.card}</span></span><Icon name="chevron" size={18} /></button><div className="page-dots"><span className="selected" /></div></section>
          <div className="giving-grid"><button className="glass-card giving-card" onClick={() => open('giving')}><span className="section-title">کار خوب<Icon name="chevron" size={12} /></span><span className="giving-content"><img src="/assets/imgRectangle2.png" alt="" /><span><strong>۳</strong><small>کمک‌ها و هدایا</small></span></span></button><button className="glass-card giving-card" onClick={() => open('endowment')}><span className="section-title">کار ماندگار<Icon name="chevron" size={12} /></span><span className="giving-content"><img src="/assets/imgRectangle1.png" alt="" /><span><strong className="endowment-value">{hidden ? '••٬•••٬•••' : '۳۵٬۶۵۸٬۰۰۰'}</strong><small>وقف پول · ریال</small></span></span></button></div>
          <section className="glass-card" id="activity"><h2 className="section-title">فعالیت‌های اخیر<Icon name="chevron" size={12} /></h2><div className="activity-list">{activities.map(a => <button className="activity-row" key={a.id} onClick={() => open(a.id)}><span className="service-icon"><Icon name={a.icon} /></span><span className="activity-copy"><strong>{a.title}</strong><small>{a.subtitle}</small></span><span className={`activity-value ${a.pending ? 'pending' : ''}`}>{hidden && !a.pending ? '••• ریال' : a.value}<Icon name="chevron" size={10} /></span></button>)}</div><button className="section-link" onClick={() => open('activity')}>همه فعالیت‌ها<Icon name="chevron" size={13} /></button></section>
          <section className="glass-card connected-services"><h2 className="section-title">سرویس‌های متصل<Icon name="chevron" size={12} /></h2><button className="connected-row" onClick={() => open('auction')}><span className="service-icon"><Icon name="auction" /></span><span><strong>شرکت در مزایده</strong><small>مشارکت در فرآیند واگذاری املاک موقوفه</small></span><Icon name="chevron" size={16} /></button><button className="connected-row" onClick={() => open('welfare')}><span className="service-icon"><Icon name="chair" /></span><span><strong>خدمات رفاهی زائرین امام‌زادگان</strong><small>امکانات و خدمات رفاهی برای زائران</small></span><Icon name="chevron" size={16} /></button></section>
          <p className="demo-note">نسخهٔ نمایشی · تمام اطلاعات ساختگی هستند</p>
        </div>
      </div>
      <BottomNavigation active={active} onNavigate={navigate} />
      <AnimatePresence mode="wait">{detail && <BottomSheet key={detail} title={detailTitles[detail] || activities.find(a => a.id === detail)?.title || 'جزئیات'} onClose={close}><HomeDetails id={detail} hidden={hidden} onOpen={open} onClose={close} /></BottomSheet>}</AnimatePresence>
    </main><footer className="preview-footer"><span>نسخهٔ روشن، بر پایهٔ طرح اصلی</span><span className="palette"><i /><i /><i /></span></footer>
  </div></MotionConfig>;
}
