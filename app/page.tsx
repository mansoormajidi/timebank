'use client';
import { useState, useCallback } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { BottomNavigation } from '../components/BottomNavigation';
import { BottomSheet } from '../components/BottomSheet';
import { HomeDetails, detailTitles } from '../components/HomeDetails';
import { TransferFlow } from '../components/TransferFlow';
import { StatementFlow } from '../components/StatementFlow';
import { TopUpFlow } from '../components/TopUpFlow';
import { AuthFlow } from '../components/AuthFlow';
import { PromoCarousel } from '../components/PromoCarousel';
import { Icon } from '../components/Icon';
import { useActivityLog } from '../lib/activity';
import { account, quickActions, services } from '../lib/demo';

export default function Home() {
  const {items:activities,record}=useActivityLog();
  const cardBlocked=activities.find(a=>a.title==='مسدودی گرین‌کارت'||a.title==='رفع مسدودی گرین‌کارت')?.title==='مسدودی گرین‌کارت';
  const [boot,setBoot]=useState(true);
  const [screen, setScreen] = useState<'home' | 'login' | 'signup' | 'transfer' | 'statement' | 'topup'>('login');
  const [homeEntry, setHomeEntry] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [active, setActive] = useState('home');
  const [visiblePromoIds,setVisiblePromoIds]=useState([0,1,2]);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const reduced = useReducedMotion();
  const close = useCallback(() => { setDetail(null); setActive('home'); }, []);
  function open(id: string) { if (id === 'login' || id === 'signup' || id === 'transfer' || id === 'statement' || id === 'topup') { setDetail(null); setScreen(id); return; } setDetail(id); if (id === 'notifications') setNotificationsRead(true); }
  function navigate(id: string) {
    setActive(id);
    if (id === 'home') { setDetail(null); document.getElementById('home-scroll')?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
    else open(id);
  }
  return <MotionConfig reducedMotion="user"><div className="preview-stage">
    <header className="preview-heading"><span className="preview-dot" />پروتوتایپ تایم‌بانک<span dir="ltr">HOME / LIGHT</span></header>
    <main className="app-shell" dir="rtl">
      {screen === 'transfer' ? <TransferFlow onComplete={record} onClose={() => { setScreen('home'); setActive('home'); setScrolled(false); setHomeEntry(e => e + 1); }} /> : screen === 'statement' ? <StatementFlow activities={activities} hidden={hidden} onClose={() => { setScreen('home'); setActive('home'); setHomeEntry(e => e + 1); }} /> : screen === 'topup' ? <TopUpFlow onComplete={record} onClose={() => { setScreen('home'); setActive('home'); setHomeEntry(e => e + 1); }} /> : screen !== 'home' ? <AuthFlow key={screen} initialMode={screen} playSplash={boot} onClose={() => { setBoot(false); setScreen('home'); setHomeEntry(e => e + 1); setScrolled(false); }} /> : <div className="home-screen" key={homeEntry}>
      <div className={`fixed-home-header ${scrolled ? 'is-scrolled' : ''}`} inert={!!detail}>          <div className="status-bar" dir="ltr"><span>9:41</span><div className="status-levels"><img src="/assets/imgCellularConnection.svg" width="18" height="12" alt="" /><img src="/assets/imgWifi.svg" width="16" height="12" alt="" /><img src="/assets/imgBattery.svg" width="25" height="12" alt="" /></div></div>
          <header className="app-toolbar flex items-center justify-between">
            <button className="avatar" onClick={() => open('profile')} aria-label="حساب کاربری"><img src="/assets/avatar.png" alt="" /></button>
            <div className="toolbar-actions flex gap-2"><button className={`round-button ${hidden ? 'is-hidden' : ''}`} aria-label={hidden ? 'نمایش موجودی' : 'پنهان کردن موجودی'} aria-pressed={hidden} onClick={() => setHidden(!hidden)}><Icon name="eye" /></button><button className="round-button notification-button" aria-label="اعلان‌ها" onClick={() => open('notifications')}><Icon name="bell" size={28} />{!notificationsRead && <span className="notification-dot" />}</button></div>
          </header>
</div>
      <div onScroll={e => setScrolled(e.currentTarget.scrollTop > 12)} className="app-scroll home-enter" id="home-scroll" inert={!!detail} aria-hidden={detail ? true : undefined}>
        <section className="hero">
          <div className="hero-texture" />
          <div className="balance-block"><h1>{account.name}</h1><div className="balance-number"><strong>{hidden ? '•••٬•••٬•••' : account.balance}</strong><Icon name="rial" size={24} /></div><button className="report-button" onClick={() => open('report')}>گزارش حساب<Icon name="chevron" size={12} /></button></div>
          <div className="quick-actions">{quickActions.map(a => <motion.button key={a.id} whileTap={{ scale: .93 }} onClick={() => open(a.id)} className="quick-action"><span className="action-circle"><Icon name={a.icon} /></span><span>{a.title}</span></motion.button>)}</div>
        </section>
        <div className="home-content flex flex-col gap-4">
          <PromoCarousel visibleIds={visiblePromoIds} onInvite={() => open('invite')} onDismiss={id=>setVisiblePromoIds(ids=>ids.filter(i=>i!==id))}/>
          <section className="glass-card"><h2 className="section-title">خدمات روزمره<Icon name="chevron" size={12} /></h2><div className="daily-services">{services.map(s => <button key={s.id} onClick={() => open(s.id)}><span className="service-icon"><Icon name={s.icon} /></span><span>{s.title}</span></button>)}</div><button className="section-link" onClick={() => open('services')}>همه خدمات<Icon name="chevron" size={13} /></button></section>
          <section className="glass-card" id="cards"><h2 className="section-title">کارت‌ها<Icon name="chevron" size={12} /></h2><button className="card-row" onClick={() => open('card')}><div className="mini-bank-card"><Icon name="logo" size={21} /></div><span className="card-info"><strong>{cardBlocked?'گرین‌کارت · مسدود':'گرین‌کارت'}</strong><span dir="ltr">{hidden ? '•••• •••• •••• ۵۳۷۶' : account.card}</span></span><Icon name="chevron" size={18} /></button><div className="page-dots"><span className="selected" /></div></section>
          <div className="giving-grid"><button className="glass-card giving-card" onClick={() => open('giving')}><span className="section-title">کار خوب<Icon name="chevron" size={12} /></span><span className="giving-content"><img src="/assets/imgRectangle2.png" alt="" /><span><strong>۳</strong><small>کمک‌ها و هدایا</small></span></span></button><button className="glass-card giving-card" onClick={() => open('endowment')}><span className="section-title">کار ماندگار<Icon name="chevron" size={12} /></span><span className="giving-content"><img src="/assets/imgRectangle1.png" alt="" /><span><strong className="endowment-value">{hidden ? '••٬•••٬•••' : '۳۵٬۶۵۸٬۰۰۰'}</strong><small>وقف پول · ریال</small></span></span></button></div>
          <section className="glass-card" id="activity"><h2 className="section-title">فعالیت‌های اخیر<Icon name="chevron" size={12} /></h2><div className="activity-list">{activities.slice(0,3).map(a => <button className="activity-row" key={a.id} onClick={() => open(a.id)}><span className="service-icon"><Icon name={a.icon} /></span><span className="activity-copy"><strong>{a.title}</strong><small>{a.subtitle}</small></span><span className={`activity-value ${a.pending ? 'pending' : ''}`}>{hidden && !a.pending ? '••• ریال' : a.value}<Icon name="chevron" size={10} /></span></button>)}</div><button className="section-link" onClick={() => open('activity')}>همه فعالیت‌ها<Icon name="chevron" size={13} /></button></section>
          <section className="glass-card connected-services"><h2 className="section-title">سرویس‌های متصل<Icon name="chevron" size={12} /></h2><button className="connected-row" onClick={() => open('auction')}><span className="service-icon"><Icon name="auction" /></span><span><strong>شرکت در مزایده</strong><small>مشارکت در فرآیند واگذاری املاک موقوفه</small></span><Icon name="chevron" size={16} /></button><button className="connected-row" onClick={() => open('welfare')}><span className="service-icon"><Icon name="chair" /></span><span><strong>خدمات رفاهی زائرین امام‌زادگان</strong><small>امکانات و خدمات رفاهی برای زائران</small></span><Icon name="chevron" size={16} /></button></section>
          <p className="demo-note">نسخهٔ نمایشی · تمام اطلاعات ساختگی هستند</p>
        </div>
      </div>
      <div inert={!!detail} aria-hidden={detail?true:undefined}><BottomNavigation active={active} onNavigate={navigate} /></div>
      <AnimatePresence mode="wait">{detail && <BottomSheet key={detail} title={detailTitles[detail] || activities.find(a => a.id === detail)?.title || 'جزئیات'} onClose={close}><HomeDetails activities={activities} onComplete={record} cardBlocked={cardBlocked} id={detail} hidden={hidden} onOpen={open} onClose={close} /></BottomSheet>}</AnimatePresence>
    </div>}
    </main><footer className="preview-footer"><span>نسخهٔ روشن، بر پایهٔ طرح اصلی</span><span className="palette"><i /><i /><i /></span></footer>
  </div></MotionConfig>;
}
