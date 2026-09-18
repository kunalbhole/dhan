// AsyncStorage-persisted notification preferences — same hydrate/subscribe
// shape as the other stores this session. This persists what the user
// actually chose rather than always showing the reference's fixed
// defaults, but — like appLockStore.ts — there's no real push/local
// notification scheduling wired up in this app yet, so toggling one off
// stops nothing from actually firing. Honest preference storage, not a
// working notification pipeline.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-notification-prefs';

export type NotifId = 'bills' | 'budget' | 'weekly' | 'ai' | 'splits' | 'promos';

// Ported from settings-sub.jsx's NOTIF_DEFAULTS — sensible on/off starting
// points for a new install (a preference default, not a claim about real
// data, so seeding it is fine here unlike e.g. profileStore.ts's name).
const DEFAULTS: Record<NotifId, boolean> = {
  bills: true,
  budget: true,
  weekly: true,
  ai: false,
  splits: false,
  promos: false,
};

let prefs: Record<NotifId, boolean> = { ...DEFAULTS };
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

export function getNotificationPrefs(): Record<NotifId, boolean> {
  return prefs;
}

export function subscribeToNotificationPrefs(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setNotificationPref(id: NotifId, on: boolean): void {
  prefs = { ...prefs, [id]: on };
  notify();
  persist();
}
