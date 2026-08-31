'use client';
import { useState } from 'react';
import { account, activities, services } from '../lib/demo';
import { Icon, type IconName } from './Icon';

export const detailTitles: Record<string, string> = {
  profile: 'حساب کاربری', notifications: 'اعلان‌ها', report: 'گزارش حساب', numbers: 'شماره‌های حساب',
  services: 'همه خدمات', card: 'جزئیات گرین‌کارت', invite: 'دعوت از دوستان', giving: 'کمک‌ها و هدایا', endowment: 'وقف پول',
  activity: 'همه فعالیت‌ها', accounts: 'حساب‌ها', transfer: 'انتقال وجه', statement: 'صورتحساب', topup: 'افزایش موجودی',
  bill: 'پرداخت قبض', shrines: 'امام‌زاده‌ها', lease: 'اجاره‌نامه', auction: 'شرکت در مزایده', welfare: 'خدمات رفاهی زائرین',
};

function CopyField({ label, value, hidden }: { label: string; value: string; hidden: boolean }) {
  const [state, setState] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(value); setState('کپی شد'); }
    catch { setState('کپی خودکار در دسترس نیست؛ متن را انتخاب کنید.'); }
  }
  return <div className="copy-field"><label>{label}</label><div><span dir="ltr">{hidden ? '•••• •••• ••••' : value}</span><button onClick={copy} disabled={hidden} aria-label={`کپی ${label}`}>{state === 'کپی شد' ? 'کپی شد ✓' : 'کپی'}</button></div><small role="status">{state}</small></div>;
}

