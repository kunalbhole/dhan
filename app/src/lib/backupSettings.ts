// AsyncStorage-backed backup preferences, plus a session-only
// subscribe/notify layer (mirroring src/lib/billsStore.ts's pattern) so
// BackupSettingsScreen reflects a running/just-finished backup live
// without prop-drilling a callback around.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BackupFrequency, BackupSettings, BackupStatus } from './backupTypes';

const FREQUENCY_KEY = 'dhan-backup-frequency';
const WIFI_ONLY_KEY = 'dhan-backup-wifi-only';
const LAST_BACKUP_AT_KEY = 'dhan-backup-last-at';

export async function getBackupSettings(): Promise<BackupSettings> {
  const [frequency, wifiOnly, lastBackupAt] = await Promise.all([
    AsyncStorage.getItem(FREQUENCY_KEY),
    AsyncStorage.getItem(WIFI_ONLY_KEY),
    AsyncStorage.getItem(LAST_BACKUP_AT_KEY),
  ]);
  return {
    frequency: (frequency as BackupFrequency | null) ?? 'weekly',
    wifiOnly: wifiOnly === null ? true : wifiOnly === '1',
    lastBackupAt: lastBackupAt === null ? null : parseInt(lastBackupAt, 10),
  };
}

export async function setBackupFrequency(frequency: BackupFrequency): Promise<void> {
  await AsyncStorage.setItem(FREQUENCY_KEY, frequency);
}

export async function setBackupWifiOnly(wifiOnly: boolean): Promise<void> {
  await AsyncStorage.setItem(WIFI_ONLY_KEY, wifiOnly ? '1' : '0');
}

export async function setLastBackupAt(timestamp: number): Promise<void> {
  await AsyncStorage.setItem(LAST_BACKUP_AT_KEY, String(timestamp));
}

// Session-only — deliberately not persisted. A "running" state from a
// backup interrupted by an app kill shouldn't survive as stuck state on
// next launch.
let status: BackupStatus = 'idle';
let statusMessage: string | null = null;
type Listener = () => void;
const listeners = new Set<Listener>();

export function getBackupStatus(): { status: BackupStatus; message: string | null } {
  return { status, message: statusMessage };
}

export function setBackupStatus(next: BackupStatus, message: string | null = null): void {
  status = next;
  statusMessage = message;
  listeners.forEach(l => l());
}

export function subscribeToBackupStatus(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
