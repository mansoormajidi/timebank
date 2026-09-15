'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BottomSheet } from './BottomSheet';
import { FlowShell } from './FlowShell';
import { Icon } from './Icon';
import { IranPlate, initialPlate, plateKindLabel, type PlateValue } from './IranPlate';
import { ActionButton } from './ui/ActionButton';

type GlyphName = 'car' | 'fine' | 'road' | 'license' | 'plate' | 'insurance' | 'check' | 'passport' | 'exit' | 'identity' | 'tax' | 'postal' | 'sim' | 'motor' | 'bill' | 'passport-state';
type ServiceItem = { id: string; title: string; description: string; icon: GlyphName };

const vehicleServices: ServiceItem[] = [
  { id: 'annual-toll', title: 'عوارض سالیانه خودرو', description: 'استعلام بدهی و پرداخت عوارض سالیانه خودرو', icon: 'car' },
  { id: 'violations', title: 'استعلام و پرداخت تخلفات', description: 'مشاهده ریز خلافی و پرداخت جرایم رانندگی', icon: 'fine' },
  { id: 'freeway', title: 'عوارض آزادراهی', description: 'استعلام و پرداخت عوارض عبور از آزادراه‌ها', icon: 'road' },
  { id: 'license', title: 'وضعیت گواهینامه', description: 'مشاهده آخرین وضعیت و اعتبار گواهینامه', icon: 'license' },
  { id: 'plates', title: 'پلاک‌های شخص', description: 'استعلام پلاک‌های فعال و غیرفعال شما', icon: 'plate' },
  { id: 'insurance', title: 'بیمه‌نامه', description: 'استعلام اعتبار بیمه شخص ثالث و بدنه', icon: 'insurance' },
];

const inquiryServices: ServiceItem[] = [
  { id: 'returned-check', title: 'چک برگشتی', description: 'استعلام وضعیت چک‌های برگشتی ثبت‌شده', icon: 'check' },
  { id: 'passport-state', title: 'وضعیت گذرنامه', description: 'پیگیری آخرین وضعیت صدور یا تمدید گذرنامه', icon: 'passport-state' },
  { id: 'exit-status', title: 'خروج از کشور', description: 'استعلام وضعیت مجوز و بدهی خروج از کشور', icon: 'exit' },
  { id: 'passport-services', title: 'پاسپورت', description: 'دسترسی به خدمات عمومی مرتبط با پاسپورت', icon: 'passport' },
];

const commonServices: ServiceItem[] = [
  { id: 'tax', title: 'مالیات من', description: 'مشاهده پرونده‌ها و بدهی‌های مالیاتی', icon: 'tax' },
  { id: 'postal', title: 'نشانی و کد پستی', description: 'استعلام و تأیید نشانی پستی', icon: 'postal' },
  { id: 'simcards', title: 'سیم‌کارت‌های من', description: 'استعلام سیم‌کارت‌های ثبت‌شده به نام شما', icon: 'sim' },
  { id: 'motor', title: 'خدمات موتورسیکلت', description: 'استعلام خلافی و خدمات مالکیت موتورسیکلت', icon: 'motor' },
];

function ServiceGlyph({ name }: { name: GlyphName }) {
  const imageNames: Partial<Record<GlyphName, string>> = { check: 'check', bill: 'bill', 'passport-state': 'passport-state', car: 'car', exit: 'exit', tax: 'tax', motor: 'motor', passport: 'passport', postal: 'postal', sim: 'sim' };
  if (imageNames[name]) return <img className="service-artwork" src={`/icons/services/${imageNames[name]}.jpg`} alt=""/>;
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let paths;
  if (name === 'car' || name === 'motor') paths = <><path d="M4 14.5 6.2 9h11.6l2.2 5.5v3H4v-3Z" {...common}/><path d="M7 17.5v1.2m10-1.2v1.2M7.2 14h.1m9.4 0h.1" {...common}/></>;
  else if (name === 'fine') paths = <><path d="M7 3.5h10v17H7z" {...common}/><path d="M9.5 8h5M9.5 12h5M9.5 16h3" {...common}/></>;
  else if (name === 'road') paths = <><path d="m9 21 2-18m4 18-2-18" {...common}/><path d="M12 6v3m0 3v3m0 3v2" {...common}/></>;
  else if (name === 'license') paths = <><rect x="3.5" y="6" width="17" height="12" rx="2" {...common}/><circle cx="8" cy="11" r="2" {...common}/><path d="M5.5 15c1.4-1.4 3.6-1.4 5 0m3-4h4m-4 3h4" {...common}/></>;
  else if (name === 'plate') paths = <><rect x="3" y="7" width="18" height="10" rx="2" {...common}/><path d="M7 12h10M5.5 10v4m13-4v4" {...common}/></>;
  else if (name === 'insurance') paths = <><path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6l-7-3Z" {...common}/><path d="m9 12 2 2 4-4" {...common}/></>;
  else if (name === 'check') paths = <><path d="M5 5h14v14H5z" {...common}/><path d="M8 9h8m-8 4h5m-5 3h3" {...common}/></>;
  else if (name === 'passport') paths = <><rect x="6" y="3" width="12" height="18" rx="2" {...common}/><circle cx="12" cy="11" r="3" {...common}/><path d="M9 11h6M12 8v6m-3.5 3h7" {...common}/></>;
  else if (name === 'exit') paths = <><path d="M10 5H5v14h5m4-3 4-4-4-4m4 4H9" {...common}/></>;
  else if (name === 'identity') paths = <><circle cx="12" cy="8" r="3" {...common}/><path d="M6 20c.7-4 3-6 6-6s5.3 2 6 6" {...common}/></>;
  else if (name === 'tax') paths = <><path d="M6 4h12v16H6z" {...common}/><path d="m9 15 6-6M9.5 9.5h.01m5 5h.01" {...common}/></>;
  else if (name === 'postal') paths = <><path d="M4 7h16v10H4z" {...common}/><path d="m4 8 8 6 8-6" {...common}/></>;
  else if (name === 'sim') paths = <><path d="M8 3h6l3 3v15H8V3Z" {...common}/><path d="M10 11h5v6h-5z" {...common}/></>;
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths}</svg>;
}

