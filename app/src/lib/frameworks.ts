// Ported verbatim from Dhan App 2/screens-main.jsx's FRAMEWORKS,
// FRAMEWORK_BUCKETS, BUCKETS, EXTRA_BUCKETS, and frameworkBuckets() — the
// canonical data other onboarding/budget screens are meant to share.
import type { ComponentType } from 'react';
import { HouseLineIcon } from 'phosphor-react-native/lib/module/icons/HouseLine';
import { ConfettiIcon } from 'phosphor-react-native/lib/module/icons/Confetti';
import { PiggyBankIcon } from 'phosphor-react-native/lib/module/icons/PiggyBank';
import { CreditCardIcon } from 'phosphor-react-native/lib/module/icons/CreditCard';
import { colors } from '../theme';
import { CATEGORIES } from './categories';
import type { PhosphorIconProps } from '../components/IconChip';

export interface FrameworkOption {
  id: string;
  name: string;
  desc: string;
}

export const FRAMEWORKS: FrameworkOption[] = [
  { id: '50-30-20', name: '50 / 30 / 20', desc: '50% Needs · 30% Wants · 20% Savings' },
  { id: '70-20-10', name: '70 / 20 / 10', desc: '70% Spending · 20% Savings · 10% Debt' },
  { id: '80-20', name: '80 / 20', desc: '80% Spending · 20% Savings' },
  { id: 'pyf', name: 'Pay Yourself First', desc: 'Save 20% first · spend the rest freely' },
  { id: 'zero', name: 'Zero-Based', desc: 'Every rupee assigned · nothing left over' },
  { id: '60-20-20', name: '60 / 20 / 20', desc: '60% Needs · 20% Wants · 20% Savings' },
];

const EVERYDAY = ['rent', 'bills', 'groceries', 'transport', 'health', 'food', 'shopping', 'ent', 'travel'];
const NEEDS = ['rent', 'bills', 'groceries', 'transport', 'health'];
const WANTS = ['food', 'shopping', 'ent', 'travel'];
const SAVINGS = ['income', 'edu'];
const DEBT = ['cc', 'emi', 'ploan'];
const SAVE_FIRST = ['income', 'invest', 'edu'];

type BucketShape = readonly [id: string, label: string, pct: number, cats: string[]];

const FRAMEWORK_BUCKETS: Record<string, BucketShape[]> = {
  '50-30-20': [
    ['needs', 'Needs', 50, NEEDS],
    ['wants', 'Wants', 30, WANTS],
    ['savings', 'Savings', 20, SAVINGS],
  ],
  '60-20-20': [
    ['needs', 'Needs', 60, NEEDS],
    ['wants', 'Wants', 20, WANTS],
    ['savings', 'Savings', 20, SAVINGS],
  ],
  '70-20-10': [
    ['needs', 'Spending', 70, EVERYDAY],
    ['savings', 'Savings', 20, SAVINGS],
    ['debt', 'Debt', 10, DEBT],
  ],
  '80-20': [
    ['needs', 'Spending', 80, EVERYDAY],
    ['savings', 'Savings', 20, SAVINGS],
  ],
  pyf: [
    ['savings', 'Save first', 20, SAVE_FIRST],
    ['needs', 'Spend freely', 80, EVERYDAY],
  ],
  // Zero-based starts from the 50/30/20 shape and expects reassignment.
  zero: [
    ['needs', 'Needs', 50, NEEDS],
    ['wants', 'Wants', 30, WANTS],
    ['savings', 'Savings', 20, SAVINGS],
  ],
};

interface BucketMeta {
  color: string;
  cats?: string[];
  spent?: number;
  icon: ComponentType<PhosphorIconProps>;
  tint: string;
}

// `spent` values are the reference's own hardcoded placeholder figures
// (screens-main.jsx's BUCKETS) — sample data, not derived from real
// transactions, same status as SAMPLE_TXNS elsewhere.
const BUCKETS: Record<string, BucketMeta> = {
  needs: { color: colors.navy, cats: ['rent', 'bills', 'groceries', 'transport', 'health'], spent: 16180, icon: HouseLineIcon, tint: colors.bgSurface },
  wants: { color: colors.gold, cats: ['food', 'shopping', 'ent', 'travel'], spent: 10900, icon: ConfettiIcon, tint: colors.goldBg },
  savings: { color: colors.income, cats: ['income', 'edu'], spent: 5100, icon: PiggyBankIcon, tint: colors.incomeBg },
};

// Not part of colors_and_type.css's tokens — matches CATEGORIES.cc's color
// in the source, kept literal like the bank-brand colors elsewhere.
const EXTRA_BUCKETS: Record<string, BucketMeta> = {
  debt: { color: '#C4696B', icon: CreditCardIcon, tint: colors.expenseBg },
};

export interface FrameworkBucket {
  id: string;
  label: string;
  pct: number;
  color: string;
  cats: string[];
  spent: number;
  icon: ComponentType<PhosphorIconProps>;
  tint: string;
}

export function frameworkBuckets(fwId: string): FrameworkBucket[] {
  const shape = FRAMEWORK_BUCKETS[fwId] || FRAMEWORK_BUCKETS['50-30-20'];
  const used = new Set<string>();
  return shape.map(([id, label, pct, cats]) => {
    const base = BUCKETS[id] || EXTRA_BUCKETS[id] || BUCKETS.needs;
    const list = (cats.length ? cats : base.cats || []).filter(cat => {
      if (used.has(cat) || !CATEGORIES[cat]) return false;
      used.add(cat);
      return true;
    });
    return { id, label, pct, color: base.color, cats: list, spent: base.spent || 0, icon: base.icon, tint: base.tint };
  });
}
