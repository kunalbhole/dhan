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

// The two onboarding choices HomeScreen's budget math is built on:
// monthly income (IncomeSetupScreen) and the budgeting framework
// (FrameworkScreen). Mirrors app.jsx's own localStorage keys
// ("dhan-income" doesn't exist there — the prototype never persists
// income at all — but "dhan-framework" does, so that key name is kept).
const INCOME_KEY = 'dhan-income';
const FRAMEWORK_KEY = 'dhan-framework';
export const DEFAULT_FRAMEWORK = '50-30-20';

export async function setMonthlyIncome(amount: number): Promise<void> {
  await AsyncStorage.setItem(INCOME_KEY, String(amount));
}

// null means "never set" — distinct from 0, which a user could genuinely
// enter. Callers decide how to render the not-yet-set case.
export async function getMonthlyIncome(): Promise<number | null> {
  const v = await AsyncStorage.getItem(INCOME_KEY);
  return v === null ? null : parseInt(v, 10);
}

export async function setFramework(id: string): Promise<void> {
  await AsyncStorage.setItem(FRAMEWORK_KEY, id);
}

export async function getFramework(): Promise<string> {
  const v = await AsyncStorage.getItem(FRAMEWORK_KEY);
  return v ?? DEFAULT_FRAMEWORK;
}

// Whether the user actually has (and is willing to grant) READ_CONTACTS —
// set from PermissionsScreen's real permission result, not just the
// toggle's on-screen state, so a later "is Contacts on?" read here matches
// what Android actually granted rather than what was requested.
const CONTACTS_KEY = 'dhan-contacts-enabled';

export async function setContactsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(CONTACTS_KEY, enabled ? '1' : '0');
}

export async function getContactsEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(CONTACTS_KEY);
  return v !== '0';
}

// A full local reset — sign-out clears these alongside the onboarded
// flag so a relaunch's onboarding starts genuinely fresh, not carrying
// over the previous account's income/framework.
export async function clearUserPrefs(): Promise<void> {
  await AsyncStorage.removeMany([INCOME_KEY, FRAMEWORK_KEY, CONTACTS_KEY]);
}
