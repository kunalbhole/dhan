// Ported verbatim from Dhan App 2/screens-main.jsx's SAMPLE_TXNS and
// UNCAT_TXNS — placeholder data the prototype itself uses, not real user
// data. `icon` fields are phosphor slugs (see src/lib/categories.ts's
// comment on why they're strings, not components). UPCOMING_BILLS used to
// live here too; bills are real now (see src/lib/bills.ts).

export interface SampleTxn {
  id: number;
  date: string;
  day: string;
  m: string;
  s: string;
  a: number;
  c: string;
  isForeignTransaction?: boolean;
  originalCurrency?: string;
  originalAmount?: number;
  inrAmount?: number;
  categoryLocked?: boolean;
}

export const SAMPLE_TXNS: SampleTxn[] = [
  { id: 1, date: 'Today', day: 'Today · Apr 23', m: 'Swiggy', s: 'Dinner · UPI · 3:42 PM', a: -420, c: 'food' },
  { id: 2, date: 'Today', day: 'Today · Apr 23', m: 'Salary · Acme Co', s: 'Income · HDFC · 9:00 AM', a: 82500, c: 'income' },
  { id: 3, date: 'Today', day: 'Today · Apr 23', m: 'Blue Tokai', s: 'Coffee · UPI · 10:12 AM', a: -240, c: 'food' },
  {
    id: 10,
    date: 'Today',
    day: 'Today · Apr 23',
    m: 'Figma Inc',
    s: 'USD 45 · international',
    a: -3842,
    c: 'shopping',
    isForeignTransaction: true,
    originalCurrency: 'USD',
    originalAmount: 45,
    inrAmount: 3842,
  },
  {
    id: 11,
    date: 'Today',
    day: 'Today · Apr 23',
    m: 'Forex markup fee',
    s: 'Forex Fee · auto-detected',
    a: -76,
    c: 'forex-fee',
    categoryLocked: true,
  },
  { id: 4, date: 'Yesterday', day: 'Yesterday', m: 'Uber', s: 'BKC → Bandra · UPI', a: -186, c: 'transport' },
  { id: 5, date: 'Yesterday', day: 'Yesterday', m: 'Myntra', s: 'Apparel · UPI', a: -2499, c: 'shopping' },
  { id: 6, date: 'Yesterday', day: 'Yesterday', m: 'BigBasket', s: 'Groceries · UPI', a: -1840, c: 'groceries' },
  { id: 7, date: 'Mon', day: 'Mon · Apr 21', m: 'Airtel', s: 'Fiber · auto-debit', a: -999, c: 'bills' },
  { id: 8, date: 'Mon', day: 'Mon · Apr 21', m: 'BookMyShow', s: 'Ent. · UPI', a: -350, c: 'ent' },
  { id: 9, date: 'Mon', day: 'Mon · Apr 21', m: 'Apollo Pharmacy', s: 'Health · UPI', a: -615, c: 'health' },
];

export interface UncatTxn {
  id: string;
  m: string;
  s: string;
  a: number;
}

export const UNCAT_TXNS: UncatTxn[] = [
  { id: 'u1', m: 'Unknown UPI', s: 'UPI/9284XX · Apr 22', a: -340 },
  { id: 'u2', m: 'Amazon Pay', s: 'Wallet · Apr 22', a: -120 },
  { id: 'u3', m: 'ATM withdrawal', s: 'Cash · HDFC · Apr 21', a: -860 },
  { id: 'u4', m: 'Spotify', s: 'Card · Apr 21', a: -199 },
  { id: 'u5', m: 'Razorpay merchant', s: 'UPI · Apr 20', a: -450 },
  { id: 'u6', m: 'Auto rickshaw', s: 'UPI · Apr 20', a: -75 },
  { id: 'u7', m: 'NEFT · S. Joshi', s: 'Credit · Apr 19', a: 640 },
  { id: 'u8', m: 'Zepto', s: 'UPI · Apr 19', a: -210 },
  { id: 'u9', m: 'Cash transfer', s: 'Self · Apr 18', a: -386 },
  { id: 'u10', m: 'Paytm wallet', s: 'Top-up · Apr 18', a: -300 },
  { id: 'u11', m: 'PhonePe merchant', s: 'UPI · Apr 17', a: -400 },
  { id: 'u12', m: 'Card swipe · POS', s: 'HDFC ••4521 · Apr 17', a: -250 },
];

// Ported from screens-main.jsx's BudgetScreen `budgets` array — hardcoded
// per-category spend/cap sample figures, same status as SAMPLE_TXNS.
export interface CategoryBudget {
  cat: string;
  spent: number;
  cap: number;
}

export const BUDGET_CATEGORIES: CategoryBudget[] = [
  { cat: 'food', spent: 3200, cap: 5000 },
  { cat: 'transport', spent: 1480, cap: 3000 },
  { cat: 'shopping', spent: 6200, cap: 5000 },
  { cat: 'bills', spent: 4299, cap: 6000 },
  { cat: 'ent', spent: 1120, cap: 2000 },
  { cat: 'health', spent: 615, cap: 1500 },
  { cat: 'groceries', spent: 3840, cap: 4000 },
];

// Ported from budget-edit.jsx's SAVINGS_SUBS — savings goals rather than
// spend categories, shown nested under the "Savings" bucket.
export interface SavingsSub {
  id: string;
  name: string;
  spent: number;
  cap: number;
  color: string;
}

export const SAVINGS_SUBS: SavingsSub[] = [
  { id: 'invest', name: 'Investing', spent: 2600, cap: 5000, color: '#2E7D5B' },
  { id: 'insurance', name: 'Insurance', spent: 1200, cap: 1500, color: '#4F8FAF' },
  { id: 'debt', name: 'Debt pay-off', spent: 1300, cap: 2000, color: '#B08D57' },
];

// Ported from app.jsx's seed `projectBudgets` state — the one example
// project budget (Marriage) the prototype ships with.
export interface BudgetLine {
  name: string;
  spent: number;
  cap: number;
}

export interface ProjectBudget {
  id: string;
  name: string;
  subtitle: string;
  lines: BudgetLine[];
}

export const PROJECT_BUDGETS: ProjectBudget[] = [
  {
    id: 'marriage',
    name: 'Marriage',
    subtitle: 'Dec 2026 · project budget',
    lines: [
      { name: 'Venue & catering', spent: 180000, cap: 400000 },
      { name: 'Outfits & jewellery', spent: 96000, cap: 250000 },
      { name: 'Photography', spent: 40000, cap: 120000 },
      { name: 'Travel & stay', spent: 0, cap: 90000 },
    ],
  },
];

// UpcomingBill/UPCOMING_BILLS used to live here — replaced by src/lib/
// bills.ts's real `Bill` type. Bills are no longer seeded from sample
// data; they come from src/lib/billsStore.ts (manual adds + detection).
