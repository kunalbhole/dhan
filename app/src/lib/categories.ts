// Ported verbatim from Dhan App 2/components.jsx's CATEGORIES. Several of
// these colors (groceries, rent, travel, cc, emi, ploan, invest) have no
// equivalent in colors_and_type.css — that file only defines 8 `--cat-*`
// tokens, while this object covers the full category set — so they stay
// literal here rather than forcing a theme.ts token that doesn't exist.
// `icon` is the phosphor slug from the source; not yet wired to actual
// icon components since no screen built so far renders category icons.
export interface CategoryMeta {
  name: string;
  icon: string;
  color: string;
  locked?: boolean;
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  food: { name: 'Food', icon: 'fork-knife', color: '#E88B5C' },
  transport: { name: 'Transport', icon: 'car-simple', color: '#6A8FD4' },
  shopping: { name: 'Shopping', icon: 'shopping-bag', color: '#C97BB6' },
  bills: { name: 'Bills', icon: 'receipt', color: '#7C9B5F' },
  ent: { name: 'Entertainment', icon: 'film-strip', color: '#B079D9' },
  health: { name: 'Health', icon: 'heartbeat', color: '#5CB4A8' },
  edu: { name: 'Education', icon: 'graduation-cap', color: '#D4A84C' },
  groceries: { name: 'Groceries', icon: 'basket', color: '#7FB36B' },
  rent: { name: 'Rent', icon: 'house', color: '#6A8FD4' },
  travel: { name: 'Travel', icon: 'airplane-takeoff', color: '#4F8FAF' },
  income: { name: 'Income', icon: 'arrow-down-left', color: '#2E7D5B' },
  cc: { name: 'Credit card', icon: 'credit-card', color: '#C4696B' },
  emi: { name: 'Loan EMI', icon: 'bank', color: '#A2708F' },
  ploan: { name: 'Personal loan', icon: 'hand-coins', color: '#8B7BC4' },
  invest: { name: 'Investments', icon: 'trend-up', color: '#3E9B77' },
  'forex-fee': { name: 'Forex Fee', icon: 'currency-circle-dollar', color: '#8A90A8', locked: true },
  other: { name: 'Other', icon: 'dots-three', color: '#8A90A8' },
};
