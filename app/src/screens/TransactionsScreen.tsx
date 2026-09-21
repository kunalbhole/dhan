import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FunnelIcon } from 'phosphor-react-native/lib/module/icons/Funnel';
import { MagnifyingGlassIcon } from 'phosphor-react-native/lib/module/icons/MagnifyingGlass';
import { XIcon } from 'phosphor-react-native/lib/module/icons/X';
import { ArrowDownLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowDownLeft';
import { ArrowUpRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowUpRight';
import { PiggyBankIcon } from 'phosphor-react-native/lib/module/icons/PiggyBank';
import { CreditCardIcon } from 'phosphor-react-native/lib/module/icons/CreditCard';
import AppHeader from '../components/AppHeader';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Chip from '../components/Chip';
import IconChip from '../components/IconChip';
import SectionHeader from '../components/SectionHeader';
import TabBar, { type TabId } from '../components/TabBar';
import TxnRow from '../components/TxnRow';
import TxnFilterSheet, { type TxnFilters, type FilterPeriod } from '../components/TxnFilterSheet';
import { colors, radii, spacing } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { frameworkBuckets } from '../lib/frameworks';
import { formatDay, formatTime } from '../lib/format';
import { showToast } from '../lib/toast';
import { getRecentTransactionsSync, subscribeToTransactionsChanged, type StoredTransaction } from '../lib/db';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Transactions'>;

type RangeId = 'this-month' | 'this-year' | 'all-time' | 'last-month' | 'last-3-months';
const RANGE_LABELS: Record<RangeId, string> = {
  'this-month': 'This month',
  'this-year': 'This year',
  'all-time': 'All time',
  'last-month': 'Last month',
  'last-3-months': 'Last 3 months',
};
const PERIOD_TO_RANGE: Record<FilterPeriod, RangeId> = {
  'This month': 'this-month',
  'Last month': 'last-month',
  'Last 3 months': 'last-3-months',
  'This year': 'this-year',
};

// Real calendar-based filtering against each transaction's actual
// timestamp — the reference fakes this by regexing a month name out of
// SAMPLE_TXNS's hardcoded "day" labels, since it has no real dates to
// work with. This app does, via StoredTransaction.timestamp.
function isInRange(ts: number, range: RangeId): boolean {
  if (range === 'all-time') return true;
  const now = new Date();
  const d = new Date(ts);
  if (range === 'this-year') return d.getFullYear() === now.getFullYear();
  if (range === 'this-month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (range === 'last-month') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
  }
  // last-3-months: this month plus the two before it, inclusive.
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return ts >= cutoff.getTime();
}

const RANGES: { id: 'this-month' | 'this-year' | 'all-time'; label: string }[] = [
  { id: 'this-month', label: 'This month' },
  { id: 'this-year', label: 'This year' },
  { id: 'all-time', label: 'All time' },
];

// Ported from screens-main.jsx's own SAVE_CATS/DEBT split — which
// categories count as "money set aside" vs. "debt paid down" for the
// Overview grid, rather than just landing in the generic Expenses total.
const SAVE_CATS = ['invest', 'edu'];
const DEBT_CATS = ['cc', 'emi', 'ploan'];

// Every destination below other than Home/Txns (this screen), TxnDetail,
// Settings, Search and Notifications is a tab this app hasn't built yet.
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[TransactionsScreen] nav ->', dest);
};

function txnMeta(row: StoredTransaction): string {
  return `${row.subtitle} · ${formatTime(row.timestamp)}`;
}

// A transaction that arrives while this screen is open (subscribeToTransactionsChanged
// firing from a live SMS parse) gets this long enough to slide/fade into place
// before the Overview cards below catch up to the new total — see the
// txns/overviewTxns split in TransactionsScreen.
const NEW_ROW_ANIM_MS = 350;

function EnteringRow({ children }: { children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: NEW_ROW_ANIM_MS, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function TransactionsScreen({ navigation }: Props) {
  // Seeded synchronously from SQLite (getRecentTransactionsSync, not the
  // async getRecentTransactions) so the very first render already has real
  // data — no [] -> flash-of-empty-state -> real-data cycle on open.
  const [txns, setTxns] = useState<StoredTransaction[]>(() => getRecentTransactionsSync(500));
  // Overview's own totals lag `txns` by NEW_ROW_ANIM_MS when a *new*
  // transaction lands live, so the row visibly animates in before the
  // income/expense/net figures jump to match — see the load() below.
  const [overviewTxns, setOverviewTxns] = useState<StoredTransaction[]>(txns);
  const [newIds, setNewIds] = useState<Set<number>>(() => new Set());
  const knownIdsRef = useRef<Set<number>>(new Set(txns.map(t => t.id)));
  const [filter, setFilter] = useState('all');
  const [sub, setSub] = useState<string | null>(null);
  const [manualCats, setManualCats] = useState<string[]>([]);
  const [ovRange, setOvRange] = useState<'this-month' | 'this-year' | 'all-time'>('this-month');
  const [listRange, setListRange] = useState<RangeId>('all-time');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<TxnFilters>({ kind: 'all', cats: [], range: 'This month' });

  // Fires on every insert/update/delete anywhere in the app (the SMS
  // pipeline in particular) while this screen is mounted. `txns` updates
  // immediately so the new row renders (and, via `newIds`, animates in);
  // `overviewTxns` — and so the Overview cards — only catches up once that
  // animation has had time to finish. No initial call here: `txns` is
  // already seeded synchronously above with whatever's in SQLite right now.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const load = () => {
      const list = getRecentTransactionsSync(500);
      if (!alive) return;

      const addedIds = list.filter(t => !knownIdsRef.current.has(t.id)).map(t => t.id);
      knownIdsRef.current = new Set(list.map(t => t.id));
      setTxns(list);

      if (addedIds.length === 0) {
        setOverviewTxns(list);
        return;
      }

      setNewIds(new Set(addedIds));
      timer = setTimeout(() => {
        if (!alive) return;
        setOverviewTxns(list);
        setNewIds(new Set());
      }, NEW_ROW_ANIM_MS);
    };

    const unsubscribe = subscribeToTransactionsChanged(load);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Hardcoded to the default framework, same simplification as HomeScreen
  // (no stored user preference for this yet).
  const buckets = useMemo(() => frameworkBuckets('50-30-20'), []);
  const filters = useMemo(
    () => [
      { id: 'all', label: 'All', cats: undefined as string[] | undefined },
      ...buckets.map(b => ({ id: b.id, label: b.label, cats: b.cats as string[] | undefined })),
      { id: 'income', label: 'Income', cats: undefined },
      { id: 'expense', label: 'Expense', cats: undefined },
    ],
    [buckets],
  );
  const activeBucket = filters.find(f => f.id === filter && f.cats) ?? null;

  const filt = useMemo(
    () =>
      txns.filter(t => {
        if (filter === 'income' && t.amount <= 0) return false;
        if (filter === 'expense' && t.amount >= 0) return false;
        if (activeBucket) {
          if (sub ? t.category !== sub : !activeBucket.cats!.includes(t.category)) return false;
        }
        if (manualCats.length && !manualCats.includes(t.category)) return false;
        if (!isInRange(t.timestamp, listRange)) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [txns, filter, sub, manualCats, listRange, activeBucket],
  );

  // Overview card's own totals — driven by the month/year toggle (ovRange)
  // only, independent of the category chips/filter sheet below it. Savings
  // and debt-paid are identified by category (screens-main.jsx's own
  // SAVE_CATS/DEBT split) so "Total expenses" doesn't double-count money
  // that actually went to investing or paying down debt — those get their
  // own stat cards instead.
  const ovTxns = useMemo(() => overviewTxns.filter(t => isInRange(t.timestamp, ovRange)), [overviewTxns, ovRange]);
  const isSaving = (t: StoredTransaction) => t.amount < 0 && SAVE_CATS.includes(t.category);
  const isDebt = (t: StoredTransaction) => t.amount < 0 && DEBT_CATS.includes(t.category);
  const ovIncome = ovTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const ovExpense = ovTxns.filter(t => t.amount < 0 && !isSaving(t) && !isDebt(t)).reduce((s, t) => s + Math.abs(t.amount), 0);
  const ovSavings = ovTxns.filter(isSaving).reduce((s, t) => s + Math.abs(t.amount), 0);
  const ovDebt = ovTxns.filter(isDebt).reduce((s, t) => s + Math.abs(t.amount), 0);
  // Net stays true income-minus-all-outflows (savings/debt included) —
  // the stat grid splits outflows into categories, but the net card below
  // it is a single real cash-flow figure, not a re-sum of the four cards.
  const ovAllExpense = ovTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const ovNet = ovIncome - ovAllExpense;
  const ovRangeLabel = ovRange === 'this-month' ? 'this month' : ovRange === 'this-year' ? 'this year' : 'all time';

  const groups = useMemo(() => {
    const g: Record<string, StoredTransaction[]> = {};
    filt.forEach(t => {
      const key = formatDay(t.timestamp);
      (g[key] ||= []).push(t);
    });
    return g;
  }, [filt]);

  const applyFilterSheet = (f: TxnFilters) => {
    setAppliedFilters(f);
    setFilterSheetOpen(false);
    setFilter(f.kind);
    setSub(null);
    setManualCats(f.cats);
    setListRange(PERIOD_TO_RANGE[f.range]);
    showToast('Filters applied');
  };

  const badgeActive = filter !== 'all' || manualCats.length > 0 || listRange !== 'all-time';

  const handleTab = (id: TabId) => {
    if (id === 'txn') return;
    if (id === 'home') navigation.navigate('Home');
    else if (id === 'budget') navigation.navigate('Budget');
    else if (id === 'bills') navigation.navigate('Bills');
    else if (id === 'split') navigation.navigate('Splits');
    else stubNav(id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <AppHeader
        onMenu={() => navigation.navigate('Settings')}
        onSearch={() => navigation.navigate('Search')}
        onNotify={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingTop: spacing.s4, paddingBottom: 120 }}>
        {/* Overview — section label + the same This month/This year/All
            time toggle already used on this page, a 2x2 stat grid (each
            card its own real total for the selected range), and a single
            net-amount card below — replacing the old flat single-row
            Income/Expense/Net card. */}
        <SectionHeader title="Overview" />

        <View style={{ flexDirection: 'row', gap: 4, padding: 3, marginBottom: spacing.s3, backgroundColor: colors.bgSurface, borderRadius: radii.control, borderWidth: 1, borderColor: colors.borderSubtle }}>
          {RANGES.map(r => (
            <Pressable
              key={r.id}
              onPress={() => setOvRange(r.id)}
              style={{ flex: 1, height: 34, borderRadius: radii.input, alignItems: 'center', justifyContent: 'center', backgroundColor: ovRange === r.id ? colors.navy : 'transparent' }}
            >
              <AppText weight="medium" style={{ fontSize: 12, color: ovRange === r.id ? colors.fgOnDark : colors.fg2 }}>
                {r.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s2 }}>
          {[
            { label: 'Total income', Icon: ArrowDownLeftIcon, value: ovIncome, color: colors.income, bg: colors.incomeBg },
            { label: 'Total expenses', Icon: ArrowUpRightIcon, value: ovExpense, color: colors.expense, bg: colors.expenseBg },
            { label: 'Total savings', Icon: PiggyBankIcon, value: ovSavings, color: CATEGORIES.invest.color, bg: `${CATEGORIES.invest.color}1F` },
            { label: 'Total debt paid', Icon: CreditCardIcon, value: ovDebt, color: CATEGORIES.cc.color, bg: `${CATEGORIES.cc.color}1F` },
          ].map(s => (
            <View key={s.label} style={{ width: '48%', backgroundColor: s.bg, borderRadius: radii.control, padding: spacing.s3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <s.Icon size={13} color={s.color} weight="bold" />
                <AppText weight="medium" style={{ fontSize: 10.5, color: colors.fg2, letterSpacing: 0.1 }}>
                  {s.label}
                </AppText>
              </View>
              <AppText weight="semibold" style={{ fontSize: 16, color: s.color, marginTop: 3, fontVariant: ['tabular-nums'] }}>
                ₹{s.value.toLocaleString('en-IN')}
              </AppText>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: colors.navy, borderRadius: radii.card, padding: spacing.s4, marginBottom: spacing.s4 }}>
          <AppText weight="medium" style={{ fontSize: 10, color: colors.fgOnDark, opacity: 0.7, letterSpacing: 0.1 }}>
            Net amount {ovRangeLabel}
          </AppText>
          <AppText weight="bold" style={{ fontSize: 24, color: colors.fgOnDark, marginTop: 3, fontVariant: ['tabular-nums'] }}>
            {ovNet < 0 ? '−' : ''}₹{Math.abs(ovNet).toLocaleString('en-IN')}
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s3 }}>
          <AppText weight="medium" style={{ fontSize: 20, color: colors.navy }}>
            Transactions
          </AppText>
          <Pressable
            accessibilityLabel="Filter"
            onPress={() => setFilterSheetOpen(true)}
            style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}
          >
            <FunnelIcon size={20} color={colors.fg1} />
            {badgeActive ? (
              <View style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: radii.pill, backgroundColor: colors.gold, borderWidth: 2, borderColor: colors.bgElevated }} />
            ) : null}
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.s2, paddingBottom: 2 }}>
          {filters.map(f => (
            <Chip
              key={f.id}
              active={filter === f.id}
              onPress={() => {
                setFilter(f.id);
                setSub(null);
              }}
            >
              {f.label}
            </Chip>
          ))}
        </ScrollView>

        {activeBucket ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.s2, paddingTop: spacing.s2 }}>
            <Pressable
              onPress={() => setSub(null)}
              style={{ paddingVertical: 5, paddingHorizontal: 12, borderRadius: radii.pill, borderWidth: 1, borderColor: sub ? colors.borderDefault : colors.navy }}
            >
              <AppText weight="medium" style={{ fontSize: 12, color: sub ? colors.fg3 : colors.navy }}>
                All {activeBucket.label.toLowerCase()}
              </AppText>
            </Pressable>
            {activeBucket.cats!.map(id => {
              const c = CATEGORIES[id];
              const on = sub === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setSub(on ? null : id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 5,
                    paddingLeft: 8,
                    paddingRight: 12,
                    borderRadius: radii.pill,
                    borderWidth: 1,
                    borderColor: on ? colors.navy : colors.borderDefault,
                  }}
                >
                  <IconChip icon={CATEGORY_ICONS[id]} size={18} color={c.color} bg={`${c.color}1F`} />
                  <AppText weight="medium" style={{ fontSize: 12, color: on ? colors.navy : colors.fg2 }}>
                    {c.name}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {listRange !== 'all-time' ? (
          <Pressable
            onPress={() => {
              setListRange('all-time');
              setFilter('all');
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: spacing.s3, marginBottom: 2, marginHorizontal: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.borderDefault }}
          >
            <AppText weight="medium" style={{ fontSize: 11.5, color: colors.fg2 }}>
              {RANGE_LABELS[listRange]} · {filters.find(f => f.id === filter)?.label ?? 'All'}
            </AppText>
            <XIcon size={11} color={colors.fg2} />
          </Pressable>
        ) : null}

        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginTop: spacing.s3, marginBottom: 4 }} />

        {Object.keys(groups).length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <MagnifyingGlassIcon size={40} color={colors.fg3} />
            <AppText style={{ fontSize: 14, color: colors.fg3, marginTop: spacing.s2 }}>No transactions match.</AppText>
          </View>
        ) : (
          Object.entries(groups).map(([day, items]) => (
            <View key={day} style={{ marginBottom: spacing.s3 + 2 }}>
              <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.11, marginHorizontal: 4, marginTop: spacing.s2, marginBottom: 6 }}>
                {day}
              </AppText>
              <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 4 }}>
                {items.map((t, i) => {
                  const row = (
                    <TxnRow
                      merchant={t.merchant ?? 'Unknown'}
                      meta={txnMeta(t)}
                      amount={t.amount}
                      cat={t.category}
                      isForeign={t.isForeignTransaction}
                      currency={t.originalCurrency ?? undefined}
                      originalAmount={t.originalAmount ?? undefined}
                      last={i === items.length - 1}
                      onPress={() => navigation.navigate('TxnDetail', { transaction: t })}
                    />
                  );
                  return newIds.has(t.id) ? (
                    <EnteringRow key={t.id}>{row}</EnteringRow>
                  ) : (
                    <View key={t.id}>{row}</View>
                  );
                })}
              </Card>
            </View>
          ))
        )}
      </ScrollView>

      <TabBar active="txn" onChange={handleTab} />

      <TxnFilterSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} onApply={applyFilterSheet} initial={appliedFilters} />
    </SafeAreaView>
  );
}

export default TransactionsScreen;
