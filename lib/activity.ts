'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { activities as seedActivities } from './demo';
import { icons, type IconName } from '../components/Icon';

export type Activity = { id: string; title: string; subtitle: string; value: string; icon: IconName; pending?: boolean; details?: [string, string][] };
export type ActivityEvent = Omit<Activity, 'id' | 'subtitle'> & { id?: string };
const KEY = 'timebank-demo-activities-v1';
const listeners = new Set<() => void>();
let lastRaw: string | null | undefined;
let cached: Activity[] = seedActivities;

function isActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return ['id', 'title', 'subtitle', 'value'].every(key => typeof a[key] === 'string' && (a[key] as string).length < 1000)
    && typeof a.icon === 'string' && Object.hasOwn(icons, a.icon)
    && (a.pending === undefined || typeof a.pending === 'boolean')
    && (!a.details || Array.isArray(a.details) && a.details.every(row => Array.isArray(row) && row.length === 2 && row.every(cell => typeof cell === 'string' && cell.length < 1000)));
}

function getSnapshot(): Activity[] {
  if (typeof window === 'undefined') return seedActivities;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== lastRaw) {
      lastRaw = raw;
      const data: unknown = raw ? JSON.parse(raw) : [];
      const valid = Array.isArray(data) ? data.filter(isActivity).filter(item => item.id !== 'new-card').slice(0, 60) : [];
      cached = valid.length ? valid : seedActivities;
    }
  } catch { /* Keep the in-memory ledger if storage is unavailable. */ }
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) listener(); };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage); };
}

export function useActivityLog() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => seedActivities);
  const record = useCallback((event: ActivityEvent) => {
    const item: Activity = { ...event, id: event.id || crypto.randomUUID(), subtitle: new Date().toLocaleString('fa-IR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) };
    const previous = getSnapshot();
    if (previous.some(a => a.id === item.id)) return;
    cached = [item, ...previous].slice(0, 60);
    try {
      const raw = JSON.stringify(cached);
      localStorage.setItem(KEY, raw);
      lastRaw = raw;
    } catch { /* The completed action remains visible for this session. */ }
    listeners.forEach(listener => listener());
  }, []);
  return { items, record };
}
