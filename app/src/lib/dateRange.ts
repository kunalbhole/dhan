// Small date-math helpers shared by any screen that needs to reason about
// "this calendar month" against real timestamps — HomeScreen's budget
// totals, in particular. No Intl reliance (same reason as lib/format.ts:
// Hermes's locale-data support isn't guaranteed).
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function isThisMonth(ts: number, now: Date = new Date()): boolean {
  const d = new Date(ts);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function currentMonthLabel(now: Date = new Date()): string {
  return MONTHS[now.getMonth()];
}

// "October 2026" — BillsScreen's month-group section headers, so bills due
// in different years under the same month name don't get merged together.
export function monthYearLabel(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Sep 2026" — BudgetScreen's month-picker label shape. There's no
// per-month transaction history yet, so callers use this for "the one real
// month there is" rather than fabricating a browsable range.
export function currentMonthYear(now: Date = new Date()): string {
  return `${MONTHS_SHORT[now.getMonth()]} ${now.getFullYear()}`;
}

export function daysLeftInMonth(now: Date = new Date()): number {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(0, lastDay - now.getDate());
}

// Whole-day difference between `ts` and now — negative once overdue. Bills
// store one real `dueDate` timestamp as the source of truth (see
// src/lib/bills.ts); every "due in Nd" label is derived from it here
// rather than stored as its own drifting field.
export function daysUntil(ts: number, now: Date = new Date()): number {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(new Date(ts).getFullYear(), new Date(ts).getMonth(), new Date(ts).getDate()).getTime();
  return Math.round((startOfTarget - startOfToday) / 86400000);
}

// "26 Apr" — BillsScreen/BillDetailScreen's due-date label shape.
export function formatShortDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

// Best-effort parse of "26 Apr 2026" (AddBillSheet's own placeholder
// shape) into a real timestamp — null for anything that doesn't match, so
// the caller can fall back rather than silently discard what was typed.
export function parseShortDate(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const monthIdx = MONTHS_SHORT.findIndex(mo => mo.toLowerCase() === m[2].slice(0, 3).toLowerCase());
  const year = parseInt(m[3], 10);
  if (monthIdx === -1 || day < 1 || day > 31) return null;
  const d = new Date(year, monthIdx, day);
  return d.getMonth() === monthIdx ? d.getTime() : null; // rejects e.g. "31 Feb"
}
