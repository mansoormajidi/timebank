const STORAGE_KEY = 'timebank-prototype-users-v1';
const demoUsers: Record<string, string> = {
  '1234567890': '09126464080',
  '0012345678': '09120004080',
};

function storedUsers(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([nationalId, mobile]) => /^\d{10}$/.test(nationalId) && typeof mobile === 'string' && /^09\d{9}$/.test(mobile)));
  } catch { return {}; }
}

export function findPrototypeMobile(nationalId: string) {
  return demoUsers[nationalId] || storedUsers()[nationalId] || '';
}

export function registerPrototypeUser(nationalId: string, mobile: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...storedUsers(), [nationalId]: mobile })); } catch {}
}
