'use client';
// Demo-only, in-memory codes. No banking secret or credential is persisted.
export type CardOtp = { code: string; expiresAt: number; seconds: number };
let current: CardOtp | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function refresh() {
  const now = Date.now();
  if (!current || now >= current.expiresAt) {
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    let code = String(100000 + random % 900000);
    if (code === current?.code) code = String(100000 + (Number(code) - 99999) % 900000);
    current = { code, expiresAt: now + 30000, seconds: 30 };
  } else {
    const seconds = Math.ceil((current.expiresAt - now) / 1000);
    if (seconds === current.seconds) return;
    current = { ...current, seconds };
  }
  listeners.forEach(listener => listener());
}

export function subscribeCardOtp(listener: () => void) {
  listeners.add(listener);
  if (!timer) timer = setInterval(refresh, 200);
  refresh();
  return () => { listeners.delete(listener); if (!listeners.size) { clearInterval(timer); timer = undefined; } };
}
export const getCardOtp = () => current;
export const getServerCardOtp = () => null;
export function isValidCardOtp(code: string) { return !!current && current.code === code && Date.now() < current.expiresAt; }
