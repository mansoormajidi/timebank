'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { ActivityEvent } from '../lib/activity';
import { digits, money, persianDigits } from '../lib/forms';
import { BottomSheet } from './BottomSheet';
import { FlowShell } from './FlowShell';
import { Icon } from './Icon';
import { MaterialField } from './MaterialField';
import { SuccessAnimation } from './SuccessAnimation';
import { ActionButton } from './ui/ActionButton';
import { ListRow } from './ui/ListRow';

type Step = 'categories' | 'list' | 'detail' | 'processing' | 'receipt';
type Bill = { id: string; title: string; issuer: string; paymentId: string; amount: number; due: string; status: string };

const billCategories = [
  { id: 'waqf', title: 'اوقاف' },
  { id: 'water', title: 'آب' },
  { id: 'electricity', title: 'برق' },
  { id: 'gas', title: 'گاز' },
  { id: 'phone', title: 'تلفن ثابت' },
  { id: 'mobile', title: 'تلفن همراه' },
] as const;

const savedBills: Bill[] = [
  { id: '3923405223847', title: 'قبض یاری', issuer: 'سازمان اوقاف و امور خیریه', paymentId: '823710460', amount: 1250000, due: '۲۰ شهریور ۱۴۰۵', status: 'پرداخت‌نشده' },
  { id: '392340522509340', title: 'قبض صالحات', issuer: 'مرکز امور خیریه', paymentId: '924610837', amount: 2800000, due: '۲۵ شهریور ۱۴۰۵', status: 'پرداخت‌نشده' },
];

