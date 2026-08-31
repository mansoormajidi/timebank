'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from './Icon';

export function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  const reduced = useReducedMotion();
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const original = document.activeElement as HTMLElement | null;
    panel.current?.focus({ preventScroll: true });
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const panelNodes = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex="0"]') ?? []);
      const nodes = [...document.querySelectorAll<HTMLElement>('.bottom-nav button'), ...panelNodes];
      const first = nodes[0], last = nodes.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (document.activeElement === panel.current) { event.preventDefault(); (event.shiftKey ? last : panelNodes[0] || first)?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
      const target = original?.isConnected ? original : document.querySelector<HTMLElement>('.bottom-nav button');
      target?.focus({ preventScroll: true });
    };
  }, []);
  return <>
    <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }} onClick={onClose} />
    <motion.section ref={panel} tabIndex={-1} role="dialog" aria-modal="false" aria-labelledby="sheet-heading" className="bottom-sheet" initial={{ y: reduced ? 0 : 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: reduced ? 0 : 35, opacity: 0 }} transition={{ type: 'spring', stiffness: 430, damping: 36 }}>
      <div className="sheet-handle" /><header className="sheet-header"><h2 id="sheet-heading">{title}</h2><button className="round-button" onClick={onClose} aria-label="بستن پنجره"><Icon name="close" size={18} /></button></header>
      <div className="sheet-body">{children}</div>
    </motion.section>
  </>;
}
