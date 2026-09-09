'use client';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { GivingForm } from './GivingForm';
import { CardActions } from './CardActions';
import type { Activity, ActivityEvent } from '../lib/activity';
import { account, services } from '../lib/demo';
import { Icon } from './Icon';
import { UpdateAnimation } from './UpdateAnimation';
import { ListRow } from './ui/ListRow';
import { ActionButton } from './ui/ActionButton';

export const detailTitles: Record<string, string> = {
  'card-block': 'مسدودی کارت', 'card-password': 'رمز دوم پویا', 'giving-start': 'انجام کار خوب', 'endowment-start': 'انجام کار ماندگار', profile: 'حساب کاربری', notifications: 'اعلان‌ها', report: 'گزارش حساب', numbers: 'شماره‌های حساب',
  services: 'همه خدمات', card: 'جزئیات گرین‌کارت', invite: 'دعوت از دوستان', giving: 'کمک‌ها و هدایا', endowment: 'وقف پول',
  activity: 'همه فعالیت‌ها', accounts: 'حساب‌ها', transfer: 'انتقال وجه', statement: 'صورتحساب', topup: 'افزایش موجودی',
  'profile-about': 'درباره تایم‌بانک', 'profile-version': 'ورژن اپ', 'profile-devices': 'دستگاه‌های متصل', 'profile-avatar': 'ویرایش تصویر پروفایل',
  bill: 'پرداخت قبض', shrines: 'امام‌زاده‌ها', lease: 'اجاره‌نامه', auction: 'شرکت در مزایده', welfare: 'خدمات رفاهی زائرین',
};

function CopyField({ label, value, hidden }: { label: string; value: string; hidden: boolean }) {
  const [state, setState] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(value); setState('کپی شد'); }
    catch { setState('کپی خودکار در دسترس نیست؛ متن را انتخاب کنید.'); }
  }
  return <div className="copy-field"><label>{label}</label><div><span dir="ltr">{hidden ? '•••• •••• ••••' : value}</span><button onClick={copy} disabled={hidden} aria-label={`کپی ${label}`}><Icon name="copy" size={14} />{state === 'کپی شد' ? 'کپی شد ✓' : 'کپی'}</button></div><small role="status">{state}</small></div>;
}

const defaultAvatars = Array.from({ length: 7 }, (_, index) => `/assets/avatars/avtr0${index + 1}.svg`);

function AvatarPickerPanel({ avatar, onSave }: { avatar: string; onSave: (avatar: string) => void }) {
  const [draft, setDraft] = useState(avatar);
  const [error, setError] = useState('');
  function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('یک فایل تصویری انتخاب کنید.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('حجم تصویر باید کمتر از ۵ مگابایت باشد.'); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') { setDraft(reader.result); setError(''); } };
    reader.readAsDataURL(file);
  }
  return <div className="avatar-editor"><div className="avatar-editor-preview"><img src={draft} alt="پیش‌نمایش تصویر پروفایل انتخابی"/><span>تصویر انتخابی</span></div><div className="avatar-editor-grid" aria-label="انتخاب تصویر پروفایل">{defaultAvatars.map((item, index) => <button key={item} className={draft === item ? 'selected' : ''} aria-label={`انتخاب آواتار ${index + 1}`} aria-pressed={draft === item} onClick={() => { setDraft(item); setError(''); }}><img src={item} alt=""/>{draft === item && <i aria-hidden="true">✓</i>}</button>)}<label className={`avatar-upload ${!defaultAvatars.includes(draft) ? 'selected' : ''}`} aria-label="انتخاب تصویر از دستگاه"><img src="/assets/avatars/avtrplus.svg" alt=""/><input type="file" accept="image/*" onChange={pickFile}/></label></div>{error && <p className="avatar-editor-error" role="alert">{error}</p>}<ActionButton shape="pill" className="primary-button avatar-save" onClick={() => onSave(draft)}>ذخیره تصویر پروفایل</ActionButton></div>;
}

