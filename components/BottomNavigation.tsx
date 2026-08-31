'use client';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { navigation } from '../lib/demo';
import { Icon } from './Icon';

export function BottomNavigation({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  const reduced = useReducedMotion();
  return <div className="nav-dock"><LayoutGroup id="primary-navigation"><motion.nav layoutRoot className="bottom-nav" aria-label="ناوبری اصلی">
    {navigation.map((item, index) => <motion.button key={item.id} whileTap={reduced ? undefined : { scale: .91 }} className={active === item.id ? 'active' : ''} aria-current={active === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)} onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? navigation.length - 1 : (index + (event.key === 'ArrowLeft' ? 1 : -1) + navigation.length) % navigation.length;
      const sibling = event.currentTarget.parentElement?.children[next];
      if (sibling instanceof HTMLButtonElement) sibling.focus();
    }}>
      {active === item.id && <motion.span className="nav-active-surface" layoutId="active-item" transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 39, mass: .8 }} />}
      <motion.span className="nav-glyph" animate={{ scale: active === item.id ? 1.06 : 1 }} transition={{ duration: reduced ? 0 : .16 }}><Icon name={item.icon} /></motion.span><span className="nav-label">{item.title}</span>
    </motion.button>)}
  </motion.nav></LayoutGroup><div className="home-indicator" /></div>;
}
