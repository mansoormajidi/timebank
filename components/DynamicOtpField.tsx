'use client';
import { useEffect,useState } from 'react';
import { MaterialField } from './MaterialField';
import { digits,persianDigits } from '../lib/forms';
export function DynamicOtpField({value,onChange,error,onRequest}:{value:string;onChange:(v:string)=>void;error?:string;onRequest?:()=>void}){
 const [seconds,setSeconds]=useState(0);const [requested,setRequested]=useState(false);
 useEffect(()=>{if(!seconds)return;const timer=setTimeout(()=>setSeconds(v=>v-1),1000);return()=>clearTimeout(timer);},[seconds]);
 return <MaterialField className="inline-otp-field" label="رمز دوم" type="password" value={value} inputMode="numeric" dir="ltr" maxLength={6} autoComplete="one-time-code" onChange={e=>onChange(digits(e.target.value))} error={error} hint={requested?'کد آزمایشی: ۱۲۳۴۵۶؛ پیامکی ارسال نشده است.':undefined} trailing={<button type="button" disabled={seconds>0} onClick={()=>{setRequested(true);setSeconds(105);onRequest?.();}}>{seconds?`${persianDigits(String(Math.floor(seconds/60)).padStart(2,'0'))}:${persianDigits(String(seconds%60).padStart(2,'0'))}`:'دریافت رمز پویا'}</button>} />;
}
