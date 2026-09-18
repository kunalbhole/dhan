// Checked on every app-foreground transition (App.tsx's AppState listener)
// rather than run as a true OS-level background task — simpler, no new
// native scheduling infrastructure, and "periodic" only has to mean "close
// to on schedule for anyone who opens the app now and then," not a
// guarantee while the app is never opened.
//
// Silent by design: this path never shows a toast or any UI, on success or
// failure — only the manual "Back up now" button in BackupSettingsScreen
// surfaces feedback, so an automatic background action never interrupts
// the user with something they didn't ask for.
import NetInfo from '@react-native-community/netinfo';
import { signInSilentlyToGoogle } from './driveAuth';
import { runBackup } from './backupService';
import { getBackupSettings, setBackupStatus } from './backupSettings';
import { FREQUENCY_INTERVAL_MS } from './backupTypes';

let checking = false;

export async function maybeRunScheduledBackup(): Promise<void> {
  if (checking) return;
  checking = true;
  try {
    const settings = await getBackupSettings();
    const intervalMs = FREQUENCY_INTERVAL_MS[settings.frequency];
    if (intervalMs === null) return; // manual-only

    const due = settings.lastBackupAt === null || Date.now() - settings.lastBackupAt >= intervalMs;
    if (!due) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return;
    if (settings.wifiOnly && netState.type !== 'wifi') return;

    // Never prompts — if there's no resumable Google session, this quietly
    // skips rather than interrupting the user with a sign-in screen they
    // didn't ask for right now.
    const account = await signInSilentlyToGoogle();
    if (!account) return;

    setBackupStatus('running');
    await runBackup(account);
    setBackupStatus('success');
  } catch {
    setBackupStatus('error');
  } finally {
    checking = false;
  }
}
