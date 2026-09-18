// AsyncStorage-persisted Dhan Plus membership flag — promoted out of
// SettingsScreen's own local useState (which reset on every relaunch)
// since CurrencyScreen also needs to read it for its Plus-gated rows.
// There's no real payment/subscription backend behind this yet — same
// honest-preference status as appLockStore.ts — but the reference's own
// "Upgrade to Dhan Plus" tap toggles this for a demo, and now every
// screen that gates on it sees the same real, persisted value.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-is-plus';

let isPlus = false;
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, isPlus ? '1' : '0');
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      isPlus = raw === '1';
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getIsPlus(): boolean {
  return isPlus;
}

export function subscribeToPlan(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setIsPlus(value: boolean): void {
  isPlus = value;
  notify();
  persist();
}
