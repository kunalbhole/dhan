// One-time trigger for Stage 2 item 8: the first time the app runs after
// the dedup/type rules rework, old transactions (parsed under the old,
// buggier rules) are backed up and cleared, then re-derived from full SMS
// history under the new rules. Runs at most once per install — the flag
// below is only ever set after a successful backup+clear.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backupAndClearTransactionsSync } from './db';
import { resetHistoryScan } from './historyScanner';

const MIGRATION_FLAG_KEY = 'dhan-rules-v2-migrated';

export async function isRulesMigrationNeeded(): Promise<boolean> {
  const done = await AsyncStorage.getItem(MIGRATION_FLAG_KEY);
  return done !== '1';
}

export async function runRulesMigration(): Promise<void> {
  backupAndClearTransactionsSync();
  await resetHistoryScan();
  await AsyncStorage.setItem(MIGRATION_FLAG_KEY, '1');
}
