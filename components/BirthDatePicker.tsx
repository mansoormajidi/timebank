'use client';
import { useState } from 'react';
import { MaterialField } from './MaterialField';
import { persianDigits } from '../lib/forms';
const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
function daysInMonth(year:number,month:number){if(month<7)return 31;if(month<12)return 30;const f=new Intl.DateTimeFormat('en-u-ca-persian',{year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'});return [19,20,21].some(d=>{const parts=f.formatToParts(new Date(Date.UTC(year+622,2,d)));return parts.find(p=>p.type==='year')?.value===String(year)&&parts.find(p=>p.type==='month')?.value==='12'&&parts.find(p=>p.type==='day')?.value==='30';})?30:29;}
export function BirthDatePicker({value,onChange,error}:{value:string;onChange:(v:string)=>void;error?:string}) {
 const [open,setOpen]=useState(false);const [year,setYear]=useState(1370);const [month,setMonth]=useState(1);const [day,setDay]=useState(1);const last=daysInMonth(year,month);const current=Number(new Intl.DateTimeFormat('en-u-ca-persian',{year:'numeric'}).formatToParts(new Date()).find(p=>p.type==='year')?.value);
 return <div className="birth-picker">
  <MaterialField label="تاریخ تولد" value={value} readOnly dir="ltr" error={error} aria-expanded={open} onClick={()=>setOpen(!open)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpen(!open);}}}/>
  {open&&<div className="date-options" role="group" aria-label="انتخاب تاریخ تولد"><div>
    <label>روز<select aria-label="روز" value={day} onChange={e=>setDay(Number(e.target.value))}>{Array.from({length:last},(_,i)=><option value={i+1} key={i}>{persianDigits(String(i+1))}</option>)}</select></label>
    <label>ماه<select aria-label="ماه" value={month} onChange={e=>{setMonth(Number(e.target.value));setDay(1);}}>{months.map((m,i)=><option value={i+1} key={m}>{m}</option>)}</select></label>
    <label>سال<select aria-label="سال" value={year} onChange={e=>{setYear(Number(e.target.value));setDay(1);}}>{Array.from({length:current-1299},(_,i)=><option value={current-i} key={i}>{persianDigits(String(current-i))}</option>)}</select></label>
  </div><button type="button" className="primary-button" onClick={()=>{onChange(`${year}/${String(month).padStart(2,'0')}/${String(Math.min(day,last)).padStart(2,'0')}`);setOpen(false);}}>تأیید تاریخ</button></div>}
 </div>;
}