function ProfileMenuIcon({ name }: { name: string }) {
  if (name === 'info') return <span className="profile-menu-icon profile-info-icon"><img src="/assets/profile/info.svg" alt="" /></span>;
  if (name === 'laptop') return <span className="profile-menu-icon profile-laptop-icon"><i/><img src="/assets/profile/laptop.svg" alt="" /></span>;
  return <img className="profile-menu-icon" src="/assets/profile/update.svg" alt=""/>;
}

function VersionPanel() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function check() {
    setStatus('checking');
    timer.current = setTimeout(() => setStatus('available'), 1250);
  }
  function download() {
    const contents = 'TimeBank 1.0.1 — prototype update package';
    const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'timebank-1.0.1.txt';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="version-panel"><UpdateAnimation/><p className="version-label">نسخهٔ نصب‌شده</p><strong className="version-number">۱.۰.۰</strong><p className="sheet-description">برای دریافت تازه‌ترین امکانات و بهبودهای امنیتی، نسخهٔ تایم‌بانک را بررسی کنید.</p>{status === 'available' && <p className="update-available" role="status">نسخهٔ ۱.۰.۱ آمادهٔ دریافت است.</p>}<ActionButton shape="pill" className="primary-button version-action" disabled={status === 'checking'} onClick={status === 'available' ? download : check}>{status === 'checking' ? <><i className="button-spinner"/>در حال بررسی…</> : status === 'available' ? 'دانلود نسخهٔ ۱.۰.۱' : 'بررسی نسخه'}</ActionButton></div>;
}

function DeviceList() {
  const devices = [
    { icon: 'apple', title: 'iPhone 15 Pro', meta: 'iOS 18 · دستگاه فعلی', date: 'آخرین اتصال: امروز، ۰۹:۴۱' },
    { icon: 'apple', title: 'MacBook Air', meta: 'macOS · مرورگر Safari', date: 'آخرین اتصال: ۱۲ شهریور، ۲۱:۱۸' },
    { icon: 'android', title: 'Galaxy S24', meta: 'Android 15', date: 'آخرین اتصال: ۸ شهریور، ۱۷:۳۲' },
  ];
  return <><p className="sheet-description device-intro">دستگاه‌هایی که با حساب شما وارد تایم‌بانک شده‌اند.</p><div className="connected-device-list">{devices.map((device, index) => <ListRow className="connected-device" key={device.title} title={device.title} subtitle={device.meta} meta={<time>{device.date}</time>} leading={<span className="device-icon"><img src={`/assets/devices/${device.icon}.svg`} alt="" /></span>} trailing={index === 0 ? <i>این دستگاه</i> : undefined}/>)}</div><p className="sheet-note">اگر دستگاهی را نمی‌شناسید، از حساب خارج شوید و رمز خود را تغییر دهید.</p></>;
}

