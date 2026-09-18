import type { ComponentType } from 'react';
import { TrendUpIcon } from 'phosphor-react-native/lib/module/icons/TrendUp';
import { CalendarCheckIcon } from 'phosphor-react-native/lib/module/icons/CalendarCheck';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { MONTHS_SHORT, formatShortDate, startOfWeek } from './dateRange';
import { CATEGORIES } from './categories';
import type { Bill } from './bills';
import type { StoredTransaction } from './db';
import type { PhosphorIconProps } from '../components/IconChip';

const DAY = 86400000;
const SAVE_CATS = ['invest', 'edu'];

export type InsightPeriodId = 'week' | 'month';

export interface InsightSummary {
  label: string;
  rangeLabel: string;
  spent: number;
  deltaPct: number;
  topCategory: string | null;
  topAmount: number;
  savingsRate: number;
}

function sumExpense(txns: StoredTransaction[], from: number, to: number): number {
  return txns.filter(t => t.amount < 0 && t.timestamp >= from && t.timestamp < to).reduce((s, t) => s + Math.abs(t.amount), 0);
}
function sumIncome(txns: StoredTransaction[], from: number, to: number): number {
  return txns.filter(t => t.amount > 0 && t.timestamp >= from && t.timestamp < to).reduce((s, t) => s + t.amount, 0);
}

export function computeSummary(txns: StoredTransaction[], period: InsightPeriodId, now: Date = new Date()): InsightSummary {
  let from: number;
  let to: number;
  let prevFrom: number;
  let prevTo: number;
  let label: string;
  let rangeLabel: string;

  if (period === 'week') {
    const weekStart = startOfWeek(now).getTime();
    from = weekStart;
    to = now.getTime() + DAY;
    prevFrom = weekStart - 7 * DAY;
    prevTo = weekStart;
    label = 'This week';
    rangeLabel = `${formatShortDate(weekStart)} – today`;
  } else {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    from = monthStart;
    to = now.getTime() + DAY;
    prevFrom = prevMonthStart.getTime();
    prevTo = monthStart;
    label = 'This month';
    rangeLabel = `1 – ${now.getDate()} ${MONTHS_SHORT[now.getMonth()]}`;
  }

  const spent = sumExpense(txns, from, to);
  const prevSpent = sumExpense(txns, prevFrom, prevTo);
  const deltaPct = prevSpent > 0 ? Math.round(((spent - prevSpent) / prevSpent) * 100) : spent > 0 ? 100 : 0;

  const byCat = new Map<string, number>();
  txns
    .filter(t => t.amount < 0 && t.timestamp >= from && t.timestamp < to)
    .forEach(t => byCat.set(t.category, (byCat.get(t.category) ?? 0) + Math.abs(t.amount)));
  let topCategory: string | null = null;
  let topAmount = 0;
  byCat.forEach((amt, cat) => {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  });

  const income = sumIncome(txns, from, to);
  const saved = txns
    .filter(t => t.amount < 0 && SAVE_CATS.includes(t.category) && t.timestamp >= from && t.timestamp < to)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const savingsRate = income > 0 ? Math.round((saved / income) * 100) : 0;

  return { label, rangeLabel, spent, deltaPct, topCategory, topAmount, savingsRate };
}

export type InsightTone = 'warn' | 'good' | 'info';
export type InsightTarget = { view: 'txn' } | { view: 'bills' };

export interface InsightMeta {
  type: 'cheapest-day' | 'trend' | 'steady';
  weekdayIndex?: number;
  weekdayName?: string;
  categoryKey?: string;
  billName?: string;
  avgSpend?: number;
  otherAvgSpend?: number;
  pctLess?: number;
}

