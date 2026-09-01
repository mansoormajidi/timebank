'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { AnimationItem } from 'lottie-web';
import faceId from '../public/assets/face-id-animation.json';
import biometric from '../public/assets/biometric-animation.json';

export function AuthAnimation({ kind }: { kind: 'face-id' | 'biometric' }) {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    let disposed = false;
    let animation: AnimationItem | undefined;
    const data = kind === 'face-id' ? faceId : biometric;
    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (disposed || !container.current) return;
      animation = lottie.loadAnimation({ container: container.current, renderer: 'svg', loop: !reduced, autoplay: !reduced, animationData: structuredClone(data) });
      if (reduced) animation.goToAndStop(Math.floor(data.op / 2), true);
    });
    return () => { disposed = true; animation?.destroy(); };
  }, [kind, reduced]);
  return <div ref={container} className={`auth-animation ${kind}-animation`} role="img" aria-label={kind === 'face-id' ? 'انیمیشن Face ID' : 'انیمیشن ورود بیومتریک'} />;
}