export function HomeDetails({ id, hidden, onOpen, onClose }: { id: string; hidden: boolean; onOpen: (id: string) => void; onClose: () => void }) {
  const activity = activities.find(a => a.id === id);
  if (activity) return <><span className="detail-icon"><Icon name={activity.icon} size={30} /></span><p className="detail-amount">{hidden && !activity.pending ? '••••••' : activity.value}</p><dl className="detail-list"><div><dt>شرح</dt><dd>{activity.title}</dd></div><div><dt>زمان / پیگیری</dt><dd>{activity.subtitle}</dd></div><div><dt>نوع اطلاعات</dt><dd>نمونهٔ نمایشی</dd></div></dl><p className="sheet-note">این رسید صرفاً برای نمایش رابط کاربری است و اعتبار بانکی ندارد.</p></>;
  if (id === 'numbers' || id === 'card') return <>{id === 'card' && <div className="detail-bank-card"><Icon name="logo" size={30} /><strong>گرین‌کارت</strong><span dir="ltr">{hidden ? '•••• •••• •••• ۵۳۷۶' : account.card}</span><small>کارت نمایشی · غیرقابل استفاده</small></div>}<CopyField label="شماره کارت نمایشی" value={account.card} hidden={hidden} /><CopyField label="شماره حساب نمایشی" value={account.number} hidden={hidden} /><CopyField label="شبای نمونه (نامعتبر)" value={account.iban} hidden={hidden} /><p className="sheet-note">این شماره‌ها نمونه هستند؛ برای واریز یا پرداخت استفاده نشوند.</p></>;
  if (id === 'report') return <><p className="sheet-eyebrow">موجودی حساب هزینه‌های روزمره</p><p className="detail-amount">{hidden ? '•••٬•••٬•••' : account.balance}<small> ریال</small></p><div className={`balance-chart ${hidden ? 'chart-hidden' : ''}`} role="img" aria-label={hidden ? 'نمودار موجودی پنهان شده' : 'نمودار نمایشی روند موجودی هفته'}>{[40, 60, 45, 75, 56, 83, 70].map((v, i) => <div key={i}><span style={{ height: `${hidden ? 40 : v}%` }} /><small>{['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][i]}</small></div>)}</div><p className="sheet-note">نمایش نمونهٔ هفتگی · اعداد نمودار نمایشی هستند.</p><button className="primary-button" onClick={() => onOpen('activity')}>مشاهدهٔ فعالیت‌های اخیر</button></>;
  if (id === 'notifications') return <><div className="notice-item"><span className="service-icon"><Icon name="card" /></span><div><strong>درخواست کارت شما ثبت شد</strong><p>درخواست شمارهٔ ۵۳۴۵۷۹ در حال بررسی است.</p><small>امروز، ۰۹:۳۰ · نمونه</small></div></div><div className="notice-item"><span className="service-icon"><Icon name="mosque" /></span><div><strong>یک قدم برای کار خوب</strong><p>خدمات وقف و هدایا از صفحهٔ خانه در دسترس‌اند.</p><small>پیام نمایشی</small></div></div></>;
  if (id === 'activity') return <div className="detail-services">{activities.map(a => <button key={a.id} onClick={() => onOpen(a.id)}><span className="service-icon"><Icon name={a.icon} /></span><span><strong>{a.title}</strong><small>{hidden && !a.pending ? '••• ریال' : a.value}</small></span><Icon name="chevron" size={16} /></button>)}</div>;
  if (id === 'services') return <div className="detail-services">{[...services, { id: 'auction', title: 'شرکت در مزایده', icon: 'auction' as IconName, description: 'فرصت‌های واگذاری املاک موقوفه' }, { id: 'welfare', title: 'خدمات رفاهی زائرین', icon: 'chair' as IconName, description: 'امکانات اقامتی و رفاهی' }].map(s => <button key={s.id} onClick={() => onOpen(s.id)}><span className="service-icon"><Icon name={s.icon} /></span><span><strong>{s.title}</strong><small>{s.description}</small></span><Icon name="chevron" size={16} /></button>)}</div>;
  if (id === 'invite') return <><div className="invite-illustration"><img src="/assets/imgImage18.png" alt="پلی‌استیشن ۵" /></div><h3 className="detail-heading">هر دعوت، یک شانس تازه</h3><p className="sheet-description">در طرح اصلی، با دعوت از دوستان در قرعه‌کشی ۱۱۰ کنسول PS5 شرکت می‌کنید.</p><CopyField label="کد دعوت نمایشی" value="DEMO-HOME" hidden={false} /><p className="sheet-note">این کمپین در پروتوتایپ فعال نیست؛ هیچ دعوتی ارسال نمی‌شود.</p></>;
  if (id === 'giving' || id === 'endowment') return <><img className="giving-detail-art" src={`/assets/${id === 'giving' ? 'imgRectangle2' : 'imgRectangle1'}.png`} alt="" /><p className="detail-amount">{id === 'giving' ? '۳ کمک و هدیه' : hidden ? '••٬•••٬•••' : '۳۵٬۶۵۸٬۰۰۰ ریال'}</p><p className="sheet-description">{id === 'giving' ? 'کمک‌های کوچک، اثرهای ماندگار. این بخش خلاصه‌ای از هدایا و مشارکت‌های شما را نشان می‌دهد.' : 'خلاصهٔ مشارکت در وقف پول؛ جزئیات طرح‌های وقف در مرحلهٔ بعد اضافه می‌شود.'}</p><p className="sheet-note">اطلاعات نمونه هستند و پرداختی انجام نشده است.</p></>;
  if (id === 'profile') return <><div className="profile-detail"><img src="/assets/avatar.png" alt="تصویر کاربر در طرح Figma" /><strong>کاربر نمایشی</strong><span>به همراه‌بانک خوش آمدید</span></div><p className="sheet-description">در این مرحله فقط صفحهٔ خانه پیاده‌سازی شده است. ورود و احراز هویت در مرحلهٔ بعد توسعه پیدا می‌کند.</p><p className="sheet-note">این نسخه به هیچ حساب بانکی متصل نیست.</p></>;
  const descriptions: Record<string, string> = {
    accounts: 'مدیریت حساب‌ها و افتتاح حساب در مرحلهٔ بعد اضافه می‌شود.', transfer: 'انتقال کارت‌به‌کارت، پایا و ساتنا در مرحلهٔ بعد پیاده‌سازی می‌شود.',
    statement: 'فیلتر تراکنش‌ها و دریافت صورتحساب در مرحلهٔ بعد اضافه می‌شود.', topup: 'فرآیند افزایش موجودی در مرحلهٔ بعد طراحی می‌شود.',
    bill: 'استعلام و پرداخت قبوض در مرحلهٔ بعد اضافه می‌شود.', shrines: 'فهرست بقاع متبرکه و خدمات زیارتی در مرحلهٔ بعد تکمیل می‌شود.', lease: 'قراردادهای اجاره و پرداخت اجاره‌بهای موقوفات در مرحلهٔ بعد اضافه می‌شود.', auction: 'فهرست مزایده‌ها و ثبت درخواست در مرحلهٔ بعد پیاده‌سازی می‌شود.', welfare: 'امکانات اقامت و خدمات زائرین در مرحلهٔ بعد تکمیل می‌شود.',
  };
  return <><span className="phase-badge">در مرحلهٔ بعد</span><h3 className="detail-heading">{detailTitles[id] || 'این بخش'}، به‌زودی</h3><p className="sheet-description">{descriptions[id] || 'این مسیر برای توسعهٔ مرحلهٔ بعد آماده است.'}</p><p className="sheet-note">این مرحله فقط Home است. هیچ اطلاعات بانکی یا وجهی دریافت نمی‌شود.</p>{id === 'accounts' && <button className="primary-button" onClick={() => onOpen('card')}>مشاهدهٔ کارت نمایشی</button>}{id === 'statement' && <button className="primary-button" onClick={() => onOpen('activity')}>مشاهدهٔ فعالیت‌های نمونه</button>}<button className="secondary-button" onClick={onClose}>بازگشت به خانه</button></>;
}
