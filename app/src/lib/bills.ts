import { daysUntil } from './dateRange';

// A single real transaction that contributed to a detected recurring
// pattern — kept on the bill so BillDetailScreen can show genuine payment
// history for detected bills, backfilled at suggestion time rather than
// starting blank when the user confirms it.
export interface BillOccurrence {
  amount: number;
  timestamp: number;
}

export type BillStatus = 'suggested' | 'upcoming' | 'due-soon' | 'paid' | 'dismissed';
export type BillSource = 'detected' | 'manual';

export interface Bill {
  id: string;
  name: string;
  amt: number;
  // The one real due-date timestamp — every "due in Nd" / "Due 26 Apr"
  // label is derived from this at render time (see dueDateStatus below),
  // never stored as its own field that could drift out of sync with it.
  dueDate: number;
  category: string; // a CATEGORIES id — drives icon + grouping
  status: BillStatus;
  source: BillSource;
  // Detected bills only: the normalized merchant key used to dedupe
  // against future detection runs (see billDetection.ts) so a dismissed
  // or already-suggested/confirmed merchant is never re-suggested.
  merchantKey?: string;
  occurrences?: BillOccurrence[];
}

// Recomputes a *confirmed* bill's live status from its real due date —
// called on every detection pass so "upcoming" flips to "due-soon" as the
// date approaches without needing its own scheduled job. Never touches
// 'suggested', 'paid' or 'dismissed' — those are set explicitly by
// confirm/dismiss/markPaid, not by the calendar.
export function liveBillStatus(bill: Bill): BillStatus {
  if (bill.status !== 'upcoming' && bill.status !== 'due-soon') return bill.status;
  return daysUntil(bill.dueDate) <= 5 ? 'due-soon' : 'upcoming';
}
