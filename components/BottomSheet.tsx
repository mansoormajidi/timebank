'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { motion, useIsPresent, useReducedMotion } from 'motion/react';
import { Icon } from './Icon';
export function BottomSheet({ title, subtitle, onClose, onBack, children, className = '' }: { title: string; subtitle?: string; onClose?: () => void; onBack?: () => void; children: ReactNode; className?: string }) {
  const panel = useRef<HTMLElement>(null); const headingId = useId(); const closeRef = useRef(onClose); const reduced = useReducedMotion(); const present = useIsPresent();
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const original = document.activeElement as HTMLElement | null; panel.current?.focus({ preventScroll: true });
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeRef.current) { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea, [tabindex="0"]') ?? []).filter(n => n.getClientRects().length > 0);
      const first = nodes[0], last = nodes.at(-1); if (!first) { event.preventDefault(); return; }
      if (document.activeElement === panel.current || !panel.current?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', listener);
    return () => { document.removeEventListener('keydown', listener); if (original?.isConnected && !original.closest('[inert]')) original.focus({ preventScroll: true }); };
  }, []);
  useEffect(()=>{panel.current?.focus({preventScroll:true});panel.current?.querySelector('.sheet-body')?.scrollTo(0,0);},[title]);
  return <><motion.div className="sheet-backdrop" style={{ pointerEvents: present ? 'auto' : 'none' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .22 }} onClick={onClose} />
    <motion.section ref={panel} inert={!present} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={headingId} className={`bottom-sheet ${className}`} initial={{ y: reduced ? 0 : '105%' }} animate={{ y: 0 }} exit={{ y: reduced ? 0 : '105%' }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 290, damping: 32, mass: 1 }}>
      <div className="sheet-handle" /><header className="sheet-header">{onBack && <button className="sheet-back" onClick={onBack} aria-label="مرحله قبل"><Icon name="chevron" size={22} /></button>}<h2 id={headingId}>{title}</h2>{onClose && <button className="round-button" onClick={onClose} aria-label="بستن پنجره"><Icon name="close" size={18} /></button>}</header>{subtitle && <p className="sheet-subtitle">{subtitle}</p>}<div className="sheet-body">{children}</div>
    </motion.section></>;
}
