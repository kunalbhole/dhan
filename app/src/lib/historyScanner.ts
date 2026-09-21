// The one-time full SMS history backfill for real Split data (and,
// incidentally, more complete transaction history everywhere else too).
// Design notes, since this is the trickiest piece of the Split rebuild:
//
// - Reads via native/sms.ts's readSmsPage, which pages by the SMS
//   provider's own stable row id (oldest to newest) rather than by date —
//   see SmsModule.kt's readSmsPage comment for why: a new SMS arriving
//   mid-scan can't shift where a page boundary falls.
// - The cursor (last row id processed) and a "complete" flag live in
//   AsyncStorage, so closing/backgrounding the app mid-scan resumes from
//   there next launch instead of restarting.
// - Never blocks a full page's worth of inserts back to back — processes
//   in small chunks with a `setTimeout` yield between them, so the JS
//   thread the UI also runs on gets to paint/handle touches in between.
// - Everything it touches (SMS text, the resulting transactions) already
//   lived in db.ts's on-device SQLite file; this module doesn't add any
//   network code, and reads/writes nothing off-device.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readSmsPage, getSmsCount, type RawSmsWithId } from '../native/sms';
import { processIncomingSms } from './smsPipeline';
import { runRecurringReclassification } from './personClassifier';
import { runAutoContactMatch } from './peopleReview';

const CURSOR_KEY = 'dhan-history-scan-cursor';
const TOTAL_KEY = 'dhan-history-scan-total';
const COMPLETE_KEY = 'dhan-history-scan-complete';

const READ_PAGE_SIZE = 200;
const PROCESS_CHUNK_SIZE = 20;
const YIELD_MS = 16;

export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error';
export interface ScanProgress {
  status: ScanStatus;
  scanned: number;
  total: number;
  percent: number;
}

let progress: ScanProgress = { status: 'idle', scanned: 0, total: 0, percent: 0 };
const listeners = new Set<(p: ScanProgress) => void>();

export function getScanProgress(): ScanProgress {
  return progress;
}

export function subscribeToScanProgress(listener: (p: ScanProgress) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setProgress(next: Partial<ScanProgress>) {
  progress = { ...progress, ...next };
  progress.percent = progress.total > 0 ? Math.min(100, Math.round((progress.scanned / progress.total) * 100)) : 0;
  listeners.forEach(l => l(progress));
}

async function getCursor(): Promise<number> {
  const v = await AsyncStorage.getItem(CURSOR_KEY);
  return v ? parseInt(v, 10) : 0;
}
async function setCursor(id: number): Promise<void> {
  await AsyncStorage.setItem(CURSOR_KEY, String(id));
}
async function setStoredTotal(n: number): Promise<void> {
  await AsyncStorage.setItem(TOTAL_KEY, String(n));
}
export async function isHistoryScanComplete(): Promise<boolean> {
  return (await AsyncStorage.getItem(COMPLETE_KEY)) === '1';
}
async function markScanComplete(): Promise<void> {
  await AsyncStorage.setItem(COMPLETE_KEY, '1');
}

// Local dev/testing escape hatch — not exposed in any UI, but lets a
// rescan be forced from a debug menu later without hand-editing storage.
export async function resetHistoryScan(): Promise<void> {
  await AsyncStorage.removeMany([CURSOR_KEY, TOTAL_KEY, COMPLETE_KEY]);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processInChunks(page: RawSmsWithId[]): Promise<void> {
  for (let i = 0; i < page.length; i += PROCESS_CHUNK_SIZE) {
    const chunk = page.slice(i, i + PROCESS_CHUNK_SIZE);
    for (const raw of chunk) {
      await processIncomingSms(raw).catch(() => {});
    }
    if (i + PROCESS_CHUNK_SIZE < page.length) await delay(YIELD_MS);
  }
}

let running = false;

// Safe to call on every app start/foreground: a no-op while already
// running, near-instant once the full backfill is done (just a quick
// "anything new since last time" pass), and resumes rather than restarts
// if the previous run was interrupted.
export async function startHistoryScan(): Promise<void> {
  if (running) return;
  running = true;
  try {
    if (await isHistoryScanComplete()) {
      await catchUpRecent();
      await runAutoContactMatch().catch(() => {});
      return;
    }
    await runFullScan();
    runRecurringReclassification();
    await runAutoContactMatch().catch(() => {});
  } catch {
    setProgress({ status: 'error' });
  } finally {
    running = false;
  }
}

async function runFullScan(): Promise<void> {
  let cursor = await getCursor();
  const total = await getSmsCount();
  await setStoredTotal(total);
  setProgress({ status: 'scanning', scanned: cursor, total });

  for (;;) {
    const page = await readSmsPage(cursor, READ_PAGE_SIZE);
    if (!page.length) break;
    await processInChunks(page);
    cursor = page[page.length - 1].id;
    await setCursor(cursor);
    setProgress({ scanned: Math.min(cursor, total), total });
    await delay(YIELD_MS);
  }

  await markScanComplete();
  setProgress({ status: 'complete', scanned: total, total });
}

// Runs quietly (no progress UI) after the one-time backfill is already
// done — just picks up whatever arrived while the app was fully closed
// (the live listener in App.tsx only catches SMS while the process is
// alive).
async function catchUpRecent(): Promise<void> {
  let cursor = await getCursor();
  for (;;) {
    const page = await readSmsPage(cursor, READ_PAGE_SIZE);
    if (!page.length) break;
    await processInChunks(page);
    cursor = page[page.length - 1].id;
    await setCursor(cursor);
    await delay(YIELD_MS);
  }
}
