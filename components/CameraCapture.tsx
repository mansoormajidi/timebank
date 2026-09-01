'use client';
import { useEffect, useRef, useState } from 'react';
import fixWebmDuration from 'fix-webm-duration';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
export function CameraCapture({ kind, onDone, onSkip }: { kind: 'photo'|'video'; onDone: (url: string) => void; onSkip?: () => void }) {
  const video = useRef<HTMLVideoElement>(null); const playback = useRef<HTMLVideoElement>(null); const startedAt = useRef(0); const revision = useRef(0);
  const [playing,setPlaying] = useState(false);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const alive = useRef(true); const pending = useRef(false); const objectUrl = useRef('');
  const [state, setState] = useState<'idle'|'loading'|'preview'|'recording'|'scanning'|'processing'|'review'>('idle');
  const [error, setError] = useState(''); const [url, setUrl] = useState(''); const [seconds, setSeconds] = useState(5);
  function stopTracks() { stream.current?.getTracks().forEach(t => t.stop()); stream.current = null; if (video.current) video.current.srcObject = null; }
  function clearTimers() { if (timer.current) clearInterval(timer.current); if (timeout.current) clearTimeout(timeout.current); timer.current = null; timeout.current = null; }
  function dispose() { revision.current++; clearTimers(); const current = recorder.current; if (current) { current.onstop = null; current.ondataavailable = null; if (current.state !== 'inactive') current.stop(); recorder.current = null; } stopTracks(); if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); objectUrl.current = ''; }
  useEffect(() => { alive.current = true; const onHide = () => { if (document.hidden && stream.current) { dispose(); if (alive.current) { setState('idle'); setUrl(''); setError('دوربین هنگام خروج از صفحه خاموش شد. برای ادامه دوباره فعال کنید.'); } } }; document.addEventListener('visibilitychange', onHide); return () => { alive.current = false; dispose(); document.removeEventListener('visibilitychange', onHide); }; }, []);
  async function requestCamera() {
    if (pending.current) return; pending.current = true; setState('loading'); setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: kind === 'video' ? 'user' : 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: kind === 'video' });
      if (!alive.current || document.hidden) { next.getTracks().forEach(t => t.stop()); if (alive.current) setState('idle'); return; }
      stream.current = next;
      if (video.current) { video.current.srcObject = next; await video.current.play(); }
      if (alive.current) setState('preview');
    } catch (e) { stopTracks(); if (alive.current) { setState('idle'); const name = e instanceof DOMException ? e.name : ''; setError(name === 'NotFoundError' ? 'دوربین یا میکروفن متصل پیدا نشد.' : name === 'NotReadableError' ? 'دوربین در برنامهٔ دیگری مشغول است. آن برنامه را ببندید و دوباره تلاش کنید.' : 'دسترسی دوربین ممکن نشد. اجازهٔ دوربین و میکروفن را در تنظیمات مرورگر بررسی کنید.'); } }
    finally { pending.current = false; }
  }
  function photo() {
    const source = video.current; if (!source?.videoWidth) { setError('دوربین هنوز آماده نیست. چند لحظه دیگر امتحان کنید.'); return; }
    const canvas = document.createElement('canvas'); canvas.width = source.videoWidth; canvas.height = source.videoHeight; const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.drawImage(source, 0, 0); const captured = canvas.toDataURL('image/jpeg', .85); setUrl(captured); stopTracks(); setState('scanning'); timeout.current=setTimeout(()=>{if(alive.current)onDone(captured);},850);
  }
  function record() {
    if (!stream.current || recorder.current?.state === 'recording') return;
    try {
      if (typeof MediaRecorder === 'undefined') throw new Error('unsupported');
      const mimeType = ['video/webm;codecs=vp8,opus','video/mp4','video/webm'].find(t => MediaRecorder.isTypeSupported(t));
      const chunks: Blob[] = []; const next = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined); recorder.current = next;
      next.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      next.onerror = () => { dispose(); if (alive.current) { setState('idle'); setError('ضبط کامل نشد. دوباره تلاش کنید.'); } };
      next.onstop = async () => { const requestRevision=revision.current; clearTimers(); const duration=performance.now()-startedAt.current; stopTracks(); if(!alive.current)return; setState('processing'); try { let blob=new Blob(chunks,{type:next.mimeType}); if(!blob.size)throw new Error('Empty recording'); if(next.mimeType.includes('webm'))blob=await fixWebmDuration(blob,duration,{logger:false}); if(!alive.current || requestRevision!==revision.current)return; const nextUrl=URL.createObjectURL(blob);objectUrl.current=nextUrl;setUrl(nextUrl);setState('review'); }catch{if(alive.current){setState('idle');setError('ویدیو ذخیره نشد؛ دوباره ضبط کنید.');}} };
      startedAt.current=performance.now(); next.start(200); setSeconds(5); setState('recording'); timer.current = setInterval(() => setSeconds(s => Math.max(0,s-1)), 1000); timeout.current = setTimeout(() => { if (next.state === 'recording') next.stop(); }, 5000);
    } catch { setError('ضبط ویدیو در این مرورگر پشتیبانی نمی‌شود. با یک مرورگر دارای MediaRecorder امتحان کنید.'); }
  }
  function retry() { dispose(); setUrl(''); setState('idle'); setError(''); }
  return <div className="camera-capture"><div className={`camera-frame ${kind === 'video' ? 'selfie-frame' : ''}`}>
    {state === 'scanning' ? <img src={url} alt="در حال اسکن پشت کارت" /> : state === 'review' || state === 'processing' ? <div className="camera-placeholder"><img src="/assets/selfie.svg" width="44" height="44" alt="" /><strong>{state === 'processing' ? 'در حال آماده‌سازی ویدیو…' : 'ضبط انجام شد'}</strong></div> : <video key="live-camera" ref={video} muted playsInline className={`${state === 'idle' || state === 'loading' ? 'is-off' : ''} ${kind === 'video' ? 'mirror-preview' : ''}`} aria-label={kind === 'photo' ? 'پیش‌نمایش دوربین پشت' : 'پیش‌نمایش دوربین سلفی'} />}
    {state === 'scanning' && <div className="scan-progress" role="status">در حال خواندن سریال کارت…<span /></div>}
    {(state === 'idle' || state === 'loading') && <div className="camera-placeholder">{kind === 'photo' ? <Icon name="card" size={40} /> : <img src="/assets/selfie.svg" width="44" height="44" alt="" />}<strong>{kind === 'photo' ? 'پشت کارت ملی' : 'ویدیوی سلفی'}</strong><small>{state === 'loading' ? 'منتظر اجازهٔ دسترسی دوربین…' : 'دوربین فقط با لمس دکمه فعال می‌شود'}</small></div>}
    {kind === 'photo' && state === 'preview' && <div className="card-scan-guide"><span>پشت کارت را در این محدوده قرار دهید</span></div>}
    {state === 'recording' && <div className="record-badge" role="status"><i /> در حال ضبط · {seconds.toLocaleString('fa-IR')}</div>}
    </div>{error && <p role="alert" className="camera-error">{error}</p>}
    <div className="button-stack camera-actions">{(state === 'idle' || state === 'loading') && <button className="flow-button" disabled={state === 'loading'} onClick={requestCamera}>فعال کردن {kind === 'photo' ? 'دوربین' : 'دوربین و میکروفن'}</button>}
    {state === 'preview' && <button className="flow-button" onClick={kind === 'photo' ? photo : record}>{kind === 'photo' ? 'اسکن تصویر' : 'شروع ضبط ۵ ثانیه‌ای'}</button>}{kind === 'photo' && onSkip && ['idle','loading','preview'].includes(state) && <button className="flow-button secondary" onClick={onSkip}>کارت ملی ندارم</button>}</div>
    {state === 'review' && <BottomSheet className="video-review-sheet" title="ویدیوی شما مورد تأیید است؟" onBack={retry}><video key={url} ref={playback} src={url} controls playsInline preload="auto" className="recorded-video" aria-label="پیش‌نمایش ویدیوی سلفی" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError('پخش ویدیو ممکن نشد. دوباره ضبط کنید.')} /><button className="text-button video-play-button" onClick={async()=>{if(playing)playback.current?.pause();else try{await playback.current?.play();}catch{setError('برای پخش دوباره دکمه را بزنید.');}}}>{playing?'توقف پخش':'پخش ویدیو'}</button>{error&&<p role="alert" className="camera-error">{error}</p>}<div className="button-stack"><button className="flow-button" onClick={()=>onDone(url)}>تأیید و ادامه</button><button className="flow-button secondary" onClick={retry}>خیر، ضبط مجدد</button></div></BottomSheet>}
    <p className="sheet-note">فایل فقط در حافظهٔ همین صفحه است و جایی ارسال نمی‌شود. با خروج از این فلو حذف می‌شود.</p>
  </div>;
}
