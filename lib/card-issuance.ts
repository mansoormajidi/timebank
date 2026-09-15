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

const STORAGE_KEY_PREFIX = 'timebank-card-issuance-v3';
const initialState: CardIssuanceState = { status: 'none', cardId: 'bronze', address: '', trackingCode: '', updatedAt: '' };
const listeners = new Map<string, Set<() => void>>();
const cachedRaw = new Map<string, string | null>();
const cachedState = new Map<string, CardIssuanceState>();

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId || 'signed-out'}`;
}

function isState(value: unknown): value is CardIssuanceState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return ['none', 'tracking', 'active'].includes(String(state.status))
    && ['bronze', 'gold', 'silver'].includes(String(state.cardId))
    && typeof state.address === 'string' && state.address.length < 1000
    && typeof state.trackingCode === 'string' && state.trackingCode.length < 40
    && typeof state.updatedAt === 'string' && state.updatedAt.length < 100;
}

function getSnapshot(key: string) {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== cachedRaw.get(key)) {
      cachedRaw.set(key, raw);
      const parsed: unknown = raw ? JSON.parse(raw) : initialState;
      cachedState.set(key, isState(parsed) ? parsed : initialState);
    }
  } catch { /* Keep the last valid in-memory state. */ }
  return cachedState.get(key) || initialState;
}

function subscribe(key: string, listener: () => void) {
  const keyListeners = listeners.get(key) || new Set<() => void>();
  keyListeners.add(listener);
  listeners.set(key, keyListeners);
  const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) listener(); };
  window.addEventListener('storage', onStorage);
  return () => {
    keyListeners.delete(listener);
    if (!keyListeners.size) listeners.delete(key);
    window.removeEventListener('storage', onStorage);
  };
}

function save(key: string, next: CardIssuanceState) {
  cachedState.set(key, next);
  try {
    const raw = JSON.stringify(next);
    cachedRaw.set(key, raw);
    localStorage.setItem(key, raw);
  } catch { /* State remains available for this browser session. */ }
  listeners.get(key)?.forEach(listener => listener());
}

export function useCardIssuance(userId: string) {
  const key = storageKey(userId);
  const subscribeToUser = useCallback((listener: () => void) => subscribe(key, listener), [key]);
  const getUserSnapshot = useCallback(() => getSnapshot(key), [key]);
  const state = useSyncExternalStore(subscribeToUser, getUserSnapshot, () => initialState);
  const requestCard = useCallback((cardId: IssuedCardId, address: string) => {
    const next: CardIssuanceState = {
      status: 'tracking',
      cardId,
      address,
      trackingCode: '۵۳۴۵۷۹',
      updatedAt: new Date().toLocaleString('fa-IR'),
    };
    save(key, next);
    return next;
  }, [key]);
  const activateCard = useCallback(() => {
    const current = getSnapshot(key);
    if (current.status !== 'tracking') return current;
    const next = { ...current, status: 'active' as const, updatedAt: new Date().toLocaleString('fa-IR') };
    save(key, next);
    return next;
  }, [key]);
  return { state, requestCard, activateCard };
}
