'use client';
import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { StatusBar } from './FlowShell';
export function SplashScreen({ animateEntrance = false, onFinished }: { animateEntrance?: boolean; onFinished?: () => void }) {
  const reduced = useReducedMotion(); const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const notified = useRef(false); const finish = useRef(onFinished);
  useEffect(() => { finish.current=onFinished; },[onFinished]);
  useEffect(() => () => { if(timer.current)clearTimeout(timer.current); },[]);
  function ready() { if(notified.current || !animateEntrance)return; notified.current=true; timer.current=setTimeout(()=>finish.current?.(),1000); }
  const transition={type:'spring' as const,stiffness:105,damping:22,mass:1.05};
  const initial=animateEntrance && !reduced;
  return <div className="splash-screen" aria-label="اسپلش تایم‌بانک"><StatusBar />
    <motion.img className="splash-orbits" src="/assets/auth-background.svg" alt="نشان تایم‌بانک" initial={initial?{scale:.68,y:-180,filter:'blur(16px)',opacity:0}:false} animate={{scale:1,y:0,filter:'blur(0px)',opacity:1}} transition={transition} />
    <div className="splash-copy"><motion.img className="splash-wordmark" src="/assets/splash-wordmark.svg" alt="تایم، اعتمادی هوشمند" initial={initial?{y:130,opacity:0,filter:'blur(12px)'}:false} animate={{y:0,opacity:1,filter:'blur(0px)'}} transition={{...transition,delay:initial?.13:0}} />
      <motion.div initial={initial?{y:180,opacity:0,filter:'blur(12px)'}:{y:0,opacity:animateEntrance?0:1,filter:'blur(0px)'}} animate={{y:0,opacity:1,filter:'blur(0px)'}} transition={reduced?{duration:0}:{...transition,delay:initial?.24:0}} onAnimationComplete={ready}><h1>به تایم‌بانک خوش آمدید</h1><p>دسترسی به خدمات مالی و غیرمالی سازمان اوقاف<br />در یک اپلیکیشن</p></motion.div>
    </div></div>;
}
