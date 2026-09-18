// Orchestrates a full backup or restore cycle — the one place that ties
// together real local data (db.ts, account.ts), the account-derived key
// (backupCrypto.ts), and the Drive REST calls (driveClient.ts). On-device
// data is always the source of truth: runBackup() only ever reads local
// state and writes to Drive, restoreFromDrive() only ever reads from Drive
// and writes to local state — this file never merges the two.
import { getAllTransactions, restoreTransactions } from './db';
import { getMonthlyIncome, getFramework, setMonthlyIncome, setFramework, setOnboarded } from './account';
import { encryptBackup, decryptBackup, BackupDecryptError } from './backupCrypto';
import { findBackupFile, uploadBackupFile, downloadBackupFile } from './driveClient';
import { getDriveAccessToken, type DriveAccount } from './driveAuth';
import { setLastBackupAt } from './backupSettings';
import type { BackupPayload } from './backupTypes';

async function buildBackupPayload(): Promise<BackupPayload> {
  const [income, framework, transactions] = await Promise.all([
    getMonthlyIncome(),
    getFramework(),
    getAllTransactions(),
  ]);
  return { version: 1, createdAt: Date.now(), income, framework, transactions };
}

// Real state → encrypted upload. Called both by the manual "Back up now"
// button and by backupScheduler.ts's silent foreground check.
export async function runBackup(account: DriveAccount): Promise<void> {
  const payload = await buildBackupPayload();
  const encrypted = encryptBackup(JSON.stringify(payload), account.id);
  const accessToken = await getDriveAccessToken();
  const existingFileId = await findBackupFile(accessToken);
  await uploadBackupFile(encrypted, existingFileId, accessToken);
  await setLastBackupAt(Date.now());
}

export type RestoreResult =
  | { status: 'restored'; transactionCount: number }
  | { status: 'no-backup-found' };

// Only ever called against a fresh install (RestorePromptScreen, gated on
// hasAccount() === false) — never against a live user's existing data, so
// there's no merge/conflict handling here by design.
export async function restoreFromDrive(account: DriveAccount): Promise<RestoreResult> {
  const accessToken = await getDriveAccessToken();
  const fileId = await findBackupFile(accessToken);
  if (!fileId) return { status: 'no-backup-found' };

  const encrypted = await downloadBackupFile(fileId, accessToken);
  const json = decryptBackup(encrypted, account.id);
  const payload = JSON.parse(json) as BackupPayload;

  const inserted = await restoreTransactions(payload.transactions);
  if (payload.income !== null) await setMonthlyIncome(payload.income);
  await setFramework(payload.framework);
  await setOnboarded();

  return { status: 'restored', transactionCount: inserted };
}

export { BackupDecryptError };