function NotificationsPanel() {
  const [tab, setTab] = useState<'private' | 'public'>('private');
  const items = tab === 'private' ? [
    { icon: 'card', title: 'صدور کارت جدید', description: 'کد پیگیری ۵۳۴۵۷۹', time: 'امروز، ۱۰:۴۸' },
    { icon: 'receipt', title: 'کمک به امام‌زاده عبدالله', description: 'مشارکت شما با موفقیت ثبت شد.', time: 'امروز، ۱۰:۳۵' },
    { icon: 'blocked', title: 'مسدودی مبلغ', description: 'حساب هزینه‌های روزمره', time: 'دیروز، ۱۸:۲۰' },
  ] as const : [
    { icon: 'lease', title: 'خدمت جدید اوقاف', description: 'مشاهده و پرداخت اجاره‌نامه از تایم‌بانک در دسترس است.', time: 'امروز، ۰۸:۱۵' },
    { icon: 'bell', title: 'زمان‌بندی نگهداری سامانه', description: 'پنج‌شنبه از ساعت ۰۱:۰۰ تا ۰۲:۰۰ برخی خدمات موقتاً در دسترس نیستند.', time: '۱۲ شهریور' },
    { icon: 'password', title: 'یادآوری امنیت حساب', description: 'رمز پویا و اطلاعات ورود را در اختیار دیگران قرار ندهید.', time: '۱۰ شهریور' },
  ] as const;
  return <div className="notifications-panel"><div className="notification-tabs" role="tablist" aria-label="نوع اعلان"><button role="tab" aria-selected={tab === 'private'} className={tab === 'private' ? 'selected' : ''} onClick={() => setTab('private')}>اختصاصی</button><button role="tab" aria-selected={tab === 'public'} className={tab === 'public' ? 'selected' : ''} onClick={() => setTab('public')}>عمومی</button></div><div className="notification-list" role="tabpanel">{items.map(item => <ListRow element="article" className="notice-item" key={item.title} title={item.title} subtitle={item.description} meta={item.time} leading={<span className="notification-icon">{item.icon === 'password' ? <img src="/assets/password.svg" alt=""/> : <Icon name={item.icon}/>}</span>}/>)}</div></div>;
}

