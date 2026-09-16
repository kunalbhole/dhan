import AsyncStorage from '@react-native-async-storage/async-storage';

// RN equivalent of app.jsx's `localStorage.getItem("dhan-onboarded") === "1"`
// / `hasAccount()`. AsyncStorage is async (unlike localStorage), so callers
// await `hasAccount()` instead of reading it synchronously.
const ONBOARDED_KEY = 'dhan-onboarded';

export async function hasAccount(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ONBOARDED_KEY);
  return v === '1';
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, '1');
}

export async function clearOnboarded(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDED_KEY);
}
