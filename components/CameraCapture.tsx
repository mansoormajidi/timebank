'use client';

import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';

type CaptureState = 'idle' | 'loading' | 'preview' | 'recording' | 'scanning' | 'processing' | 'review';

const VIDEO_MIME_TYPES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9,opus',
  'video/webm',
];

function createVideoRecorder(mediaStream: MediaStream) {
  for (const mimeType of VIDEO_MIME_TYPES) {
    if (!MediaRecorder.isTypeSupported(mimeType)) continue;
    try {
      return new MediaRecorder(mediaStream, { mimeType });
    } catch {
      // Some browsers report a MIME type as supported but reject it at construction.
    }
  }
  return new MediaRecorder(mediaStream);
}

export function CameraCapture({
  kind,
  onDone,
  onSkip,
}: {
  kind: 'photo' | 'video';
  onDone: (url: string) => void;
  onSkip?: () => void;
}) {
  const liveVideo = useRef<HTMLVideoElement>(null);
  const playbackVideo = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const alive = useRef(true);
  const pending = useRef(false);
  const objectUrl = useRef('');
  const recordedBlob = useRef<Blob | null>(null);
  const playbackFallbackTried = useRef(false);

  const [state, setState] = useState<CaptureState>('idle');
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [seconds, setSeconds] = useState(5);
  const [playing, setPlaying] = useState(false);

  function stopTracks() {
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (liveVideo.current) liveVideo.current.srcObject = null;
  }

  function clearTimers() {
    if (timer.current) clearInterval(timer.current);
    if (timeout.current) clearTimeout(timeout.current);
    timer.current = null;
    timeout.current = null;
  }

  function revokeObjectUrl() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = '';
  }

  function dispose() {
    clearTimers();
    const current = recorder.current;
    if (current) {
      current.onstop = null;
      current.ondataavailable = null;
      current.onerror = null;
      if (current.state !== 'inactive') current.stop();
      recorder.current = null;
    }
    stopTracks();
    revokeObjectUrl();
    recordedBlob.current = null;
  }

  useEffect(() => {
    alive.current = true;
    const onHide = () => {
      if (document.hidden && stream.current) {
        dispose();
        if (alive.current) {
          setState('idle');
          setUrl('');
          setError('دوربین هنگام خروج از صفحه خاموش شد. برای ادامه دوباره فعال کنید.');
        }
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      alive.current = false;
      dispose();
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  useEffect(() => {
    if (state !== 'review' || !url || !playbackVideo.current) return;
    playbackVideo.current.load();
  }, [state, url]);

  async function requestCamera() {
    if (pending.current) return;
    pending.current = true;
    setState('loading');
    setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      const next = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: kind === 'video' ? 'user' : 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: kind === 'video',
      });
      if (!alive.current || document.hidden) {
        next.getTracks().forEach(track => track.stop());
        if (alive.current) setState('idle');
        return;
      }
      stream.current = next;
      if (liveVideo.current) {
        liveVideo.current.srcObject = next;
        await liveVideo.current.play();
      }
      if (alive.current) setState('preview');
    } catch (captureError) {
      stopTracks();
      if (alive.current) {
        setState('idle');
        const name = captureError instanceof DOMException ? captureError.name : '';
        setError(
          name === 'NotFoundError'
            ? 'دوربین یا میکروفن متصل پیدا نشد.'
            : name === 'NotReadableError'
              ? 'دوربین در برنامهٔ دیگری مشغول است. آن برنامه را ببندید و دوباره تلاش کنید.'
              : 'دسترسی دوربین ممکن نشد. اجازهٔ دوربین و میکروفن را در تنظیمات مرورگر بررسی کنید.',
        );
      }
    } finally {
      pending.current = false;
    }
  }

  function photo() {
    const source = liveVideo.current;
    if (!source?.videoWidth) {
      setError('دوربین هنوز آماده نیست. چند لحظه دیگر امتحان کنید.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = source.videoWidth;
    canvas.height = source.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(source, 0, 0);
    const captured = canvas.toDataURL('image/jpeg', 0.85);
    setUrl(captured);
    stopTracks();
    setState('scanning');
    timeout.current = setTimeout(() => {
      if (alive.current) onDone(captured);
    }, 850);
  }

  function record() {
    if (!stream.current || recorder.current?.state === 'recording') return;
    try {
      if (typeof MediaRecorder === 'undefined') throw new Error('unsupported');
      const chunks: Blob[] = [];
      const next = createVideoRecorder(stream.current);
      recorder.current = next;
      playbackFallbackTried.current = false;
      setError('');

      next.ondataavailable = event => {
        if (event.data.size) chunks.push(event.data);
      };
      next.onerror = () => {
        dispose();
        if (alive.current) {
          setState('idle');
          setError('ضبط کامل نشد. دوباره تلاش کنید.');
        }
      };
      next.onstop = () => {
        clearTimers();
        stopTracks();
        recorder.current = null;
        if (!alive.current) return;
        setState('processing');

        const mimeType = chunks.find(chunk => chunk.type)?.type || next.mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: mimeType });
        if (!blob.size) {
          setState('idle');
          setError('ویدیو ذخیره نشد؛ دوباره ضبط کنید.');
          return;
        }

        recordedBlob.current = blob;
        revokeObjectUrl();
        const nextUrl = URL.createObjectURL(blob);
        objectUrl.current = nextUrl;
        setUrl(nextUrl);
        setPlaying(false);
        setState('review');
      };

      next.start(250);
      setSeconds(5);
      setState('recording');
      timer.current = setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
      timeout.current = setTimeout(() => {
        if (next.state === 'recording') next.stop();
      }, 5000);
    } catch {
      setError('ضبط ویدیو در این مرورگر پشتیبانی نمی‌شود. با یک مرورگر دارای MediaRecorder امتحان کنید.');
    }
  }

  function retry() {
    dispose();
    setUrl('');
    setPlaying(false);
    setState('idle');
    setError('');
  }

  function handlePlaybackError() {
    const blob = recordedBlob.current;
    if (blob && !playbackFallbackTried.current) {
      playbackFallbackTried.current = true;
      const baseType = blob.type.split(';')[0] || 'video/webm';
      const fallbackBlob = new Blob([blob], { type: baseType });
      recordedBlob.current = fallbackBlob;
      revokeObjectUrl();
      const fallbackUrl = URL.createObjectURL(fallbackBlob);
      objectUrl.current = fallbackUrl;
      setUrl(fallbackUrl);
      setError('');
      return;
    }
    setPlaying(false);
    setError('مرورگر نتوانست ویدیو را پخش کند. لطفاً یک‌بار دیگر ضبط کنید.');
  }

  async function togglePlayback() {
    const target = playbackVideo.current;
    if (!target) return;
    if (!target.paused) {
      target.pause();
      return;
    }
    try {
      if (target.ended) target.currentTime = 0;
      await target.play();
      setError('');
    } catch {
      setError('ویدیو هنوز آماده نیست؛ چند لحظه دیگر دوباره پخش را بزنید.');
    }
  }

  return (
    <div className="camera-capture">
      <div className={`camera-frame ${kind === 'video' ? 'selfie-frame' : ''}`}>
        {state === 'scanning' ? (
          <img src={url} alt="در حال اسکن پشت کارت" />
        ) : state === 'review' || state === 'processing' ? (
          <div className="camera-placeholder">
            <img src="/assets/selfie.svg" width="44" height="44" alt="" />
            <strong>{state === 'processing' ? 'در حال آماده‌سازی ویدیو…' : 'ضبط انجام شد'}</strong>
          </div>
        ) : (
          <video
            key="live-camera"
            ref={liveVideo}
            muted
            playsInline
            className={`${state === 'idle' || state === 'loading' ? 'is-off' : ''} ${kind === 'video' ? 'mirror-preview' : ''}`}
            aria-label={kind === 'photo' ? 'پیش‌نمایش دوربین پشت' : 'پیش‌نمایش دوربین سلفی'}
          />
        )}
        {state === 'scanning' && (
          <div className="scan-progress" role="status">
            در حال خواندن سریال کارت…<span />
          </div>
        )}
        {(state === 'idle' || state === 'loading') && (
          <div className="camera-placeholder">
            {kind === 'photo' ? <Icon name="card" size={40} /> : <img src="/assets/selfie.svg" width="44" height="44" alt="" />}
            <strong>{kind === 'photo' ? 'پشت کارت ملی' : 'ویدیوی سلفی'}</strong>
            <small>{state === 'loading' ? 'منتظر اجازهٔ دسترسی دوربین…' : 'دوربین فقط با لمس دکمه فعال می‌شود'}</small>
          </div>
        )}
        {kind === 'photo' && state === 'preview' && (
          <div className="card-scan-guide">
            <span>پشت کارت را در این محدوده قرار دهید</span>
          </div>
        )}
        {state === 'recording' && (
          <div className="record-badge" role="status">
            <i /> در حال ضبط · {seconds.toLocaleString('fa-IR')}
          </div>
        )}
      </div>

      {error && state !== 'review' && <p role="alert" className="camera-error">{error}</p>}

      <div className="button-stack camera-actions">
        {(state === 'idle' || state === 'loading') && (
          <button className="flow-button" disabled={state === 'loading'} onClick={requestCamera}>
            فعال کردن {kind === 'photo' ? 'دوربین' : 'دوربین و میکروفن'}
          </button>
        )}
        {state === 'preview' && (
          <button className="flow-button" onClick={kind === 'photo' ? photo : record}>
            {kind === 'photo' ? 'اسکن تصویر' : 'شروع ضبط ۵ ثانیه‌ای'}
          </button>
        )}
        {kind === 'photo' && onSkip && ['idle', 'loading', 'preview'].includes(state) && (
          <button className="flow-button secondary" onClick={onSkip}>کارت ملی ندارم</button>
        )}
      </div>

      {state === 'review' && (
        <BottomSheet className="video-review-sheet" title="ویدیوی شما مورد تأیید است؟" onBack={retry}>
          <video
            key={url}
            ref={playbackVideo}
            src={url}
            controls
            playsInline
            preload="metadata"
            className="recorded-video"
            aria-label="پیش‌نمایش ویدیوی سلفی"
            onLoadedMetadata={() => setError('')}
            onCanPlay={() => setError('')}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={handlePlaybackError}
          />
          <button className="text-button video-play-button" onClick={togglePlayback}>
            {playing ? 'توقف پخش' : 'پخش ویدیو'}
          </button>
          {error && <p role="alert" className="camera-error">{error}</p>}
          <div className="button-stack">
            <button className="flow-button" onClick={() => onDone(url)}>تأیید و ادامه</button>
            <button className="flow-button secondary" onClick={retry}>خیر، ضبط مجدد</button>
          </div>
        </BottomSheet>
      )}

      <p className="sheet-note">فایل فقط در حافظهٔ همین صفحه است و جایی ارسال نمی‌شود. با خروج از این فلو حذف می‌شود.</p>
    </div>
  );
}
