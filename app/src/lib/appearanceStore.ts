// AsyncStorage-persisted appearance preference — same hydrate/subscribe
// shape as the other stores this session. This app's theme tokens
// (src/theme/index.ts) are a single flat light palette with no dark
// variant or re-theming logic, so selecting Dark persists a real choice
// but doesn't actually restyle anything yet — same honest scoping as
// languageStore.ts's selection not driving real translations.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-appearance';

export type AppearanceMode = 'System' | 'Light' | 'Dark';

let mode: AppearanceMode = 'System';
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, mode);
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw === 'System' || raw === 'Light' || raw === 'Dark') mode = raw;
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getAppearance(): AppearanceMode {
  return mode;
}

export function subscribeToAppearance(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAppearance(next: AppearanceMode): void {
  mode = next;
  notify();
  persist();
}
