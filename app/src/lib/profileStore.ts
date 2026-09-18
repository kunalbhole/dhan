import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-profile';

export interface Profile {
  name: string;
  email: string;
  dob: string;
  city: string;
  avatarUri?: string | null;
}

const EMPTY: Profile = { name: '', email: '', dob: '', city: '', avatarUri: null };

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

export function setAvatarUri(uri: string | null): void {
  profile = { ...profile, avatarUri: uri };
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
