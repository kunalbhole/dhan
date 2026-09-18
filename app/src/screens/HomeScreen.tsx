import { useEffect, useState, type ComponentType } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowDownLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowDownLeft';
import { ArrowUpRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowUpRight';
import { MinusCircleIcon } from 'phosphor-react-native/lib/module/icons/MinusCircle';
import { PlusCircleIcon } from 'phosphor-react-native/lib/module/icons/PlusCircle';
import { ChartLineUpIcon } from 'phosphor-react-native/lib/module/icons/ChartLineUp';
import { TargetIcon } from 'phosphor-react-native/lib/module/icons/Target';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import AppHeader from '../components/AppHeader';
import AppText from '../components/AppText';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import StatusPill from '../components/StatusPill';
import TabBar, { type TabId } from '../components/TabBar';
import TxnRow from '../components/TxnRow';
import UncatCard from '../components/UncatCard';
import InsightsTeaser from '../components/InsightsTeaser';
import { colors, radii, shadows, spacing } from '../theme';
import { frameworkBuckets, type FrameworkBucket } from '../lib/frameworks';
import type { Bill } from '../lib/bills';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { getBills, subscribeToBills } from '../lib/billsStore';
import { getGoals, subscribeToGoals } from '../lib/goalsStore';
import { computeSummary } from '../lib/insights';
import { formatIndianNumber, formatTime } from '../lib/format';
import { currentMonthLabel, daysLeftInMonth, daysUntil, formatShortDate, isThisMonth } from '../lib/dateRange';
import { getMonthlyIncome, getFramework, DEFAULT_FRAMEWORK } from '../lib/account';
import { spentOn } from '../lib/budget';
import { getRecentTransactions, getUncategorisedTransactions, subscribeToTransactionsChanged, type StoredTransaction } from '../lib/db';
import type { PhosphorIconProps } from '../components/IconChip';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Reference-hardcoded sample figures (screens-main.jsx's HomeScreen) — this
// app has no user-profile storage yet, so the display name/greeting stay
// as-is. The balance/budget totals below are real now: income comes from
// IncomeSetupScreen, the framework from FrameworkScreen (both persisted in
// src/lib/account.ts), and spend comes from this month's real transactions.
const USER_NAME = 'Priya';
const GREETING = 'Morning';

interface QuickAction {
  id: string;
  label: string;
  icon: ComponentType<PhosphorIconProps>;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'add-exp', label: 'Add expense', icon: MinusCircleIcon, color: colors.expense },
  { id: 'add-inc', label: 'Add income', icon: PlusCircleIcon, color: colors.income },
  { id: 'insights', label: 'Insights', icon: ChartLineUpIcon, color: colors.info },
];

// None of the destinations below (Insights, Goals, Add-txn sheet,
// Uncategorised) exist as screens yet — every interactive element here is
// wired to this stub so the UI is visually and interactively complete
// without crashing on a route that doesn't exist. Replace with real
// navigation.navigate calls as each destination screen gets built. (Txn
// detail, More/Settings, Search, Notifications, Transactions, Budget,
// Bills and Splits are real now — see the TxnRow onPress, AppHeader
// onMenu/onSearch/onNotify, and the Txns/Budget/Bills/Split tabs below.)
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[HomeScreen] nav ->', dest);
};

// Composes a TxnRow subtitle from real stored fields: the parser's own
// descriptive line plus the time, mirroring the reference sample data's
// "<description> · <time>" shape without fabricating anything we don't
// actually know about the transaction.
function txnMeta(row: StoredTransaction): string {
  return `${row.subtitle} · ${formatTime(row.timestamp)}`;
}

