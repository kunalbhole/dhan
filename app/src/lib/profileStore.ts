// AsyncStorage-persisted profile fields — same hydrate/subscribe/notify
// shape as billsStore.ts/goalsStore.ts. Unlike the reference's
// ProfileEditScreen (which seeds every field with a hardcoded sample
// value), nothing here is onboarding-collected except the name typed at
// sign-up (see SignUpScreen.tsx's confirmCode, which persists it here) —
// every other field starts blank until the user actually fills it in.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-profile';

export interface Profile {
  name: string;
  email: string;
  dob: string;
  city: string;
}

const EMPTY: Profile = { name: '', email: '', dob: '', city: '' };

let profile: Profile = { ...EMPTY };
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          profile = { ...EMPTY, ...JSON.parse(raw) };
        } catch {
          profile = { ...EMPTY };
        }
      }
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getProfile(): Profile {
  return profile;
}

export function subscribeToProfile(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setProfileField<K extends keyof Profile>(key: K, value: Profile[K]): void {
  if (profile[key] === value) return;
  profile = { ...profile, [key]: value };
  notify();
  persist();
}

// Only called once, from SignUpScreen's confirmCode — the one field the
// app's own onboarding flow actually collects for real.
export async function setProfileNameIfEmpty(name: string): Promise<void> {
  await hydrate();
  if (profile.name) return;
  setProfileField('name', name);
}
