'use client';
import { useState } from 'react';
import { CardOtpPanel } from './CardOtpPanel';
import { SuccessAnimation } from './SuccessAnimation';
import type { ActivityEvent } from '../lib/activity';
import { ActionButton } from './ui/ActionButton';
export function CardActions({kind,blocked,onComplete,onClose}:{kind:'block'|'password';blocked:boolean;onComplete:(a:ActivityEvent)=>void;onClose:()=>void}){
 const [done,setDone]=useState(false);
 if(kind==='password')return <CardOtpPanel onComplete={onComplete}/>;
 function complete(){if(done)return;onComplete({title:blocked?'رفع مسدودی گرین‌کارت':'مسدودی گرین‌کارت',value:'انجام شد',icon:'blocked'});setDone(true);}
 if(done)return <div className="success-panel"><SuccessAnimation/><h2>درخواست نمایشی ثبت شد</h2><p>تغییر در فعالیت‌های اخیر نمایش داده می‌شود.</p><ActionButton shape="pill" className="primary-button" onClick={onClose}>تمام</ActionButton></div>;
 return <><p className="sheet-description">{blocked?'مسدودی کارت نمایشی برداشته شود؟':'آیا از مسدود کردن کارت نمایشی مطمئن هستید؟'}</p><ActionButton shape="pill" className="primary-button" onClick={complete}>{blocked?'رفع مسدودی نمایشی':'مسدود کردن کارت'}</ActionButton><p className="sheet-note">فقط کارت نمایشی تغییر می‌کند.</p></>;
}
