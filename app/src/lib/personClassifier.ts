// Second-pass cleanup over real history: smsParser.ts classifies a
// counterparty as a person from a single SMS's text alone (name shape, no
// business keyword). That's right most of the time, but it can't see a
// pattern that only shows up across many messages — someone who "pays"
// the same amount to the same name every ~30 days isn't a friend, it's a
// subscription or a landlord that happens to have a person's name. This
// reuses billDetection.ts's exact recurring-bill test (3+ occurrences,
// amounts within ~25%, gaps clustering 24–40 days) against person-tagged
// transactions, and demotes any match to a merchant.
import {
  getPersonTaggedTransactionsSync,
  reclassifyPersonAsMerchantSync,
  type StoredTransaction,
} from './db';

const MIN_OCCURRENCES = 3;
const AMOUNT_TOLERANCE = 0.25;
const MIN_INTERVAL_DAYS = 24;
const MAX_INTERVAL_DAYS = 40;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function looksRecurring(rows: StoredTransaction[]): boolean {
  if (rows.length < MIN_OCCURRENCES) return false;
  const sorted = [...rows].sort((a, b) => a.timestamp - b.timestamp);
  const amounts = sorted.map(t => Math.abs(t.amount));
  const medianAmt = median(amounts);
  if (medianAmt <= 0) return false;
  const withinTolerance = amounts.every(a => Math.abs(a - medianAmt) / medianAmt <= AMOUNT_TOLERANCE);
  if (!withinTolerance) return false;

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push((sorted[i].timestamp - sorted[i - 1].timestamp) / 86400000);
  }
  const medianInterval = median(intervals);
  return medianInterval >= MIN_INTERVAL_DAYS && medianInterval <= MAX_INTERVAL_DAYS;
}

// Run once after a scan (full or incremental) finishes — cheap enough
// (grouping an in-memory array) not to need its own progress UI.
export function runRecurringReclassification(): string[] {
  const txns = getPersonTaggedTransactionsSync();
  const byPerson = new Map<string, StoredTransaction[]>();
  for (const t of txns) {
    if (!t.personKey) continue;
    (byPerson.get(t.personKey) ?? byPerson.set(t.personKey, []).get(t.personKey)!).push(t);
  }

  const reclassified: string[] = [];
  for (const [personKey, rows] of byPerson) {
    if (looksRecurring(rows)) {
      reclassifyPersonAsMerchantSync(personKey);
      reclassified.push(personKey);
    }
  }
  return reclassified;
}