function ServiceGrid({ items, onSelect }: { items: ServiceItem[]; onSelect: (item: ServiceItem) => void }) {
  return <div className="service-catalog-grid">{items.map(item => <motion.button whileTap={{ scale: .96 }} key={item.id} onClick={() => onSelect(item)}><span className="catalog-icon"><ServiceGlyph name={item.icon}/></span><strong>{item.title}</strong><small>به‌زودی</small></motion.button>)}</div>;
}

export function ServicesHub({ onClose, onOpenBill }: { onClose: () => void; onOpenBill: () => void }) {
  const [view, setView] = useState<'index' | 'vehicle'>('index');
  const [plate, setPlate] = useState<PlateValue>(initialPlate);
  const [savedPlate, setSavedPlate] = useState<PlateValue | null>(null);
  const [plateError, setPlateError] = useState('');
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const choose = (item: ServiceItem) => setSelected(item);
  const savePlate = () => {
    if (plate.left.length !== 2 || plate.middle.length !== 3 || plate.city.length !== 2 || !plate.letter) { setPlateError('همه بخش‌های پلاک را کامل کنید.'); return; }
    setSavedPlate(plate); setPlateError('');
  };
  return <><FlowShell variant="transfer-compact internal-flow services-hub" title={view === 'index' ? 'خدمات تایم‌بانک' : 'خدمات خودرو'} stepKey={view + savedPlate} onBack={view === 'vehicle' ? () => setView('index') : onClose} onClose={onClose}>
    {view === 'index' ? <>
      <section className="services-hero"><span><Icon name="services" size={30}/></span><div><h2>خدمات تایم‌بانک</h2><p>از امور بانکی تا استعلام‌های روزمره</p></div></section>
      <section className="service-category service-primary-actions" aria-label="قبض و خودرو"><motion.button whileTap={{ scale: .96 }} onClick={onOpenBill}><span className="catalog-icon"><ServiceGlyph name="bill"/></span><strong>قبض</strong></motion.button><motion.button whileTap={{ scale: .96 }} onClick={() => setView('vehicle')}><span className="catalog-icon"><ServiceGlyph name="car"/></span><strong>خودرو</strong></motion.button></section>
      <section className="service-category"><div className="service-category-title"><div><h2>استعلامات</h2><p>دسترسی سریع به استعلام‌های پرکاربرد</p></div></div><ServiceGrid items={inquiryServices} onSelect={choose}/></section>
      <section className="service-category"><div className="service-category-title"><div><h2>سایر خدمات عمومی</h2><p>سرویس‌هایی که به‌تدریج به تایم‌بانک اضافه می‌شوند.</p></div></div><ServiceGrid items={commonServices} onSelect={choose}/></section>

    </> : <>
      {!savedPlate ? <section className="vehicle-onboarding"><span className="vehicle-big-icon"><ServiceGlyph name="car"/></span><h2>پلاک خودرو را اضافه کنید</h2><p>شماره را مطابق کارت خودرو وارد کنید؛ نوع و رنگ پلاک از روی حرف آن مشخص می‌شود.</p><IranPlate value={plate} onChange={next => { setPlate(next); setPlateError(''); }}/>{plateError && <p className="plate-error" role="alert">{plateError}</p>}<ActionButton shape="pill" onClick={savePlate}>افزودن خودرو</ActionButton><button className="demo-fill" onClick={() => { setPlate({ left: '12', letter: 'ب', middle: '345', city: '11' }); setPlateError(''); }}>درج پلاک آزمایشی</button></section> : <><section className="saved-vehicle-card"><div className="saved-vehicle-heading"><span className="vehicle-big-icon"><ServiceGlyph name="car"/></span><div><small>خودروی من</small><strong>{plateKindLabel(savedPlate.letter)}</strong></div><button onClick={() => setSavedPlate(null)}>ویرایش پلاک</button></div><IranPlate value={savedPlate} readOnly /></section><section className="service-category vehicle-service-list"><div className="service-category-title"><div><h2>خدمات این خودرو</h2><p>یک سرویس را برای مشاهده جزئیات انتخاب کنید.</p></div></div><ServiceGrid items={vehicleServices} onSelect={choose}/></section></>}
    </>}
  </FlowShell>
  <AnimatePresence>{selected && <BottomSheet title={selected.title} onClose={() => setSelected(null)}><span className="detail-icon catalog-detail-icon"><ServiceGlyph name={selected.icon}/></span><span className="phase-badge">به‌زودی</span><p className="sheet-description">{selected.description}</p><p className="sheet-note">این سرویس در نقشهٔ توسعهٔ تایم‌بانک قرار دارد و به‌زودی فعال می‌شود.</p><ActionButton variant="secondary" shape="pill" className="secondary-button" onClick={() => setSelected(null)}>متوجه شدم</ActionButton></BottomSheet>}</AnimatePresence></>;
}
