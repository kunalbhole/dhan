import AsyncStorage from '@react-native-async-storage/async-storage';

// RN equivalent of screens-search.jsx's localStorage-backed recents
// (same key, same 5-item cap) — AsyncStorage is async, so callers await
// these instead of reading/writing localStorage synchronously.
const RECENTS_KEY = 'dhan.search.recents.v1';
const MAX_RECENTS = 5;

export async function getSearchRecents(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENTS) : [];
  } catch {
    return [];
  }
}

export async function saveSearchRecents(recents: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
  } catch {
    // best-effort, same as the reference's try/catch around localStorage
  }
}

export async function clearSearchRecents(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENTS_KEY);
  } catch {
    // best-effort
  }
}
