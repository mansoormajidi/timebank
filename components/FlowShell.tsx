'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
export function StatusBar() {
  return <div className="status-bar" dir="ltr"><span>9:41</span><div className="status-levels"><img src="/assets/imgCellularConnection.svg" width="18" height="12" alt="" /><img src="/assets/imgWifi.svg" width="16" height="12" alt="" /><img src="/assets/imgBattery.svg" width="25" height="12" alt="" /></div></div>;
}
export function FlowShell({ title, subtitle, stepKey, onBack, onClose, progress, children, variant = '' }: { title: string; subtitle?: string; stepKey: string; onBack: () => void; onClose: () => void; progress?: number; variant?: string; children: ReactNode }) {
  const compact=variant==='transfer-compact';
  const heading = useRef<HTMLHeadingElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); scroll.current?.scrollTo(0, 0); }, [stepKey]);
  return <div className={`flow-screen ${variant}`}><StatusBar /><header className="flow-toolbar"><button className="round-button back-button" aria-label="مرحله قبل" onClick={onBack}><Icon name="chevron" size={20} /></button><div className="flow-toolbar-title">{compact?<h1 ref={heading} tabIndex={-1}>{title}</h1>:'تایم‌بانک'}</div><button className="round-button" aria-label="بازگشت به خانه" onClick={onClose}><Icon name="close" size={18} /></button></header><div ref={scroll} className="flow-scroll"><div className="flow-intro"><>{!compact&&<h1 ref={heading} tabIndex={-1}>{title}</h1>}</>{subtitle && <p>{subtitle}</p>}</div>{progress !== undefined && <div className="flow-progress" role="progressbar" aria-label="پیشرفت مراحل" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>}{children}<p className="privacy-note">پروتوتایپ محلی · از اطلاعات واقعی استفاده نکنید</p></div><div className="flow-home-indicator"><div className="home-indicator" /></div></div>;
}
