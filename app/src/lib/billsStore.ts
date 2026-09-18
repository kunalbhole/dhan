// Real, AsyncStorage-persisted bills — replacing the old session-only
// store that reset to the same 7 sample bills every launch. Persistence is
// what makes the detected/suggested flow actually work: a dismissed
// suggestion or a confirmed bill has to survive an app restart, or
// dismissing would be pointless (it'd just reappear next run) and
// confirming would have to be redone every time. Bills are a short, bounded
// list (realistically 5–20 rows), so one JSON blob in AsyncStorage —
// matching src/lib/account.ts's pattern — is proportionate; this doesn't
// need a SQLite table the way the (large, growing) transactions list does.
//
// Same subscribe/notify shape as before, so HomeScreen/BillsScreen/
// BillDetailScreen barely change: getBills() stays synchronous (it may
// return [] for a moment on cold start, before AsyncStorage hydration
// resolves and notify() fires — the same "loads async, updates via
// subscription" shape already used for transactions elsewhere in the app).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectRecurringPatterns } from './billDetection';
import { liveBillStatus, type Bill } from './bills';
import { daysUntil } from './dateRange';
import type { StoredTransaction } from './db';

const STORAGE_KEY = 'dhan-bills';

let bills: Bill[] = [];
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          bills = JSON.parse(raw);
        } catch {
          bills = [];
        }
      }
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
// Kick hydration off as soon as the module loads, same as the old store's
// top-level `bills = UPCOMING_BILLS.map(...)` — just async now.
hydrate();

// Live status recompute happens here, once, for every reader — not scattered
// across each screen — so "upcoming" flips to "due-soon" as the due date
// approaches without a scheduled job (see bills.ts's liveBillStatus).
export function getBills(): Bill[] {
  return bills.map(b => ({ ...b, status: liveBillStatus(b) }));
}

export function subscribeToBills(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Matches app.jsx's handleTogglePaid — always sets to "paid", not a true
// toggle despite bills being able to be marked paid from two screens.
export function markBillPaid(id: string): void {
  bills = bills.map(b => (b.id === id ? { ...b, status: 'paid' } : b));
  notify();
  persist();
}

export function addBill(bill: Bill): void {
  bills = [bill, ...bills];
  notify();
  persist();
}

// Called from BillsScreen on focus (not on every SMS/transaction insert —
// this is cheap even at a few thousand rows, but there's no reason to
// recompute it more often than the screen that shows the results is
// actually open). Idempotent: any merchant that already has a bill record
// in *any* state — suggested, confirmed, or dismissed — is skipped, so
// re-running never re-suggests something the user already decided on.
export async function runBillDetection(transactions: StoredTransaction[]): Promise<void> {
  await hydrate();
  const known = new Set(bills.map(b => b.merchantKey).filter(Boolean));
  const patterns = detectRecurringPatterns(transactions).filter(p => !known.has(p.merchantKey));
  if (!patterns.length) return;

  const suggested: Bill[] = patterns.map(p => ({
    id: `bill-detected-${p.merchantKey}`,
    name: p.displayName,
    amt: Math.round(p.medianAmount),
    dueDate: p.lastOccurrenceAt + p.medianIntervalDays * 86400000,
    category: p.category,
    status: 'suggested',
    source: 'detected',
    merchantKey: p.merchantKey,
    occurrences: p.occurrences,
  }));
  bills = [...suggested, ...bills];
  notify();
  await persist();
}

// Confirms a suggestion into a real tracked bill. The due date was already
// computed at suggestion time (last occurrence + the pattern's own
// interval) and occurrences were already attached then too, per the
// backfill decision — confirming just changes status, it doesn't
// recompute anything.
export function confirmSuggestedBill(id: string): void {
  bills = bills.map(b => (b.id === id ? { ...b, status: daysUntil(b.dueDate) <= 5 ? 'due-soon' : 'upcoming' } : b));
  notify();
  persist();
}

// Kept as a record (not deleted) specifically so its merchantKey keeps
// excluding it from future detection runs.
export function dismissSuggestedBill(id: string): void {
  bills = bills.map(b => (b.id === id ? { ...b, status: 'dismissed' } : b));
  notify();
  persist();
}
