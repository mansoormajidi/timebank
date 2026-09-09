'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type IssuedCardId = 'bronze' | 'gold' | 'silver';
export type CardIssuanceStatus = 'none' | 'tracking' | 'active';

export type CardIssuanceState = {
  status: CardIssuanceStatus;
  cardId: IssuedCardId;
  address: string;
  trackingCode: string;
  updatedAt: string;
};

export const cardChoices: { id: IssuedCardId; title: string; caption: string; number: string; image: string }[] = [
  { id: 'bronze', title: 'کارت کلاسیک', caption: 'طراحی گرم و رسمی', number: '۶۵۷۶ ۲۰۶۴ ۶۸۴۷ ۲۲۰۶', image: '/assets/cards/card-bronze.png' },
  { id: 'gold', title: 'کارت طلایی', caption: 'طراحی روشن و مینیمال', number: '۶۱۶۳ ۹۶۵۴ ۶۷۴۵ ۶۵۴۳', image: '/assets/cards/card-gold.png' },
  { id: 'silver', title: 'کارت نقره‌ای', caption: 'طراحی مدرن و خنثی', number: '۶۴۶۳ ۶۴۸۶ ۰۶۳۹ ۲۴۸۵', image: '/assets/cards/card-silver.png' },
];

const STORAGE_KEY = 'timebank-card-issuance-v1';
const initialState: CardIssuanceState = { status: 'none', cardId: 'bronze', address: '', trackingCode: '', updatedAt: '' };
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedState = initialState;

function isState(value: unknown): value is CardIssuanceState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return ['none', 'tracking', 'active'].includes(String(state.status))
    && ['bronze', 'gold', 'silver'].includes(String(state.cardId))
    && typeof state.address === 'string' && state.address.length < 1000
    && typeof state.trackingCode === 'string' && state.trackingCode.length < 40
    && typeof state.updatedAt === 'string' && state.updatedAt.length < 100;
}

function getSnapshot() {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const parsed: unknown = raw ? JSON.parse(raw) : initialState;
      cachedState = isState(parsed) ? parsed : initialState;
    }
  } catch { /* Keep the last valid in-memory state. */ }
  return cachedState;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) listener(); };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage); };
}

function save(next: CardIssuanceState) {
  cachedState = next;
  try {
    cachedRaw = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch { /* State remains available for this browser session. */ }
  listeners.forEach(listener => listener());
}

export function useCardIssuance() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => initialState);
  const requestCard = useCallback((cardId: IssuedCardId, address: string) => {
    const next: CardIssuanceState = {
      status: 'tracking',
      cardId,
      address,
      trackingCode: '۵۳۴۵۷۹',
      updatedAt: new Date().toLocaleString('fa-IR'),
    };
    save(next);
    return next;
  }, []);
  const activateCard = useCallback(() => {
    const current = getSnapshot();
    if (current.status !== 'tracking') return current;
    const next = { ...current, status: 'active' as const, updatedAt: new Date().toLocaleString('fa-IR') };
    save(next);
    return next;
  }, []);
  return { state, requestCard, activateCard };
}
