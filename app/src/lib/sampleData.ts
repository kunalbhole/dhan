// Ported verbatim from Dhan App 2/screens-main.jsx's SAMPLE_TXNS,
// UNCAT_TXNS, and UPCOMING_BILLS — placeholder data the prototype itself
// uses, not real user data. `icon` fields are phosphor slugs (see
// src/lib/categories.ts's comment on why they're strings, not components).

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

export interface UpcomingBill {
  id: string;
  name: string;
  amt: number;
  due: string;
  dueIn: number;
  icon: string;
  status: 'upcoming' | 'due-soon' | 'paid';
}

export const UPCOMING_BILLS: UpcomingBill[] = [
  { id: 'rent', name: 'Rent', amt: 24000, due: 'May 1', dueIn: 8, icon: 'house', status: 'upcoming' },
  { id: 'airtel', name: 'Airtel Fiber', amt: 1199, due: 'Apr 26', dueIn: 3, icon: 'wifi-high', status: 'due-soon' },
  { id: 'spotify', name: 'Spotify', amt: 119, due: 'Apr 28', dueIn: 5, icon: 'spotify-logo', status: 'due-soon' },
  { id: 'netflix', name: 'Netflix', amt: 649, due: 'May 4', dueIn: 11, icon: 'television-simple', status: 'upcoming' },
  { id: 'elec', name: 'Electricity', amt: 2340, due: 'Apr 18', dueIn: -5, icon: 'lightning', status: 'paid' },
  { id: 'gas', name: 'Piped Gas', amt: 480, due: 'May 6', dueIn: 13, icon: 'flame', status: 'upcoming' },
  { id: 'gym', name: 'Cult.fit', amt: 899, due: 'Apr 30', dueIn: 7, icon: 'barbell', status: 'due-soon' },
];
