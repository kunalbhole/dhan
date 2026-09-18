// AsyncStorage-persisted privacy preferences — same hydrate/subscribe
// shape as the other stores this session. "Encrypted cloud backup" isn't
// here — it's the real backupSettings.ts frequency setting (see
// PrivacySettingsScreen.tsx), not a separate flag, so the two screens
// can't disagree about whether backup is on. Analytics/personalised tips
// have no real system behind them to gate (no analytics SDK is wired up
// in this app), and "require unlock for exports" has the same honest
// status as appLockStore.ts — persisted, not yet enforced.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-privacy-prefs';

export interface PrivacyPrefs {
  analytics: boolean;
  personalTips: boolean;
  requireUnlockForExports: boolean;
}

const DEFAULTS: PrivacyPrefs = { analytics: false, personalTips: true, requireUnlockForExports: true };

let prefs: PrivacyPrefs = { ...DEFAULTS };
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          prefs = { ...DEFAULTS, ...JSON.parse(raw) };
        } catch {
          prefs = { ...DEFAULTS };
        }
      }
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getPrivacyPrefs(): PrivacyPrefs {
  return prefs;
}

export function subscribeToPrivacyPrefs(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPrivacyPref<K extends keyof PrivacyPrefs>(key: K, value: PrivacyPrefs[K]): void {
  prefs = { ...prefs, [key]: value };
  notify();
  persist();
}
