// Shared real-budget math — used anywhere a screen needs "how much has the
// user actually spent, this month, in a given set of categories" against
// their real onboarding income/framework. Extracted out of HomeScreen once
// BudgetScreen and TxnDetailScreen needed the identical calculation.
import type { StoredTransaction } from './db';

export function spentOn(txns: StoredTransaction[], cats: string[]): number {
  return txns.filter(t => t.amount < 0 && cats.includes(t.category)).reduce((s, t) => s + Math.abs(t.amount), 0);
}
