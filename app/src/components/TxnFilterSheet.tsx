import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Chip from './Chip';
import { colors, radii, spacing } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';

export type FilterKind = 'all' | 'expense' | 'income';
export type FilterPeriod = 'This month' | 'Last month' | 'Last 3 months' | 'This year';

export interface TxnFilters {
  kind: FilterKind;
  cats: string[];
  range: FilterPeriod;
}

export interface TxnFilterSheetProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: TxnFilters) => void;
  initial?: Partial<TxnFilters>;
}

const KINDS: { id: FilterKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'expense', label: 'Expenses' },
  { id: 'income', label: 'Income' },
];
const PERIODS: FilterPeriod[] = ['This month', 'Last month', 'Last 3 months', 'This year'];
const CAT_IDS = Object.keys(CATEGORIES).filter(c => c !== 'forex-fee');

// Ported from Dhan App 2/screens-sheets.jsx's TxnFilterSheet. In the
// reference this sheet's Apply never actually feeds back into
// TransactionsScreen's own filter state (its onApply just closes the
// sheet and shows a toast) — a prototype gap, not a deliberate design.
// Here Apply really narrows the list: TransactionsScreen composes `kind`
// with its own bucket chips, and `cats`/`range` as their own real filters.
function TxnFilterSheet({ open, onClose, onApply, initial }: TxnFilterSheetProps) {
  const [kind, setKind] = useState<FilterKind>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [range, setRange] = useState<FilterPeriod>('This month');

  useEffect(() => {
    if (!open) return;
    setKind(initial?.kind || 'all');
    setCats(initial?.cats || []);
    setRange(initial?.range || 'This month');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleCat = (id: string) => {
    setCats(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const reset = () => {
    setKind('all');
    setCats([]);
    setRange('This month');
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Filter transactions">
      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Type</AppText>
      <View style={{ flexDirection: 'row', gap: spacing.s2, marginBottom: spacing.s4 }}>
        {KINDS.map(k => (
          <View key={k.id} style={{ flex: 1 }}>
            <Chip active={kind === k.id} onPress={() => setKind(k.id)}>
              {k.label}
            </Chip>
          </View>
        ))}
      </View>

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Period</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 }}>
        {PERIODS.map(r => (
          <Chip key={r} active={range === r} onPress={() => setRange(r)}>
            {r}
          </Chip>
        ))}
      </View>

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        Categories{cats.length ? ` · ${cats.length} selected` : ''}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 }}>
        {CAT_IDS.map(id => {
          const c = CATEGORIES[id];
          const Icon = CATEGORY_ICONS[id];
          const on = cats.includes(id);
          return (
            <Pressable
              key={id}
              onPress={() => toggleCat(id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: spacing.s2,
                paddingHorizontal: spacing.s3,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: on ? colors.navy : colors.borderSubtle,
                backgroundColor: on ? colors.navy : 'transparent',
              }}
            >
              <Icon size={14} color={on ? colors.fgOnDark : colors.fg2} />
              <AppText weight="medium" style={{ fontSize: 12.5, color: on ? colors.fgOnDark : colors.fg2 }}>
                {c.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" full onPress={reset}>
            Reset
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="primary" full onPress={() => onApply({ kind, cats, range })}>
            Apply
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}

export default TxnFilterSheet;
