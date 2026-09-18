import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { CalendarCheckIcon } from 'phosphor-react-native/lib/module/icons/CalendarCheck';
import { ChartPieSliceIcon } from 'phosphor-react-native/lib/module/icons/ChartPieSlice';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import IconChip from './IconChip';
import AddTxnSheet from './AddTxnSheet';
import AddBillSheet from './AddBillSheet';
import SplitSheet from './SplitSheet';
import { colors, spacing } from '../theme';
import { subscribeToAddSheet } from '../lib/addSheet';

type Target = 'txn' | 'bill' | 'split' | null;

// New, not in the reference: one global "+" (AppHeader.tsx) replacing the
// separate add buttons that used to live on Home, Transactions, Bills,
// Budget and Splits. Mounted once at the app root (App.tsx, next to
// <Toast />) and driven by src/lib/addSheet.ts's openAddSheet() — every
// AppHeader instance calls that instead of owning any sheet state itself.
// Each option below opens the exact same sheet its old per-screen "+"
// button used to.
function GlobalAddSheet() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [target, setTarget] = useState<Target>(null);

  useEffect(() => subscribeToAddSheet(() => setMenuOpen(true)), []);

  const choose = (id: 'txn' | 'bill' | 'budget' | 'split') => {
    setMenuOpen(false);
    if (id === 'budget') {
      // Matches BudgetScreen's own "+ Create new budget" — still a stub
      // there too (no budget-creation flow exists yet to wire this to).
      // eslint-disable-next-line no-console
      console.log('[GlobalAddSheet] nav -> create-budget');
      return;
    }
    setTarget(id);
  };

  return (
    <>
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Add">
        {[
          { id: 'txn' as const, Icon: ReceiptIcon, label: 'Add transaction', sub: 'Log an expense or income' },
          { id: 'bill' as const, Icon: CalendarCheckIcon, label: 'Add bill', sub: 'Track a recurring payment' },
          { id: 'budget' as const, Icon: ChartPieSliceIcon, label: 'Create budget', sub: 'Set up a new budget' },
          { id: 'split' as const, Icon: UsersThreeIcon, label: 'Create split', sub: 'Split an expense with friends' },
        ].map((a, i, arr) => (
          <Pressable
            key={a.id}
            onPress={() => choose(a.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}
          >
            <IconChip icon={a.Icon} color={colors.navy} bg={colors.bgSurface} />
            <View>
              <AppText weight="medium" style={{ fontSize: 14, color: colors.navy }}>
                {a.label}
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{a.sub}</AppText>
            </View>
          </Pressable>
        ))}
      </BottomSheet>

      <AddTxnSheet open={target === 'txn'} onClose={() => setTarget(null)} initial={{ kind: 'expense' }} />
      <AddBillSheet open={target === 'bill'} onClose={() => setTarget(null)} />
      <SplitSheet open={target === 'split'} onClose={() => setTarget(null)} />
    </>
  );
}

export default GlobalAddSheet;
