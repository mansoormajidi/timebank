'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { AnimationItem } from 'lottie-web';
import animationData from './animations/user-authentication.json';

export function IdentityAnimation({ className = '' }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let disposed = false;
    let animation: AnimationItem | undefined;
    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (disposed || !container.current) return;
      animation = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: !reduced,
        autoplay: !reduced,
        animationData: structuredClone(animationData),
      });
      if (reduced) animation.goToAndStop(animationData.op - 1, true);
    });
    return () => { disposed = true; animation?.destroy(); };
  }, [reduced]);

  return <div ref={container} className={`identity-auth-lottie ${className}`} role="img" aria-label="انیمیشن احراز هویت" />;
}
