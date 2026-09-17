import { useEffect, useState, type ComponentType } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PlusIcon } from 'phosphor-react-native/lib/module/icons/Plus';
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
import { frameworkBuckets } from '../lib/frameworks';
import { UPCOMING_BILLS } from '../lib/sampleData';
import { BILL_ICONS } from '../lib/billIcons';
import { formatIndianNumber, formatTime } from '../lib/format';
import { getRecentTransactions, getUncategorisedTransactions, subscribeToTransactionsChanged, type StoredTransaction } from '../lib/db';
import type { PhosphorIconProps } from '../components/IconChip';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Reference-hardcoded sample figures (screens-main.jsx's HomeScreen).
// Recent transactions and Uncategorised below are now backed by the real
// SQLite table (src/lib/db.ts); these balance/budget totals still aren't —
// that needs a real ledger/budget-cap model this app doesn't have yet.
const USER_NAME = 'Priya';
const GREETING = 'Morning';
const BALANCE = 124500;
const BALANCE_IN = 82500;
const BALANCE_OUT = 32180;
const BUDGET_CAP_TOTAL = 50000;
const BUDGET_SPENT_TOTAL = 32180;
const BUDGET_LEFT = 17820;
const BUDGET_DAYS_LEFT = 11;
const BUDGET_PCT = 64;

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

// None of the destinations below (More, Search, Notifications, Insights,
// Budget, Transactions, Goals, Bills, Add-txn sheet) exist as screens yet
// — every interactive element here is wired to this stub so the UI is
// visually and interactively complete without crashing on a route that
// doesn't exist. Replace with real navigation.navigate calls as each
// destination screen gets built. (Txn detail is real now — see the
// TxnRow onPress below.)
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
  const [recentTxns, setRecentTxns] = useState<StoredTransaction[]>([]);
  const [uncatTxns, setUncatTxns] = useState<StoredTransaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const buckets = frameworkBuckets('50-30-20');
  const upcomingBills = UPCOMING_BILLS.filter(b => b.status !== 'paid').slice(0, 4);

  useEffect(() => {
    let alive = true;
    const load = () => {
      Promise.all([getRecentTransactions(4), getUncategorisedTransactions(12)])
        .then(([recent, uncat]) => {
          if (!alive) return;
          setRecentTxns(recent);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <AppHeader onMenu={() => stubNav('more')} onSearch={() => stubNav('search')} onNotify={() => stubNav('notifications')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingTop: spacing.s2, paddingBottom: spacing.s6 }}>
        {/* Greeting + Add */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.s2, paddingHorizontal: 4, marginBottom: spacing.s2 }}>
          <View>
            <AppText style={{ fontSize: 13, color: colors.fg3 }}>{GREETING},</AppText>
            <AppText weight="bold" style={{ fontSize: 20 }}>
              {USER_NAME} 👋
            </AppText>
          </View>
          <Pressable
            accessibilityLabel="Add"
            onPress={() => stubNav('add-txn')}
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.input,
              backgroundColor: colors.bgElevated,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon size={20} color={colors.navy} />
          </Pressable>
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
            Balance · April
          </AppText>
          <AppText weight="bold" style={{ fontSize: 34, color: colors.fgOnDark, marginTop: 6, marginBottom: 14, fontVariant: ['tabular-nums'] }}>
            ₹{formatIndianNumber(BALANCE)}
            <AppText weight="bold" style={{ fontSize: 18, color: colors.fgOnDark, opacity: 0.6 }}>
              .00
            </AppText>
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
            <View style={heroPillStyle('rgba(255,217,119,0.15)')}>
              <ArrowDownLeftIcon size={14} color={colors.goldSoft} />
              <AppText weight="semibold" style={{ fontSize: 12, color: colors.goldSoft }}>
                + ₹{formatIndianNumber(BALANCE_IN)}
              </AppText>
            </View>
            <View style={heroPillStyle('rgba(255,255,255,0.1)')}>
              <ArrowUpRightIcon size={14} color={colors.fgOnDark} />
              <AppText weight="semibold" style={{ fontSize: 12, color: colors.fgOnDark }}>
                − ₹{formatIndianNumber(BALANCE_OUT)}
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
        <SectionHeader title="This month's budget" onSeeAll={() => stubNav('budget')} />
        <Card style={{ marginBottom: spacing.s4 }}>
          <View style={{ marginBottom: spacing.s3 }}>
            <AppText weight="bold" style={{ fontSize: 24, fontVariant: ['tabular-nums'] }}>
              ₹{formatIndianNumber(BUDGET_SPENT_TOTAL)}{' '}
              <AppText style={{ fontSize: 14, color: colors.fg3 }}>of ₹{formatIndianNumber(BUDGET_CAP_TOTAL)}</AppText>
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
              ₹{formatIndianNumber(BUDGET_LEFT)} left · {BUDGET_DAYS_LEFT} days to go
            </AppText>
          </View>
          <View style={{ height: 8, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden', marginBottom: spacing.s3 + 2 }}>
            <View style={{ width: `${BUDGET_PCT}%`, height: '100%', backgroundColor: colors.navy, borderRadius: radii.pill }} />
          </View>
          {buckets.map(b => {
            const cap = Math.round((BUDGET_CAP_TOTAL * b.pct) / 100);
            const over = b.spent > cap;
            const pct = Math.min(100, Math.round((b.spent / cap) * 100));
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
                      ₹{formatIndianNumber(b.spent)}
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
        <SectionHeader title="Recent transactions" onSeeAll={() => stubNav('txn')} />
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

        {/* Insights teaser */}
        <InsightsTeaser onPress={() => stubNav('insights')} />

        {/* Savings goals */}
        <SectionHeader title="Savings goals" onSeeAll={() => stubNav('goals')} />
        <Card onPress={() => stubNav('goals')} style={{ padding: spacing.s3 + 2, marginBottom: spacing.s4, flexDirection: 'row', alignItems: 'center', gap: spacing.s3 }}>
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
              4 active goals
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>₹4,47,000 saved · 37% to ₹12L target</AppText>
          </View>
          <CaretRightIcon size={16} color={colors.fg3} />
        </Card>

        {/* Upcoming bills */}
        <SectionHeader title="Upcoming bills" onSeeAll={() => stubNav('bills')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 4, paddingBottom: 4 }}
          style={{ marginHorizontal: -spacing.s4, paddingHorizontal: spacing.s4 }}
        >
          {upcomingBills.map(b => {
            const Icon = BILL_ICONS[b.icon];
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
                  <StatusPill tone={b.status === 'due-soon' ? 'warning' : 'info'}>{b.dueIn <= 0 ? 'Today' : `${b.dueIn}d`}</StatusPill>
                </View>
                <AppText weight="semibold" style={{ fontSize: 13 }}>
                  {b.name}
                </AppText>
                <AppText style={{ fontSize: 11, color: colors.fg3 }}>Due {b.due}</AppText>
                <AppText weight="semibold" style={{ fontSize: 15, marginTop: 2, fontVariant: ['tabular-nums'] }}>
                  ₹{formatIndianNumber(b.amt)}
                </AppText>
              </View>
            );
          })}
        </ScrollView>
      </ScrollView>

      <TabBar active={activeTab} onChange={id => (id === 'home' ? setActiveTab(id) : stubNav(id))} />
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
