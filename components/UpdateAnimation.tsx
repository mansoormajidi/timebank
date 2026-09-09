'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { AnimationItem } from 'lottie-web';
import animationData from '../public/assets/update-animation.json';

export function UpdateAnimation() {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    let disposed = false;
    let animation: AnimationItem | undefined;
    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (disposed || !container.current) return;
      animation = lottie.loadAnimation({ container: container.current, renderer: 'svg', loop: !reduced, autoplay: !reduced, animationData: structuredClone(animationData) });
      if (reduced) animation.goToAndStop(Math.floor(animationData.op / 2), true);
    });
    return () => { disposed = true; animation?.destroy(); };
  }, [reduced]);
  return <div className="update-lottie" ref={container} role="img" aria-label="انیمیشن بررسی نسخه" />;
}