export function BillFlow({ onClose, onComplete }: { onClose: () => void; onComplete: (event: ActivityEvent) => void }) {
  const [step, setStep] = useState<Step>('categories');
  const [billId, setBillId] = useState('');
  const [selected, setSelected] = useState<Bill | null>(null);
  const [error, setError] = useState('');
  const [categoryNotice, setCategoryNotice] = useState<(typeof billCategories)[number] | null>(null);
  const recorded = useRef(false);
  useEffect(() => {
    if (step !== 'processing' || !selected) return;
    const timer = window.setTimeout(() => {
      if (!recorded.current) {
        recorded.current = true;
        onComplete({ title: `پرداخت ${selected.title}`, value: `${money(selected.amount)} ریال`, icon: 'receipt', details: [['شناسه قبض', persianDigits(selected.id)], ['شناسه پرداخت', persianDigits(selected.paymentId)], ['صادرکننده', selected.issuer]] });
      }
      setStep('receipt');
    }, 1150);
    return () => window.clearTimeout(timer);
  }, [step, selected, onComplete]);

  function inspect(bill: Bill) { setSelected(bill); setBillId(bill.id); setError(''); setStep('detail'); }
  function queryBill() {
    if (!/^\d{6,20}$/.test(billId)) { setError('شناسه قبض باید بین ۶ تا ۲۰ رقم باشد.'); return; }
    const existing = savedBills.find(item => item.id === billId);
    inspect(existing || { id: billId, title: 'قبض خدمات اوقاف', issuer: 'سازمان اوقاف و امور خیریه', paymentId: `84${billId.slice(-7).padStart(7, '0')}`, amount: 1860000, due: '۳۰ شهریور ۱۴۰۵', status: 'پرداخت‌نشده' });
  }
  function back() {
    if (step === 'processing') return;
    if (step === 'list') setStep('categories');
    else if (step === 'detail') { setError(''); setStep('list'); }
    else if (step === 'receipt') onClose();
    else onClose();
  }
  const title = step === 'categories' ? 'پرداخت قبض' : step === 'list' ? 'قبوض اوقاف' : step === 'detail' ? 'جزئیات قبض' : step === 'processing' ? 'پرداخت قبض' : 'رسید پرداخت قبض';
  return <><FlowShell variant="transfer-compact internal-flow bill-flow" title={title} stepKey={step} onBack={back} onClose={onClose}>
    {step === 'categories' && <><section className="bill-category-intro"><span className="bill-category-main-icon"><Icon name="receipt" size={28}/></span><div><h2>قبض موردنظر را انتخاب کنید</h2><p>استعلام و پرداخت قبوض خدماتی و اوقاف</p></div></section><section className="bill-category-grid">{billCategories.map(item => <button key={item.id} onClick={() => { if (item.id === 'waqf') { setCategoryNotice(null); setStep('list'); } else setCategoryNotice(item); }}><span>{item.id === 'waqf' ? <Icon name="mosque" size={28}/> : <img src={`/assets/bills/${item.id}.svg`} alt=""/>}</span><strong>{item.title}</strong>{item.id !== 'waqf' && <small>به‌زودی</small>}</button>)}</section><p className="sheet-note">در این نسخه، مسیر پرداخت قبض اوقاف فعال است.</p></>}
    {step === 'list' && <><section className="bill-query-card"><MaterialField label="شناسه قبض" value={persianDigits(billId)} dir="ltr" inputMode="numeric" maxLength={20} leading={<Icon name="receipt" size={23}/>} error={error} onChange={event => { setBillId(digits(event.target.value)); setError(''); }}/><ActionButton className="flow-button" onClick={queryBill}>استعلام جزئیات قبض</ActionButton></section><section className="saved-bills"><h2>لیست قبوض شما بر اساس کد ملی</h2><div>{savedBills.map(bill => <ListRow key={bill.id} title={bill.title} subtitle={<span dir="ltr">{persianDigits(bill.id)}</span>} trailing={<Icon name="chevron" size={19}/>} onClick={() => inspect(bill)}/>)}</div></section></>}
    {step === 'detail' && selected && <><section className="bill-summary-card"><span className="bill-hero-icon"><Icon name="receipt" size={32}/></span><small>{selected.issuer}</small><h2>{selected.title}</h2><div className="bill-amount"><strong>{money(selected.amount)}</strong><Icon name="rial" size={21}/></div><span className="bill-status">{selected.status}</span></section><section className="bill-details-card"><dl><div><dt>شناسه قبض</dt><dd dir="ltr">{persianDigits(selected.id)}</dd></div><div><dt>شناسه پرداخت</dt><dd dir="ltr">{persianDigits(selected.paymentId)}</dd></div><div><dt>مهلت پرداخت</dt><dd>{selected.due}</dd></div><div><dt>صادرکننده</dt><dd>{selected.issuer}</dd></div></dl></section><ActionButton shape="pill" className="flow-button bill-pay-button" onClick={() => setStep('processing')}>پرداخت قبض</ActionButton><ActionButton variant="secondary" shape="pill" className="secondary-button bill-back" onClick={() => setStep('list')}>بازگشت به لیست قبض‌ها</ActionButton></>}
    {step === 'processing' && <div className="processing-panel" role="status"><div className="processing-spinner"/><h2>در حال پرداخت قبض</h2><p>پرداخت به‌صورت نمایشی ثبت می‌شود.</p></div>}
    {step === 'receipt' && selected && <><section className="bill-receipt"><SuccessAnimation/><span className="receipt-status">پرداخت نمایشی موفق</span><h2>{selected.title} پرداخت شد</h2><div className="bill-amount"><strong>{money(selected.amount)}</strong><Icon name="rial" size={21}/></div><dl><div><dt>شناسه قبض</dt><dd dir="ltr">{persianDigits(selected.id)}</dd></div><div><dt>شناسه پرداخت</dt><dd dir="ltr">{persianDigits(selected.paymentId)}</dd></div><div><dt>شماره پیگیری</dt><dd>۶۸۴۲۹۱۷۵۳۰</dd></div><div><dt>زمان پرداخت</dt><dd>همین حالا</dd></div></dl><p className="sheet-note">این رسید و پرداخت صرفاً نمایشی است.</p></section><ActionButton shape="pill" className="flow-button" onClick={onClose}>بازگشت به خانه</ActionButton></>}
  </FlowShell><AnimatePresence>{categoryNotice && <BottomSheet title={`قبض ${categoryNotice.title}`} onClose={() => setCategoryNotice(null)}><span className="detail-icon catalog-detail-icon bill-coming-soon-icon"><img src={`/assets/bills/${categoryNotice.id}.svg`} alt=""/></span><span className="phase-badge">به‌زودی</span><p className="sheet-description">استعلام و پرداخت قبض {categoryNotice.title} به‌زودی از همین بخش در دسترس خواهد بود.</p><p className="sheet-note">این سرویس در نقشهٔ توسعهٔ تایم‌بانک قرار دارد و به‌زودی فعال می‌شود.</p><ActionButton variant="secondary" shape="pill" className="secondary-button" onClick={() => setCategoryNotice(null)}>متوجه شدم</ActionButton></BottomSheet>}</AnimatePresence></>;
}
