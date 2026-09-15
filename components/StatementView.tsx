'use client';

import { useMemo, useState } from 'react';
import type { Activity } from '../lib/activity';

type Direction = 'credit' | 'debit';
type Status = 'success' | 'pending' | 'failed';
type Transaction = {
  id: string;
  at: string;
  title: string;
  counterparty: string;
  detail: string;
  amount: number;
  direction: Direction;
  status: Status;
  method: string;
  reference: string;
};

const digits = new Intl.NumberFormat('fa-IR');
const money = (value: number) => digits.format(value);
const faDate = (value: string) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
const faTime = (value: string) => new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

const seed: Transaction[] = [
  { id: 'tr-1', at: '2026-09-01T10:35:00+03:30', title: 'انتقال به نرگس احمدی', counterparty: 'بانک ملت · ۶۱۰۴••••۹۸۲۱', detail: 'بابت تسویه خرید', amount: 18500000, direction: 'debit', status: 'success', method: 'کارت‌به‌کارت', reference: '۶۸۱۹۳۷۲۴۱۵' },
  { id: 'tr-2', at: '2026-08-31T18:12:00+03:30', title: 'واریز از محمد رضایی', counterparty: 'تایم‌بانک · ۶۲۱۹••••۲۴۰۸', detail: 'انتقال داخلی', amount: 42000000, direction: 'credit', status: 'success', method: 'انتقال داخلی', reference: '۴۰۲۸۵۱۹۷۳۶' },
  { id: 'tr-3', at: '2026-08-29T08:46:00+03:30', title: 'انتقال به شرکت آوید', counterparty: 'شبا · IR۲۳۰۱••••۷۱۸۹', detail: 'پرداخت قرارداد مرداد', amount: 75000000, direction: 'debit', status: 'pending', method: 'پایا', reference: '۷۹۵۴۲۶۱۸۰۳' },
  { id: 'tr-4', at: '2026-08-26T22:04:00+03:30', title: 'بازگشت وجه خرید', counterparty: 'درگاه پرداخت · فروشگاه ماه', detail: 'بازگشت خودکار وجه', amount: 6350000, direction: 'credit', status: 'success', method: 'بازگشت وجه', reference: '۲۱۰۷۳۸۴۵۶۹' },
  { id: 'tr-5', at: '2026-08-18T14:20:00+03:30', title: 'انتقال به علی کریمی', counterparty: 'بانک سامان · ۶۲۱۹••••۴۸۱۰', detail: 'هدیه تولد', amount: 12000000, direction: 'debit', status: 'failed', method: 'کارت‌به‌کارت', reference: '۹۱۵۶۳۸۲۰۷۴' },
  { id: 'tr-6', at: '2026-08-06T11:10:00+03:30', title: 'واریز از حساب پس‌انداز', counterparty: 'تایم‌بانک · حساب شخصی', detail: 'جابجایی بین حساب‌ها', amount: 90000000, direction: 'credit', status: 'success', method: 'انتقال داخلی', reference: '۳۴۶۲۹۸۱۵۷۰' },
];

function activityTransactions(activities: Activity[]): Transaction[] {
  return activities.filter(item => item.title === 'کوک کردن حساب' || item.title === 'افزایش موجودی').map((item, index) => ({
    id: `activity-${item.id}`,
    at: new Date(Date.now() - index * 1000).toISOString(),
    title: 'کوک کردن حساب',
    counterparty: 'درگاه پرداخت اینترنتی',
    detail: 'واریز به حساب نبض زمان و خرج',
    amount: Number(item.value.replace(/[^\d]/g, '')) || 0,
    direction: 'credit',
    status: 'success',
    method: 'درگاه پرداخت',
    reference: item.details?.find(([label]) => label === 'شماره پیگیری')?.[1] || '—',
  }));
}

