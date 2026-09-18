// AsyncStorage-persisted set of disabled SMS senders — same hydrate/
// subscribe shape as the other stores this session. Unlike the reference
// (4 hardcoded bank rows, one pre-seeded "off"), there's no fixed bank
// list here: every sender is whichever real value showed up in a parsed
// transaction's `sender` column (see db.ts), and every sender starts
// enabled since it clearly was, to have produced a stored transaction at
// all. Disabling one is enforced for real in smsPipeline.ts — it isn't
// just a display toggle.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-sms-disabled-senders';

let disabled = new Set<string>();
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...disabled]));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          disabled = new Set(JSON.parse(raw));
        } catch {
          disabled = new Set();
        }
      }
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

// null/blank sender (shouldn't normally happen — every real bank SMS has
// one) is treated as enabled rather than unaddressable.
export function isSenderEnabled(sender: string | null | undefined): boolean {
  if (!sender) return true;
  return !disabled.has(sender);
}

export function getDisabledSenders(): Set<string> {
  return disabled;
}

export function subscribeToSmsSources(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSenderEnabled(sender: string, enabled: boolean): void {
  if (enabled) disabled.delete(sender);
  else disabled.add(sender);
  notify();
  persist();
}
