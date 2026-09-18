// AsyncStorage-persisted language preference — same hydrate/subscribe
// shape as the other stores this session. This app has no i18n system at
// all (every screen's strings are hardcoded English), so selecting
// Hindi here persists a real choice but doesn't actually translate
// anything yet — same honest scoping as appLockStore.ts's lock
// preference not yet gating a real screen.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-language';

export type LanguageId = 'en' | 'hi' | 'mr' | 'ta';

let language: LanguageId = 'en';
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, language);
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw === 'en' || raw === 'hi' || raw === 'mr' || raw === 'ta') language = raw;
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getLanguage(): LanguageId {
  return language;
}

export function subscribeToLanguage(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setLanguage(id: LanguageId): void {
  language = id;
  notify();
  persist();
}
