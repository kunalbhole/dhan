import type { StoredTransaction } from './db';

export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';

export const BACKUP_FREQUENCIES: { id: BackupFrequency; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'manual', label: 'Manual only' },
];

// Milliseconds between scheduled backups per frequency — used by
// backupScheduler.ts's foreground check. 'manual' never runs on its own.
export const FREQUENCY_INTERVAL_MS: Record<BackupFrequency, number | null> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  manual: null,
};

export interface BackupSettings {
  frequency: BackupFrequency;
  wifiOnly: boolean;
  lastBackupAt: number | null;
}

export type BackupStatus = 'idle' | 'running' | 'success' | 'error';

// What actually gets serialized, encrypted, and uploaded. Only real,
// persisted data — the session-only mock stores (billsStore.ts,
// friendsStore.ts) aren't real data sources yet, so there's nothing there
// worth backing up.
export interface BackupPayload {
  version: 1;
  createdAt: number;
  income: number | null;
  framework: string;
  transactions: StoredTransaction[];
}
