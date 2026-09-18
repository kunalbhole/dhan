import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-app-lock';

export type LockMethod = 'faceid' | 'fingerprint' | 'pin';

export interface AppLockSettings {
  enabled: boolean;
  method: LockMethod;
}

const DEFAULT: AppLockSettings = { enabled: false, method: 'faceid' };

let settings: AppLockSettings = { ...DEFAULT };
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          settings = { ...DEFAULT, ...JSON.parse(raw) };
        } catch {
          settings = { ...DEFAULT };
        }
      }
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getAppLockSettings(): AppLockSettings {
  return settings;
}

export function subscribeToAppLock(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAppLockEnabled(enabled: boolean): void {
  settings = { ...settings, enabled };
  notify();
  persist();
}

export function setAppLockMethod(method: LockMethod): void {
  settings = { ...settings, method };
  notify();
  persist();
}