export function StatementView({ activities, hidden }: { activities: Activity[]; hidden: boolean }) {
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState<'all' | Direction>('all');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const transactions = useMemo(() => [...activityTransactions(activities), ...seed], [activities]);
  const filtered = useMemo(() => transactions.filter(item => {
    const normalized = query.trim().toLocaleLowerCase('fa');
    const haystack = `${item.title} ${item.counterparty} ${item.reference} ${item.detail}`.toLocaleLowerCase('fa');
    const date = item.at.slice(0, 10);
    const time = item.at.slice(11, 16);
    return (!normalized || haystack.includes(normalized))
      && (direction === 'all' || item.direction === direction)
      && (status === 'all' || item.status === status)
      && (!fromDate || date >= fromDate) && (!toDate || date <= toDate)
      && (!fromTime || time >= fromTime) && (!toTime || time <= toTime)
      && (!minAmount || item.amount >= Number(minAmount))
      && (!maxAmount || item.amount <= Number(maxAmount));
  }), [transactions, query, direction, status, fromDate, toDate, fromTime, toTime, minAmount, maxAmount]);

  const groups = useMemo(() => Object.entries(filtered.reduce<Record<string, Transaction[]>>((all, item) => {
    const key = item.at.slice(0, 10);
    (all[key] ||= []).push(item);
    return all;
  }, {})), [filtered]);
  const incoming = filtered.filter(item => item.direction === 'credit' && item.status === 'success').reduce((sum, item) => sum + item.amount, 0);
  const outgoing = filtered.filter(item => item.direction === 'debit' && item.status === 'success').reduce((sum, item) => sum + item.amount, 0);
  const activeFilters = [query, direction !== 'all' ? direction : '', status !== 'all' ? status : '', fromDate, toDate, fromTime, toTime, minAmount, maxAmount].filter(Boolean).length;

  function clearFilters() {
    setQuery(''); setDirection('all'); setStatus('all'); setFromDate(''); setToDate('');
    setFromTime(''); setToTime(''); setMinAmount(''); setMaxAmount('');
  }
  function quickRange(days: number) {
    const end = new Date('2026-09-01T12:00:00+03:30');
    const start = new Date(end); start.setDate(start.getDate() - days + 1);
    setFromDate(start.toISOString().slice(0, 10)); setToDate('2026-09-01');
  }
  function exportCsv() {
    const rows = [['تاریخ', 'زمان', 'شرح', 'نوع', 'مبلغ (ریال)', 'وضعیت', 'پیگیری'], ...filtered.map(item => [faDate(item.at), faTime(item.at), item.title, item.direction === 'credit' ? 'واریز' : 'برداشت', String(item.amount), item.status === 'success' ? 'موفق' : item.status === 'pending' ? 'در انتظار' : 'ناموفق', item.reference])];
    const csv = '\ufeff' + rows.map(row => row.map(cell => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'timebank-statement.csv'; link.click(); URL.revokeObjectURL(url);
    setNotice('خروجی CSV ردپای مالی آماده شد.');
  }

  return <div className="statement-view">
    <section className="statement-balance">
      <div><small>مانده فعلی</small><strong>{hidden ? '•••٬•••٬•••' : '۲۴۸٬۵۶۰٬۰۰۰'} <em>ریال</em></strong></div>
      <button onClick={exportCsv} aria-label="دریافت خروجی ردپای مالی"><span>⇩</span> دریافت خروجی</button>
    </section>

    <label className="statement-search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی نام، شرح یا شماره پیگیری" /></label>
    <div className="statement-tabs" role="group" aria-label="نوع تراکنش">
      {([['all', 'همه'], ['debit', 'برداشت'], ['credit', 'واریز']] as const).map(([value, label]) => <button key={value} onClick={() => setDirection(value)} className={direction === value ? 'selected' : ''}>{label}</button>)}
    </div>
    <div className="quick-date-filters"><button onClick={() => quickRange(7)}>۷ روز</button><button onClick={() => quickRange(30)}>۳۰ روز</button><button onClick={() => quickRange(90)}>۹۰ روز</button><button className={advanced ? 'selected' : ''} onClick={() => setAdvanced(value => !value)}>فیلترها {activeFilters > 0 && <b>{digits.format(activeFilters)}</b>}</button></div>

    {advanced && <section className="advanced-filters">
      <div className="filter-section-head"><strong>فیلترهای دقیق</strong>{activeFilters > 0 && <button onClick={clearFilters}>پاک کردن همه</button>}</div>
      <div className="filter-grid"><label>از تاریخ<input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} /></label><label>تا تاریخ<input type="date" value={toDate} onChange={event => setToDate(event.target.value)} /></label></div>
      <div className="filter-grid"><label>از ساعت<input type="time" value={fromTime} onChange={event => setFromTime(event.target.value)} /></label><label>تا ساعت<input type="time" value={toTime} onChange={event => setToTime(event.target.value)} /></label></div>
      <div className="filter-grid"><label>حداقل مبلغ<input inputMode="numeric" value={minAmount} onChange={event => setMinAmount(event.target.value.replace(/\D/g, ''))} placeholder="۰ ریال" /></label><label>حداکثر مبلغ<input inputMode="numeric" value={maxAmount} onChange={event => setMaxAmount(event.target.value.replace(/\D/g, ''))} placeholder="بدون محدودیت" /></label></div>
      <label className="status-filter">وضعیت<select value={status} onChange={event => setStatus(event.target.value as 'all' | Status)}><option value="all">همه وضعیت‌ها</option><option value="success">موفق</option><option value="pending">در انتظار</option><option value="failed">ناموفق</option></select></label>
    </section>}

    <section className="statement-summary" aria-label="خلاصه نتایج"><div className="summary-in"><span>↙</span><small>جمع واریز</small><strong>{hidden ? '••••' : money(incoming)} <em>ریال</em></strong></div><div className="summary-out"><span>↗</span><small>جمع برداشت</small><strong>{hidden ? '••••' : money(outgoing)} <em>ریال</em></strong></div></section>

    <div className="transaction-heading"><strong>{digits.format(filtered.length)} تراکنش</strong><span>جدیدترین</span></div>
    {groups.length === 0 ? <div className="statement-empty"><span>⌕</span><strong>تراکنشی پیدا نشد</strong><p>فیلترها را تغییر دهید یا همه را پاک کنید.</p><button onClick={clearFilters}>پاک کردن فیلترها</button></div> : groups.map(([date, items]) => <section className="transaction-group" key={date}>
      <h3>{faDate(`${date}T12:00:00+03:30`)}</h3>
      {items.map(item => <article className={`transaction-card ${selected === item.id ? 'is-open' : ''}`} key={item.id}>
        <button className="transaction-main" onClick={() => setSelected(selected === item.id ? null : item.id)} aria-expanded={selected === item.id}>
          <span className={`transaction-direction ${item.direction}`}>{item.direction === 'credit' ? '↙' : '↗'}</span>
          <span className="transaction-copy"><strong>{item.title}</strong><small>{faTime(item.at)} · {item.method}</small></span>
          <span className={`transaction-amount ${item.direction}`}>{hidden ? '••••' : `${item.direction === 'credit' ? '+' : '−'}${money(item.amount)}`}<small>ریال</small><i className={item.status}>{item.status === 'success' ? 'موفق' : item.status === 'pending' ? 'در انتظار' : 'ناموفق'}</i></span>
        </button>
        {selected === item.id && <dl className="transaction-details"><div><dt>طرف انتقال</dt><dd>{item.counterparty}</dd></div><div><dt>شرح</dt><dd>{item.detail}</dd></div><div><dt>شماره پیگیری</dt><dd>{item.reference}</dd></div><div><dt>زمان دقیق</dt><dd>{faDate(item.at)}، {faTime(item.at)}</dd></div></dl>}
      </article>)}
    </section>)}
    <p className="statement-disclaimer">اطلاعات این ردپای مالی نمایشی است و اعتبار بانکی ندارد.</p>
    <div className="sr-only" role="status">{notice}</div>
  </div>;
}