export function HomeDetails({ id, hidden, onOpen, onClose, activities, onComplete, cardBlocked, theme, onThemeChange, avatar, onAvatarChange, onLogout }: { id: string; hidden: boolean; onOpen: (id: string) => void; onClose: () => void; activities:Activity[]; onComplete:(a:ActivityEvent)=>void; cardBlocked:boolean; theme:'light'|'dark'; onThemeChange:(theme:'light'|'dark')=>void; avatar:string; onAvatarChange:(avatar:string)=>void; onLogout:()=>void }) {
  if(id === 'card-block' || id === 'card-password') return <CardActions kind={id === 'card-block'?'block':'password'} blocked={cardBlocked} onComplete={onComplete} onClose={onClose}/>;
  if (id === 'giving-start' || id === 'endowment-start') return <GivingForm endowment={id === 'endowment-start'} onClose={onClose} onComplete={onComplete} />;
  const activity = activities.find(a => a.id === id);
  if (activity) return <><span className="detail-icon"><Icon name={activity.icon} size={30} /></span><p className="detail-amount">{hidden && !activity.pending ? '••••••' : activity.value}</p><dl className="detail-list"><div><dt>شرح</dt><dd>{activity.title}</dd></div><div><dt>زمان / پیگیری</dt><dd>{activity.subtitle}</dd></div>{activity.details?.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{hidden?'••••':value}</dd></div>)}<div><dt>نوع اطلاعات</dt><dd>نمونهٔ نمایشی</dd></div></dl><p className="sheet-note">این رسید صرفاً برای نمایش رابط کاربری است و اعتبار بانکی ندارد.</p></>;
  if (id === 'numbers' || id === 'card') return <>{id === 'card' && <div className="detail-bank-card"><Icon name="logo" size={30} /><strong>گرین‌کارت</strong><span dir="ltr">{hidden ? '•••• •••• •••• ۵۳۷۶' : account.card}</span><small>{cardBlocked?'کارت مسدود است':'کارت نمایشی · فعال'}</small></div>}<CopyField label="شماره کارت نمایشی" value={account.card} hidden={hidden} /><>{id === 'numbers' && <><CopyField label="شماره حساب نمایشی" value={account.number} hidden={hidden} /><CopyField label="شبای نمونه (نامعتبر)" value={account.iban} hidden={hidden} /></>}{id === 'card' && <div className="card-management"><button onClick={()=>onOpen('card-block')}><Icon name="blocked" size={22}/>{cardBlocked?'رفع مسدودی کارت':'مسدودی کارت'}</button><button onClick={()=>onOpen('card-password')}><img src="/assets/password.svg" width="22" height="22" alt=""/>رمز دوم</button></div>}</><p className="sheet-note">این شماره‌ها نمونه هستند؛ برای واریز یا پرداخت استفاده نشوند.</p></>;
  if (id === 'report') return <><p className="sheet-eyebrow">موجودی حساب هزینه‌های روزمره</p><p className="detail-amount">{hidden ? '•••٬•••٬•••' : account.balance}<small> ریال</small></p><div className={`balance-chart ${hidden ? 'chart-hidden' : ''}`} role="img" aria-label={hidden ? 'نمودار موجودی پنهان شده' : 'نمودار نمایشی روند موجودی هفته'}>{[40, 60, 45, 75, 56, 83, 70].map((v, i) => <div key={i}><span style={{ height: `${hidden ? 40 : v}%` }} /><small>{['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][i]}</small></div>)}</div><p className="sheet-note">نمایش نمونهٔ هفتگی · اعداد نمودار نمایشی هستند.</p><ActionButton shape="pill" className="primary-button" onClick={() => onOpen('activity')}>مشاهدهٔ فعالیت‌های اخیر</ActionButton></>;
  if (id === 'notifications') return <NotificationsPanel/>;
  if (id === 'activity') return <div className="detail-services">{activities.map(a => <button key={a.id} onClick={() => onOpen(a.id)}><span className="service-icon"><Icon name={a.icon} /></span><span><strong>{a.title}</strong><small>{hidden && !a.pending ? '••• ریال' : a.value}</small></span><Icon name="chevron" size={16} /></button>)}</div>;
  if (id === 'services') return <div className="detail-services">{services.map(s => <button key={s.id} onClick={() => onOpen(s.id)}><span className="service-icon"><Icon name={s.icon} /></span><span><strong>{s.title}</strong><small>{s.description}</small></span><Icon name="chevron" size={16} /></button>)}</div>;
  if (id === 'invite') return <><div className="invite-illustration"><img src="/assets/imgImage18.png" alt="پلی‌استیشن ۵" /></div><h3 className="detail-heading">هر دعوت، یک شانس تازه</h3><p className="sheet-description">در طرح اصلی، با دعوت از دوستان در قرعه‌کشی ۱۱۰ کنسول PS5 شرکت می‌کنید.</p><CopyField label="کد دعوت نمایشی" value="DEMO-HOME" hidden={false} /><p className="sheet-note">این کمپین در پروتوتایپ فعال نیست؛ هیچ دعوتی ارسال نمی‌شود.</p></>;
  if (id === 'giving' || id === 'endowment') return <><img className="giving-detail-art" src={`/assets/${id === 'giving' ? 'imgRectangle2' : 'imgRectangle1'}.png`} alt="" /><p className="detail-amount">{id === 'giving' ? '۳ کمک و هدیه' : hidden ? '••٬•••٬•••' : '۳۵٬۶۵۸٬۰۰۰ ریال'}</p><p className="sheet-description">{id === 'giving' ? 'کمک‌های کوچک، اثرهای ماندگار. این بخش خلاصه‌ای از هدایا و مشارکت‌های شما را نشان می‌دهد.' : 'خلاصهٔ مشارکت در وقف پول؛ جزئیات طرح‌های وقف در مرحلهٔ بعد اضافه می‌شود.'}</p><ActionButton shape="pill" className="primary-button" onClick={() => onOpen(id + '-start')}>{id === 'giving' ? 'انجام کار خوب' : 'انجام کار ماندگار'}</ActionButton><p className="sheet-note">اطلاعات نمونه هستند و پرداختی انجام نشده است.</p></>;
  if (id === 'profile') {
    return <div className="profile-sheet-content"><div className="profile-detail"><div className="profile-photo"><img src={avatar} alt="تصویر پروفایل" /><button type="button" onClick={() => onOpen('profile-avatar')} aria-label="ویرایش تصویر پروفایل">✎</button></div><strong>حسام‌الدین تازه‌کار</strong><span dir="ltr">۰۹۱۲۶۴۶۴۰۸۰</span></div><div className="profile-menu">{[
      ['profile-about','درباره تایم‌بانک','info'],
      ['profile-version','ورژن اپ','update'],
      ['profile-devices','دستگاه‌های متصل','laptop'],
    ].map(([target,title,icon]) => <button key={target} onClick={() => onOpen(target)}><img className="profile-chevron" src="/assets/profile/chevron.svg" alt=""/><span>{target === 'profile-version' && <small>۱.۰.۰</small>}</span><strong>{title}</strong><ProfileMenuIcon name={icon}/></button>)}</div><button className="theme-toggle" type="button" aria-pressed={theme === 'dark'} onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}><span><strong>حالت تاریک</strong><small>{theme === 'dark' ? 'فعال' : 'غیرفعال'}</small></span><i aria-hidden="true"><b /></i></button><ActionButton shape="pill" className="profile-logout" onClick={onLogout}>خروج از حساب کاربری</ActionButton></div>;
  }
  if (id === 'profile-avatar') return <AvatarPickerPanel avatar={avatar} onSave={nextAvatar => { onAvatarChange(nextAvatar); onOpen('profile'); }}/>;
  if (id === 'profile-about') return <div className="about-timebank"><span className="about-logo"><Icon name="logo" size={38}/></span><h3>بانکداری و خدمات اوقاف در یک مسیر</h3><p>تایم‌بانک اینترنت‌بانک سازمان اوقاف است؛ فضایی یکپارچه برای انجام امور بانکی روزمره و دسترسی به خدمات مرتبط با اوقاف. از انتقال وجه و مدیریت حساب تا پرداخت اجاره‌نامه، قبض و مشارکت در کارهای نیک، همه در تجربه‌ای ساده و امن کنار هم قرار گرفته‌اند.</p><p>این نسخه یک پروتوتایپ تعاملی است و به سامانهٔ بانکی واقعی متصل نیست.</p></div>;
  if (id === 'profile-version') return <VersionPanel/>;
  if (id === 'profile-devices') return <DeviceList/>;
  const descriptions: Record<string, string> = {
    accounts: 'مدیریت حساب‌ها و افتتاح حساب در مرحلهٔ بعد اضافه می‌شود.', transfer: 'انتقال کارت‌به‌کارت، پایا و ساتنا در مرحلهٔ بعد پیاده‌سازی می‌شود.',
    bill: 'استعلام و پرداخت قبوض در مرحلهٔ بعد اضافه می‌شود.', shrines: 'فهرست بقاع متبرکه و خدمات زیارتی در مرحلهٔ بعد تکمیل می‌شود.', lease: 'قراردادهای اجاره و پرداخت اجاره‌بهای موقوفات در مرحلهٔ بعد اضافه می‌شود.', auction: 'فهرست مزایده‌ها و ثبت درخواست در مرحلهٔ بعد پیاده‌سازی می‌شود.', welfare: 'امکانات اقامت و خدمات زائرین در مرحلهٔ بعد تکمیل می‌شود.',
  };
  return <><span className="phase-badge">در مرحلهٔ بعد</span><h3 className="detail-heading">{detailTitles[id] || 'این بخش'}، به‌زودی</h3><p className="sheet-description">{descriptions[id] || 'این مسیر برای توسعهٔ مرحلهٔ بعد آماده است.'}</p><p className="sheet-note">این نسخه نمایشی است. هیچ اطلاعات بانکی یا وجهی دریافت نمی‌شود.</p>{id === 'accounts' && <ActionButton shape="pill" className="primary-button" onClick={() => onOpen('card')}>مشاهدهٔ کارت نمایشی</ActionButton>}<ActionButton variant="secondary" shape="pill" className="secondary-button" onClick={onClose}>بازگشت به خانه</ActionButton></>;
}