export interface InsightCard {
  id: string;
  tone: InsightTone;
  icon: ComponentType<PhosphorIconProps>;
  title: string;
  body: string;
  target: InsightTarget;
  meta: InsightMeta;
}

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function categoryTrendCard(txns: StoredTransaction[], now: Date): InsightCard | null {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const thisMonth = new Map<string, number>();
  const lastMonth = new Map<string, number>();
  txns
    .filter(t => t.amount < 0)
    .forEach(t => {
      if (t.timestamp >= monthStart) thisMonth.set(t.category, (thisMonth.get(t.category) ?? 0) + Math.abs(t.amount));
      else if (t.timestamp >= prevMonthStart && t.timestamp < monthStart) lastMonth.set(t.category, (lastMonth.get(t.category) ?? 0) + Math.abs(t.amount));
    });

  interface Trend {
    cat: string;
    now: number;
    prev: number;
    pct: number;
  }
  let best: Trend | null = null;
  for (const [cat, amt] of thisMonth) {
    const prev = lastMonth.get(cat) ?? 0;
    if (prev < 500) continue;
    const pct = Math.round(((amt - prev) / prev) * 100);
    if (pct >= 15 && (!best || pct > best.pct)) best = { cat, now: amt, prev, pct };
  }
  if (!best) return null;
  const catName = CATEGORIES[best.cat]?.name ?? 'Spending';
  return {
    id: 'trend',
    tone: 'warn',
    icon: TrendUpIcon,
    title: `${catName} up ${best.pct}% this month`,
    body: `₹${best.now.toLocaleString('en-IN')} so far, up from ₹${best.prev.toLocaleString('en-IN')} last month.`,
    target: { view: 'txn' },
    meta: {
      type: 'trend',
      categoryKey: best.cat,
      avgSpend: best.now,
      otherAvgSpend: best.prev,
    },
  };
}

function cheapestWeekdayCard(txns: StoredTransaction[], now: Date): InsightCard | null {
  const cutoff = now.getTime() - 60 * DAY;
  const totals = new Array(7).fill(0);
  const counts = new Array(7).fill(0);
  txns
    .filter(t => t.amount < 0 && t.timestamp >= cutoff)
    .forEach(t => {
      const day = new Date(t.timestamp).getDay();
      totals[day] += Math.abs(t.amount);
      counts[day] += 1;
    });
  const daysWithData = counts.filter(c => c > 0).length;
  if (daysWithData < 2) return null;
  const averages = totals.map((t, i) => (counts[i] > 0 ? t / counts[i] : null));
  const present = averages.filter((a): a is number => a !== null);
  const overallAvg = present.reduce((s, a) => s + a, 0) / present.length;
  let cheapestDay = -1;
  let cheapestAvg = Infinity;
  averages.forEach((avg, day) => {
    if (avg !== null && avg < cheapestAvg) {
      cheapestAvg = avg;
      cheapestDay = day;
    }
  });
  if (cheapestDay === -1 || overallAvg <= 0) return null;
  const pctLess = Math.round((1 - cheapestAvg / overallAvg) * 100);
  if (pctLess < 10) return null;
  return {
    id: 'cheapest-day',
    tone: 'info',
    icon: CalendarCheckIcon,
    title: `${WEEKDAYS[cheapestDay]}s are your cheapest day`,
    body: `You spend ${pctLess}% less than your other days on average.`,
    target: { view: 'txn' },
    meta: {
      type: 'cheapest-day',
      weekdayIndex: cheapestDay,
      weekdayName: WEEKDAYS[cheapestDay],
      avgSpend: Math.round(cheapestAvg),
      otherAvgSpend: Math.round(overallAvg),
      pctLess,
    },
  };
}

function steadiestBillCard(bills: Bill[]): InsightCard | null {
  const withHistory = bills.filter(b => b.status !== 'suggested' && b.status !== 'dismissed' && (b.occurrences?.length ?? 0) >= 2);
  if (!withHistory.length) return null;
  const steadiest = withHistory.reduce((best, b) => ((b.occurrences?.length ?? 0) > (best.occurrences?.length ?? 0) ? b : best));
  const months = steadiest.occurrences?.length ?? 0;
  return {
    id: 'steady',
    tone: 'info',
    icon: ReceiptIcon,
    title: `${steadiest.name} is your steadiest cost`,
    body: `₹${steadiest.amt.toLocaleString('en-IN')} roughly every month for the last ${months} month${months === 1 ? '' : 's'}.`,
    target: { view: 'bills' },
    meta: {
      type: 'steady',
      billName: steadiest.name,
    },
  };
}

export function computeInsightFeed(txns: StoredTransaction[], bills: Bill[], now: Date = new Date()): InsightCard[] {
  return [categoryTrendCard(txns, now), cheapestWeekdayCard(txns, now), steadiestBillCard(bills)].filter((c): c is InsightCard => c !== null);
}
