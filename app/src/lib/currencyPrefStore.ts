// AsyncStorage-persisted active-currency set — ported from settings-sub.jsx's
// CurrencyScreen local state. Free tier is pinned to a single currency
// (INR); Dhan Plus (planStore.ts) allows several active at once, same
// free/paid split as the reference. No multi-currency budgets/transactions
// feature actually reads this yet, so — like appLockStore.ts — it's a
// real, persisted preference rather than one wired into live behavior
// elsewhere in the app.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-active-currencies';

export type CurrencyCode = 'INR' | 'USD' | 'AED' | 'GBP';

let active = new Set<CurrencyCode>(['INR']);
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...active]));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) active = new Set(parsed);
        } catch {
          active = new Set(['INR']);
        }
      }
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getActiveCurrencies(): Set<CurrencyCode> {
  return active;
}

export function subscribeToCurrencyPrefs(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Plus-tier multi-select toggle — never lets the set go empty.
export function toggleCurrency(id: CurrencyCode): void {
  const next = new Set(active);
  if (id === 'INR' && next.has('INR') && next.size === 1) return;
  if (next.has(id)) next.delete(id);
  else next.add(id);
  if (next.size === 0) next.add('INR');
  active = next;
  notify();
  persist();
}

// Free-tier single-select.
export function setSingleCurrency(id: CurrencyCode): void {
  active = new Set([id]);
  notify();
  persist();
}