function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [allTxns, setAllTxns] = useState<StoredTransaction[]>([]);
  const [uncatTxns, setUncatTxns] = useState<StoredTransaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [bills, setBills] = useState<Bill[]>(getBills());
  const [goals, setGoals] = useState(getGoals());
  const [income, setIncome] = useState<number | null>(null);
  const [framework, setFrameworkId] = useState(DEFAULT_FRAMEWORK);
  const buckets = frameworkBuckets(framework);
  const upcomingBills = bills.filter(b => b.status === 'upcoming' || b.status === 'due-soon').slice(0, 4);
  const recentTxns = allTxns.slice(0, 4);

  useEffect(() => subscribeToBills(() => setBills([...getBills()])), []);
  useEffect(() => subscribeToGoals(() => setGoals([...getGoals()])), []);

  // Onboarding's own choices — reloaded on every focus (not just mount) so
  // a value changed elsewhere (e.g. a future "edit income" screen) shows
  // up here without a full app restart.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Promise.all([getMonthlyIncome(), getFramework()]).then(([storedIncome, storedFramework]) => {
        setIncome(storedIncome);
        setFrameworkId(storedFramework);
      });
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let alive = true;
    const load = () => {
      // A high limit rather than a second query — this month's spend needs
      // every transaction, not just the 4 shown in "Recent transactions".
      Promise.all([getRecentTransactions(1000), getUncategorisedTransactions(12)])
        .then(([all, uncat]) => {
          if (!alive) return;
          setAllTxns(all);
          setUncatTxns(uncat);
          setLoaded(true);
        })
        .catch(() => {
          if (alive) setLoaded(true);
        });
    };
    load();
    // Fires after every successful insert — SMS parsing runs at the app
    // root (App.tsx), decoupled from whichever screen is on top, so this
    // is how Home picks up a transaction that arrives while it's mounted.
    const unsubscribe = subscribeToTransactionsChanged(load);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const monthTxns = allTxns.filter(t => isThisMonth(t.timestamp));
  const budgetCapTotal = income ?? 0;
  const budgetSpentTotal = monthTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const budgetLeft = Math.max(0, budgetCapTotal - budgetSpentTotal);
  const budgetPct = budgetCapTotal > 0 ? Math.min(100, Math.round((budgetSpentTotal / budgetCapTotal) * 100)) : 0;
  const balanceIn = income ?? 0;
  const balanceOut = budgetSpentTotal;
  const balance = balanceIn - balanceOut;
  const weekRecap = computeSummary(allTxns, 'week');
  const goalsSaved = goals.reduce((s, g) => s + g.saved, 0);
  const goalsTarget = goals.reduce((s, g) => s + g.target, 0);
  const goalsPct = goalsTarget > 0 ? Math.round((goalsSaved / goalsTarget) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <AppHeader onMenu={() => navigation.navigate('Settings')} onSearch={() => navigation.navigate('Search')} onNotify={() => navigation.navigate('Notifications')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingTop: spacing.s2, paddingBottom: spacing.s6 }}>
        {/* Greeting — the "+" that used to sit here moved into AppHeader
            (GlobalAddSheet.tsx), shared across every screen. */}
        <View style={{ paddingVertical: spacing.s2, paddingHorizontal: 4, marginBottom: spacing.s2 }}>
          <AppText style={{ fontSize: 13, color: colors.fg3 }}>{GREETING},</AppText>
          <AppText weight="bold" style={{ fontSize: 20 }}>
            {USER_NAME} 👋
          </AppText>
        </View>

        {/* Balance hero */}
        <View
          style={[
            {
              backgroundColor: colors.navy,
              borderRadius: radii.cardLg,
              padding: spacing.s5,
              marginBottom: spacing.s4,
            },
            shadows.md,
          ]}
        >
          <AppText weight="semibold" style={{ fontSize: 11, color: colors.fgOnDark, opacity: 0.7 }}>
            Balance · {currentMonthLabel()}
          </AppText>
          <AppText weight="bold" style={{ fontSize: 34, color: colors.fgOnDark, marginTop: 6, marginBottom: 14, fontVariant: ['tabular-nums'] }}>
            {balance < 0 ? '−' : ''}₹{formatIndianNumber(balance)}
            <AppText weight="bold" style={{ fontSize: 18, color: colors.fgOnDark, opacity: 0.6 }}>
              .00
            </AppText>
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
            <View style={heroPillStyle('rgba(255,217,119,0.15)')}>
              <ArrowDownLeftIcon size={14} color={colors.goldSoft} />
              <AppText weight="semibold" style={{ fontSize: 12, color: colors.goldSoft }}>
                + ₹{formatIndianNumber(balanceIn)}
              </AppText>
            </View>
            <View style={heroPillStyle('rgba(255,255,255,0.1)')}>
              <ArrowUpRightIcon size={14} color={colors.fgOnDark} />
              <AppText weight="semibold" style={{ fontSize: 12, color: colors.fgOnDark }}>
                − ₹{formatIndianNumber(balanceOut)}
              </AppText>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: spacing.s2, marginBottom: spacing.s4 }}>
          {QUICK_ACTIONS.map(q => {
            const Icon = q.icon;
            return (
              <Pressable
                key={q.id}
                onPress={() => stubNav(q.id)}
                style={{
                  flex: 1,
                  backgroundColor: colors.bgElevated,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  borderRadius: radii.cardSm,
                  paddingVertical: spacing.s3,
                  paddingHorizontal: 6,
                  alignItems: 'center',
                  gap: spacing.s2,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: radii.control,
                    backgroundColor: `${q.color}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={q.color} />
                </View>
                <AppText weight="semibold" style={{ fontSize: 11, color: colors.fg2, textAlign: 'center', lineHeight: 13.2 }}>
                  {q.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Uncategorised — UncatCard itself renders nothing when the list
            is empty, which is the correct empty state for this nudge card. */}
        <UncatCard
          list={uncatTxns.map(t => ({ id: String(t.id), m: t.merchant ?? 'Unknown', s: txnMeta(t), a: t.amount }))}
          onCategorise={() => stubNav('uncat')}
        />

        {/* This month's budget */}
        <SectionHeader title="This month's budget" onSeeAll={() => navigation.navigate('Budget')} />
        <Card style={{ marginBottom: spacing.s4 }}>
          <View style={{ marginBottom: spacing.s3 }}>
            <AppText weight="bold" style={{ fontSize: 24, fontVariant: ['tabular-nums'] }}>
              ₹{formatIndianNumber(budgetSpentTotal)}{' '}
              <AppText style={{ fontSize: 14, color: colors.fg3 }}>of ₹{formatIndianNumber(budgetCapTotal)}</AppText>
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
              ₹{formatIndianNumber(budgetLeft)} left · {daysLeftInMonth()} days to go
            </AppText>
          </View>
          <View style={{ height: 8, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden', marginBottom: spacing.s3 + 2 }}>
            <View style={{ width: `${budgetPct}%`, height: '100%', backgroundColor: colors.navy, borderRadius: radii.pill }} />
          </View>
          {buckets.map((b: FrameworkBucket) => {
            const cap = Math.round((budgetCapTotal * b.pct) / 100);
            const spent = spentOn(monthTxns, b.cats);
            const over = spent > cap;
            const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
            return (
              <View key={b.id} style={{ marginTop: spacing.s3 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s2 }}>
                    <View style={{ width: 10, height: 10, borderRadius: radii.pill, backgroundColor: b.color }} />
                    <AppText weight="medium" style={{ fontSize: 13 }}>
                      {b.label} <AppText style={{ fontSize: 11.5, color: colors.fg3 }}>{b.pct}%</AppText>
                    </AppText>
                  </View>
                  <AppText weight="semibold" style={{ fontSize: 12, fontVariant: ['tabular-nums'] }}>
                    <AppText weight="semibold" style={{ fontSize: 12, color: over ? colors.expense : colors.fg1 }}>
                      ₹{formatIndianNumber(spent)}
                    </AppText>{' '}
                    <AppText style={{ fontSize: 12, color: colors.fg3 }}>/ ₹{formatIndianNumber(cap)}</AppText>
                  </AppText>
                </View>
                <View style={{ height: 6, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden' }}>
                  <View style={{ width: `${pct}%`, height: '100%', backgroundColor: over ? colors.expense : b.color, borderRadius: radii.pill }} />
                </View>
              </View>
            );
          })}
        </Card>

        {/* Recent transactions — a fresh install genuinely has none until
            real SMS come in, so this is an explicit empty state rather
            than an empty/missing card (unlike UncatCard, "Recent
            transactions" is a permanent section per CLAUDE.md's fixed
            order, not a conditional nudge). Nothing renders until the
            first load resolves, to avoid a flash of the empty state. */}
        <SectionHeader title="Recent transactions" onSeeAll={() => navigation.navigate('Transactions')} />
        <Card style={{ paddingVertical: 4, paddingHorizontal: spacing.s4, marginBottom: spacing.s4 }}>
          {!loaded ? null : recentTxns.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.s5, gap: spacing.s2 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radii.control,
                  backgroundColor: colors.bgSurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ReceiptIcon size={22} color={colors.fg3} />
              </View>
              <AppText weight="medium" style={{ fontSize: 14 }}>
                No transactions yet
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, textAlign: 'center' }}>
                They&apos;ll show up here automatically once we detect a bank SMS.
              </AppText>
            </View>
          ) : (
            recentTxns.map((t, i) => (
              <TxnRow
                key={t.id}
                merchant={t.merchant ?? 'Unknown'}
                meta={txnMeta(t)}
                amount={t.amount}
                cat={t.category}
                isForeign={t.isForeignTransaction}
                currency={t.originalCurrency ?? undefined}
                originalAmount={t.originalAmount ?? undefined}
                onPress={() => navigation.navigate('TxnDetail', { transaction: t })}
                last={i === recentTxns.length - 1}
              />
            ))
          )}
        </Card>

        {/* Insights teaser — real this-week spend + delta vs last week
            (computeSummary), not insights.jsx's hardcoded ₹8,210/-12%. */}
        <InsightsTeaser spent={weekRecap.spent} deltaPct={weekRecap.deltaPct} onPress={() => navigation.navigate('Insights')} />

        {/* Savings goals — real persisted goals (goalsStore.ts); a fresh
            install has none yet, so this reflects that instead of the
            reference's hardcoded "4 active goals · ₹4,47,000 saved". */}
        <SectionHeader title="Savings goals" onSeeAll={() => navigation.navigate('Goals')} />
        <Card onPress={() => navigation.navigate('Goals')} style={{ padding: spacing.s3 + 2, marginBottom: spacing.s4, flexDirection: 'row', alignItems: 'center', gap: spacing.s3 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.control,
              backgroundColor: colors.goldBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TargetIcon size={22} color={colors.gold} weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText weight="semibold" style={{ fontSize: 14 }}>
              {goals.length > 0 ? `${goals.length} active goal${goals.length === 1 ? '' : 's'}` : 'No goals yet'}
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
              {goals.length > 0 ? `₹${goalsSaved.toLocaleString('en-IN')} saved · ${goalsPct}% to ₹${goalsTarget.toLocaleString('en-IN')} target` : 'Set a target for something you’re saving toward'}
            </AppText>
          </View>
          <CaretRightIcon size={16} color={colors.fg3} />
        </Card>

        {/* Upcoming bills */}
        <SectionHeader title="Upcoming bills" onSeeAll={() => navigation.navigate('Bills')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 4, paddingBottom: 4 }}
          style={{ marginHorizontal: -spacing.s4, paddingHorizontal: spacing.s4 }}
        >
          {upcomingBills.map(b => {
            const Icon = CATEGORY_ICONS[b.category] ?? CATEGORY_ICONS.other;
            const dueIn = daysUntil(b.dueDate);
            return (
              <View
                key={b.id}
                style={[
                  {
                    backgroundColor: colors.bgElevated,
                    borderRadius: radii.cardSm,
                    padding: spacing.s3 + 2,
                    minWidth: 160,
                    gap: 6,
                  },
                  shadows.card,
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.input,
                      backgroundColor: colors.bgSurface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color={colors.navy} />
                  </View>
                  <StatusPill tone={b.status === 'due-soon' ? 'warning' : 'info'}>{dueIn <= 0 ? 'Today' : `${dueIn}d`}</StatusPill>
                </View>
                <AppText weight="semibold" style={{ fontSize: 13 }}>
                  {b.name}
                </AppText>
                <AppText style={{ fontSize: 11, color: colors.fg3 }}>Due {formatShortDate(b.dueDate)}</AppText>
                <AppText weight="semibold" style={{ fontSize: 15, marginTop: 2, fontVariant: ['tabular-nums'] }}>
                  ₹{formatIndianNumber(b.amt)}
                </AppText>
              </View>
            );
          })}
        </ScrollView>
      </ScrollView>

      <TabBar
        active={activeTab}
        onChange={id => {
          if (id === 'home') setActiveTab(id);
          else if (id === 'txn') navigation.navigate('Transactions');
          else if (id === 'budget') navigation.navigate('Budget');
          else if (id === 'bills') navigation.navigate('Bills');
          else if (id === 'split') navigation.navigate('Splits');
          else stubNav(id);
        }}
      />
    </SafeAreaView>
  );
}

function heroPillStyle(background: string) {
  return {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: background,
  };
}

export default HomeScreen;
