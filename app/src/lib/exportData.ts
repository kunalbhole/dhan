// Real CSV export — builds an actual CSV of the user's real transactions
// and hands it to RN's built-in Share sheet (no extra native dependency
// needed for plain-text sharing). Unlike the reference, which just shows
// an "Exporting CSV…" toast and does nothing, this genuinely exports.
import { Share } from 'react-native';
import { CATEGORIES } from './categories';
import { MONTHS_SHORT } from './dateRange';
import type { StoredTransaction } from './db';

export type ExportRangeId = 'month' | 'quarter' | 'year' | 'custom';

// "1 Sep 2026" — parseable by dateRange.ts's own parseShortDate, used as
// the default value for the custom-range From/To fields.
export function fullDateLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function isInExportRange(ts: number, range: ExportRangeId, customFrom: number | null, customTo: number | null, now: Date): boolean {
  const d = new Date(ts);
  if (range === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (range === 'quarter') {
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
    return ts >= cutoff;
  }
  if (range === 'year') return d.getFullYear() === now.getFullYear();
  // custom — an unparsed bound means "no limit on that side".
  if (customFrom !== null && ts < customFrom) return false;
  if (customTo !== null && ts >= customTo + 86400000) return false; // include the whole "to" day
  return true;
}

export function filterForExport(txns: StoredTransaction[], range: ExportRangeId, customFrom: number | null, customTo: number | null, now: Date = new Date()): StoredTransaction[] {
  return txns.filter(t => isInExportRange(t.timestamp, range, customFrom, customTo, now));
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildTransactionsCsv(txns: StoredTransaction[]): string {
  const header = ['Date', 'Merchant', 'Category', 'Amount (INR)'].join(',');
  const rows = [...txns]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(t => [fullDateLabel(t.timestamp), t.merchant ?? 'Unknown', CATEGORIES[t.category]?.name ?? 'Other', t.amount.toFixed(2)].map(csvEscape).join(','));
  return [header, ...rows].join('\n');
}

export async function shareTransactionsCsv(csv: string): Promise<void> {
  await Share.share({ message: csv, title: 'Dhan transactions.csv' });
}
