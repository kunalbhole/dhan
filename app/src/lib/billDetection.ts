// Recurring-bill detection over real transaction history — proposed and
// confirmed with the user before building: group by merchant, then require
// all three of (a) at least 3 occurrences, (b) amounts within ~25% of the
// group's median, (c) consecutive gaps clustering around 24–40 days. All
// three matter together — merchant+amount alone would flag "5 Swiggy
// orders this month" exactly like a real recurring bill; it's the interval
// check that tells frequent-but-irregular spending apart from a monthly
// charge. Deliberately monthly-only for now — quarterly/yearly cadences
// are a reasonable later addition, not built here.
import type { StoredTransaction } from './db';

const MIN_OCCURRENCES = 3;
const AMOUNT_TOLERANCE = 0.25;
const MIN_INTERVAL_DAYS = 24;
const MAX_INTERVAL_DAYS = 40;

export interface DetectedPattern {
  merchantKey: string;
  displayName: string;
  category: string;
  medianAmount: number;
  medianIntervalDays: number;
  lastOccurrenceAt: number;
  occurrences: { amount: number; timestamp: number }[];
}

// Grouping/dedupe key only — display keeps the original merchant casing
// from whichever transaction is used as `displayName`.
function normalizeMerchant(name: string): string {
  return name.trim().toLowerCase().replace(/\s{2,}/g, ' ');
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function detectRecurringPatterns(transactions: StoredTransaction[]): DetectedPattern[] {
  const groups = new Map<string, StoredTransaction[]>();
  for (const t of transactions) {
    if (t.amount >= 0 || !t.merchant) continue; // bills are expenses with a known merchant
    const key = normalizeMerchant(t.merchant);
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(t);
  }

  const patterns: DetectedPattern[] = [];
  for (const [merchantKey, rows] of groups) {
    if (rows.length < MIN_OCCURRENCES) continue;

    const sorted = [...rows].sort((a, b) => a.timestamp - b.timestamp);
    const amounts = sorted.map(t => Math.abs(t.amount));
    const medianAmt = median(amounts);
    if (medianAmt <= 0) continue;
    const withinTolerance = amounts.every(a => Math.abs(a - medianAmt) / medianAmt <= AMOUNT_TOLERANCE);
    if (!withinTolerance) continue;

    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((sorted[i].timestamp - sorted[i - 1].timestamp) / 86400000);
    }
    const regularlyMonthly = intervals.every(d => d >= MIN_INTERVAL_DAYS && d <= MAX_INTERVAL_DAYS);
    if (!regularlyMonthly) continue;

    const latest = sorted[sorted.length - 1];
    patterns.push({
      merchantKey,
      displayName: latest.merchant!,
      category: latest.category,
      medianAmount: medianAmt,
      medianIntervalDays: median(intervals),
      lastOccurrenceAt: latest.timestamp,
      occurrences: sorted.map(t => ({ amount: Math.abs(t.amount), timestamp: t.timestamp })),
    });
  }
  return patterns;
}
