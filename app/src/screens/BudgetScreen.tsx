import { useEffect, useState, type ComponentType } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaretLeftIcon } from 'phosphor-react-native/lib/module/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import { CaretDownIcon } from 'phosphor-react-native/lib/module/icons/CaretDown';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/lib/module/icons/DotsThreeVertical';
import { UserIcon } from 'phosphor-react-native/lib/module/icons/User';
import { TargetIcon } from 'phosphor-react-native/lib/module/icons/Target';
import { PencilSimpleIcon } from 'phosphor-react-native/lib/module/icons/PencilSimple';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import { LockSimpleIcon } from 'phosphor-react-native/lib/module/icons/LockSimple';
import { ChartLineUpIcon } from 'phosphor-react-native/lib/module/icons/ChartLineUp';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import { HandCoinsIcon } from 'phosphor-react-native/lib/module/icons/HandCoins';
import AppHeader from '../components/AppHeader';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import GoldButton from '../components/GoldButton';
import IconChip from '../components/IconChip';
import Ring from '../components/Ring';
import StatusPill, { type StatusPillTone } from '../components/StatusPill';
import BottomSheet from '../components/BottomSheet';
import TabBar, { type TabId } from '../components/TabBar';
import UncatCard from '../components/UncatCard';
import { colors, radii, spacing } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { FRAMEWORKS, frameworkBuckets, type FrameworkBucket } from '../lib/frameworks';
import { BUDGET_CATEGORIES, SAVINGS_SUBS, PROJECT_BUDGETS, type ProjectBudget } from '../lib/sampleData';
import { formatTime } from '../lib/format';
import { currentMonthYear, daysLeftInMonth, isThisMonth } from '../lib/dateRange';
import { getMonthlyIncome, getFramework, DEFAULT_FRAMEWORK } from '../lib/account';
import { spentOn } from '../lib/budget';
import { showToast } from '../lib/toast';
import { getRecentTransactions, getUncategorisedTransactions, subscribeToTransactionsChanged, type StoredTransaction } from '../lib/db';
import type { PhosphorIconProps } from '../components/IconChip';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Budget'>;

// There's no per-month transaction history yet (same status as
// HomeScreen's balance card before it was wired up) — one real entry for
// the actual current month, rather than a browsable range of fabricated
// ones like the reference's fixed 3-month window.
const MONTHS = [currentMonthYear()];

const PROJECT_PALETTE = [colors.navy, colors.gold, colors.income, '#6A8FD4', '#C97BB6', '#E88B5C', '#5CB4A8', '#B079D9'];
const lineColor = (i: number) => PROJECT_PALETTE[i % PROJECT_PALETTE.length];

const SAVINGS_SUB_ICONS: Record<string, ComponentType<PhosphorIconProps>> = {
  invest: ChartLineUpIcon,
  insurance: ShieldCheckIcon,
  debt: HandCoinsIcon,
};

interface SubRow {
  key: string;
  name: string;
  spent: number;
  cap: number;
  color: string;
  icon: ComponentType<PhosphorIconProps>;
  cat?: string;
}

function bucketSubs(bk: FrameworkBucket): SubRow[] {
  if (bk.id === 'savings') {
    return SAVINGS_SUBS.map(s => ({ key: s.id, name: s.name, spent: s.spent, cap: s.cap, color: s.color, icon: SAVINGS_SUB_ICONS[s.id] }));
  }
  return BUDGET_CATEGORIES.filter(b => bk.cats.includes(b.cat)).map(b => ({
    key: b.cat,
    name: CATEGORIES[b.cat].name,
    spent: b.spent,
    cap: b.cap,
    color: CATEGORIES[b.cat].color,
    icon: CATEGORY_ICONS[b.cat],
    cat: b.cat,
  }));
}

// Every destination below other than Home/Budget (this screen), Txns,
// Settings, Search and Notifications is a screen or flow this app hasn't
// built yet — the full budget editor, project-budget creation/editing,
// category transaction drill-down, and the Plus paywall.
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[BudgetScreen] nav ->', dest);
};

// PlusLock's tag="left" treatment (components.jsx) — a small "DHAN PLUS"
// pill before a dimmed action, tapping opens the paywall. This app has no
// subscription state yet — every user is effectively free-tier — so this
// is the only state "Edit categories" ever renders.
function LockedEditButton() {
  return (
    <Pressable
      onPress={() => stubNav('paywall')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s2 }}
    >
      <View style={{ borderWidth: 1, borderColor: colors.gold, borderRadius: radii.pill, paddingVertical: 3, paddingHorizontal: 8 }}>
        <AppText weight="semibold" style={{ fontSize: 9, color: colors.gold, letterSpacing: 0.7 }}>
          DHAN PLUS
        </AppText>
      </View>
      <View style={{ opacity: 0.6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <GoldButton onPress={() => stubNav('paywall')} iconRight={LockSimpleIcon}>
          Edit categories
        </GoldButton>
      </View>
    </Pressable>
  );
}

function segmentBar(items: { name: string; pct: number; color: string }[]) {
  return (
    <View style={{ height: 10, backgroundColor: 'rgba(20,28,65,0.08)', borderRadius: radii.pill, overflow: 'hidden', flexDirection: 'row', marginTop: spacing.s3 - 2 }}>
      {items.map(x => (
        <View key={x.name} style={{ width: `${Math.round(x.pct)}%`, backgroundColor: x.color }} />
      ))}
    </View>
  );
}

function BudgetScreen({ navigation }: Props) {
  const [month, setMonth] = useState(MONTHS[0]);
  const [monthPickOpen, setMonthPickOpen] = useState(false);
  const [openBudget, setOpenBudget] = useState<string | null>('personal');
  const [cardMenu, setCardMenu] = useState<string | null>(null);
  const [delBudget, setDelBudget] = useState<ProjectBudget | null>(null);
  const [expanded, setExpanded] = useState<string | null>('needs');
  const [projects, setProjects] = useState<ProjectBudget[]>(PROJECT_BUDGETS);
  const [uncatTxns, setUncatTxns] = useState<StoredTransaction[]>([]);
  const [allTxns, setAllTxns] = useState<StoredTransaction[]>([]);
  const [income, setIncome] = useState<number | null>(null);
  const [framework, setFrameworkId] = useState(DEFAULT_FRAMEWORK);

  useEffect(() => {
    const load = () => {
      getUncategorisedTransactions(12).then(setUncatTxns);
      getRecentTransactions(1000).then(setAllTxns);
    };
    load();
    return subscribeToTransactionsChanged(load);
  }, []);

  // Mirrors HomeScreen: reloaded on every focus so a change made elsewhere
  // (e.g. a future "edit income" screen) shows up here without a restart.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Promise.all([getMonthlyIncome(), getFramework()]).then(([storedIncome, storedFramework]) => {
        setIncome(storedIncome);
        setFrameworkId(storedFramework);
      });
    });
    return unsubscribe;
  }, [navigation]);

  const fwMeta = FRAMEWORKS.find(f => f.id === framework) ?? FRAMEWORKS[0];
  const fwBuckets = frameworkBuckets(framework);
  const mIdx = MONTHS.indexOf(month);

  const monthTxns = allTxns.filter(t => isThisMonth(t.timestamp));
  const totalCap = income ?? 0;
  const totalSpent = monthTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const overallPct = totalCap ? (totalSpent / totalCap) * 100 : 0;

  const handleTab = (id: TabId) => {
    if (id === 'budget') return;
    if (id === 'home') navigation.navigate('Home');
    else if (id === 'txn') navigation.navigate('Transactions');
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

      <View style={{ paddingHorizontal: spacing.s4, paddingTop: 4, paddingBottom: spacing.s4 }}>
        {/* "Create new budget" moved into AppHeader (GlobalAddSheet.tsx),
            shared across every screen — this title row used to also carry
            a "+ Create new budget" GoldButton (also just a stub). */}
        <AppText weight="medium" style={{ fontSize: 20, color: colors.navy, marginBottom: spacing.s4 }}>
          Budget
        </AppText>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bgElevated,
            borderRadius: radii.control,
            paddingHorizontal: spacing.s2,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <Pressable
            disabled={mIdx <= 0}
            onPress={() => mIdx > 0 && setMonth(MONTHS[mIdx - 1])}
            style={{ width: 36, height: 36, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', opacity: mIdx > 0 ? 1 : 0.3 }}
          >
            <CaretLeftIcon size={16} color={colors.fg1} />
          </Pressable>
          <Pressable onPress={() => setMonthPickOpen(true)} accessibilityLabel="Choose month" style={{ paddingVertical: spacing.s2, paddingHorizontal: spacing.s3 }}>
            <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy }}>
              {month}
            </AppText>
          </Pressable>
          <Pressable
            disabled={mIdx >= MONTHS.length - 1}
            onPress={() => mIdx < MONTHS.length - 1 && setMonth(MONTHS[mIdx + 1])}
            style={{ width: 36, height: 36, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', opacity: mIdx < MONTHS.length - 1 ? 1 : 0.3 }}
          >
            <CaretRightIcon size={16} color={colors.fg1} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        <UncatCard
          list={uncatTxns.map(t => ({ id: String(t.id), m: t.merchant ?? 'Unknown', s: `${t.subtitle} · ${formatTime(t.timestamp)}`, a: t.amount }))}
          onCategorise={() => stubNav('uncat')}
        />

        {/* Personal budget */}
        <Card onPress={() => setOpenBudget(o => (o === 'personal' ? null : 'personal'))} style={{ marginBottom: spacing.s4, padding: spacing.s3 + 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 - 2 }}>
            <IconChip icon={UserIcon} size={36} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy }}>
                Personal
              </AppText>
              <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: 1 }}>{fwMeta.name} framework</AppText>
            </View>
            <Pressable
              accessibilityLabel="Personal budget actions"
              onPress={() => setCardMenu('personal')}
              style={{ width: 40, height: 40, marginLeft: 4, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' }}
            >
              <DotsThreeVerticalIcon size={18} color={colors.fg2} />
            </Pressable>
          </View>
          <View style={{ height: 6, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden', marginTop: spacing.s3 - 2 }}>
            <View style={{ width: `${Math.min(overallPct, 100)}%`, height: '100%', borderRadius: radii.pill, backgroundColor: overallPct > 100 ? colors.expense : colors.navy }} />
          </View>
          <AppText weight="semibold" style={{ fontSize: 11.5, marginTop: spacing.s2, textAlign: 'right', color: colors.navy, fontVariant: ['tabular-nums'] }}>
            ₹{totalSpent.toLocaleString('en-IN')} <AppText style={{ fontSize: 11.5, color: colors.fg3 }}>/ ₹{totalCap.toLocaleString('en-IN')}</AppText>
          </AppText>
        </Card>

        {openBudget === 'personal' ? (
          <>
            <Card style={{ marginBottom: spacing.s4, padding: spacing.s5 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                <Ring value={totalSpent} max={totalCap} size={120} stroke={12} color={overallPct > 100 ? colors.expense : colors.navy}>
                  <View style={{ alignItems: 'center' }}>
                    <AppText weight="bold" style={{ fontSize: 22, fontVariant: ['tabular-nums'] }}>
                      {Math.round(overallPct)}%
                    </AppText>
                    <AppText weight="semibold" style={{ fontSize: 10, color: colors.fg3, marginTop: -2 }}>
                      of budget
                    </AppText>
                  </View>
                </Ring>
                <View style={{ flex: 1 }}>
                  <AppText weight="semibold" style={{ fontSize: 12, color: colors.fg3, letterSpacing: 0.1 }}>
                    Spent
                  </AppText>
                  <AppText weight="bold" style={{ fontSize: 22, fontVariant: ['tabular-nums'] }}>
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>of ₹{totalCap.toLocaleString('en-IN')} total</AppText>
                  <AppText style={{ fontSize: 12, color: colors.fg2, marginTop: spacing.s2 + 2, lineHeight: 17 }}>
                    You&apos;ve got{' '}
                    <AppText weight="bold" style={{ fontSize: 12, color: colors.income }}>
                      ₹{Math.max(0, totalCap - totalSpent).toLocaleString('en-IN')}
                    </AppText>{' '}
                    left for {daysLeftInMonth()} days.
                  </AppText>
                </View>
              </View>
            </Card>

            <Card style={{ marginBottom: spacing.s4, padding: spacing.s4, backgroundColor: colors.goldBg }}>
              <AppText weight="medium" style={{ fontSize: 11, color: colors.fg2, letterSpacing: 0.1 }}>
                {fwMeta.name} framework
              </AppText>
              {segmentBar(fwBuckets.map(b => ({ name: b.id, pct: b.pct, color: b.color })))}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.s3 - 2 }}>
                {fwBuckets.map(b => (
                  <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: spacing.s2 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: b.color }} />
                    <AppText weight="semibold" style={{ fontSize: 11, color: colors.fg2 }}>
                      {b.label} {b.pct}%
                    </AppText>
                  </View>
                ))}
              </View>
            </Card>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 4, marginBottom: spacing.s4 }}>
              <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1 }}>
                By category
              </AppText>
              <LockedEditButton />
            </View>

            {fwBuckets.map(bk => {
              const subs = bucketSubs(bk);
              // Real, from this month's transactions — same source as the
              // Personal card above and HomeScreen's own bucket rows. The
              // per-category breakdown inside `subs` stays sample data:
              // there's no real per-category cap-setting feature yet, only
              // the 3-bucket split from onboarding's framework choice.
              const spent = spentOn(monthTxns, bk.cats);
              const cap = Math.round((totalCap * bk.pct) / 100);
              const pct = cap ? Math.round((spent / cap) * 100) : 0;
              const over = spent > cap;
              const warning = pct >= 80 && !over;
              const tone: StatusPillTone = over ? 'expense' : warning ? 'warning' : 'income';
              const label = over ? 'Overspent' : warning ? 'Warning' : 'On track';
              const isOpen = expanded === bk.id;
              const BkIcon = bk.icon;
              return (
                <Card key={bk.id} style={{ marginBottom: spacing.s4, padding: spacing.s3 + 2 }}>
                  <Pressable onPress={() => setExpanded(o => (o === bk.id ? null : bk.id))}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.s3 - 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 - 2, flex: 1, minWidth: 0 }}>
                        <IconChip icon={BkIcon} size={36} color={bk.color} bg={bk.tint} />
                        <View style={{ minWidth: 0 }}>
                          <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy }}>
                            {bk.label}
                          </AppText>
                          <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: 1, fontVariant: ['tabular-nums'] }}>
                            ₹{spent.toLocaleString('en-IN')} of ₹{cap.toLocaleString('en-IN')}
                          </AppText>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s2 }}>
                        <StatusPill tone={tone}>{label}</StatusPill>
                        <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
                          <CaretDownIcon size={14} color={colors.fg3} />
                        </View>
                      </View>
                    </View>
                    <View style={{ height: 6, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden', marginTop: spacing.s3 - 2 }}>
                      <View style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: radii.pill, backgroundColor: over ? colors.expense : warning ? colors.warning : bk.color }} />
                    </View>
                  </Pressable>

                  {isOpen ? (
                    <View style={{ marginTop: spacing.s4, paddingLeft: spacing.s3, borderLeftWidth: 1, borderLeftColor: colors.borderSubtle }}>
                      {subs.length === 0 ? (
                        <AppText style={{ fontSize: 12.5, color: colors.fg3, paddingLeft: spacing.s2 }}>
                          Transfers to savings goals · ₹{(bk.spent || 0).toLocaleString('en-IN')} this month
                        </AppText>
                      ) : (
                        subs.map((sub, i) => {
                          const sp = sub.cap ? Math.round((sub.spent / sub.cap) * 100) : 0;
                          const so = sub.spent > sub.cap;
                          const SubIcon = sub.icon;
                          return (
                            <Pressable
                              key={sub.key}
                              onPress={() => stubNav('cat-txns')}
                              style={{ marginTop: i === 0 ? 0 : spacing.s3, paddingLeft: spacing.s2 }}
                            >
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.s3 - 2, marginBottom: 6 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s2, flex: 1, minWidth: 0 }}>
                                  <IconChip icon={SubIcon} size={26} color={sub.color} bg={`${sub.color}1F`} />
                                  <AppText style={{ fontSize: 13, color: colors.fg2 }}>{sub.name}</AppText>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <AppText weight="semibold" style={{ fontSize: 11.5, color: so ? colors.expense : colors.navy, fontVariant: ['tabular-nums'] }}>
                                    ₹{sub.spent.toLocaleString('en-IN')} <AppText style={{ fontSize: 11.5, color: colors.fg3 }}>/ ₹{sub.cap.toLocaleString('en-IN')}</AppText>
                                  </AppText>
                                  <CaretRightIcon size={12} color={colors.fg4} />
                                </View>
                              </View>
                              <View style={{ height: 4, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden' }}>
                                <View style={{ width: `${Math.min(sp, 100)}%`, height: '100%', borderRadius: radii.pill, backgroundColor: so ? colors.expense : sub.color }} />
                              </View>
                            </Pressable>
                          );
                        })
                      )}
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </>
        ) : null}

        {/* Project budgets */}
        {projects.map(p => {
          const spent = p.lines.reduce((s, l) => s + l.spent, 0);
          const cap = p.lines.reduce((s, l) => s + l.cap, 0);
          const pct = cap ? Math.round((spent / cap) * 100) : 0;
          const over = spent > cap;
          const isOpen = openBudget === p.id;
          return (
            <View key={p.id}>
              <Card onPress={() => setOpenBudget(o => (o === p.id ? null : p.id))} style={{ marginBottom: isOpen ? spacing.s2 : spacing.s4, padding: spacing.s3 + 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 - 2 }}>
                  <IconChip icon={TargetIcon} size={36} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy }} numberOfLines={1}>
                      {p.name}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: 1 }}>{p.subtitle}</AppText>
                  </View>
                  <Pressable
                    accessibilityLabel={`${p.name} budget actions`}
                    onPress={() => setCardMenu(p.id)}
                    style={{ width: 40, height: 40, marginLeft: 4, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <DotsThreeVerticalIcon size={18} color={colors.fg2} />
                  </Pressable>
                </View>
                <View style={{ height: 6, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden', marginTop: spacing.s3 - 2 }}>
                  <View style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: radii.pill, backgroundColor: over ? colors.expense : colors.gold }} />
                </View>
                <AppText weight="semibold" style={{ fontSize: 11.5, marginTop: spacing.s2, textAlign: 'right', color: over ? colors.expense : colors.navy, fontVariant: ['tabular-nums'] }}>
                  ₹{spent.toLocaleString('en-IN')} <AppText style={{ fontSize: 11.5, color: colors.fg3 }}>/ ₹{cap.toLocaleString('en-IN')}</AppText>
                </AppText>
              </Card>

              {isOpen ? (
                <>
                  <Card style={{ marginBottom: spacing.s4, padding: spacing.s5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                      <Ring value={spent} max={cap || 1} size={120} stroke={12} color={pct > 100 ? colors.expense : colors.navy}>
                        <View style={{ alignItems: 'center' }}>
                          <AppText weight="bold" style={{ fontSize: 22, fontVariant: ['tabular-nums'] }}>
                            {Math.round(pct)}%
                          </AppText>
                          <AppText weight="semibold" style={{ fontSize: 10, color: colors.fg3, marginTop: -2 }}>
                            of budget
                          </AppText>
                        </View>
                      </Ring>
                      <View style={{ flex: 1 }}>
                        <AppText weight="semibold" style={{ fontSize: 12, color: colors.fg3, letterSpacing: 0.1 }}>
                          Spent
                        </AppText>
                        <AppText weight="bold" style={{ fontSize: 22, fontVariant: ['tabular-nums'] }}>
                          ₹{spent.toLocaleString('en-IN')}
                        </AppText>
                        <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>of ₹{cap.toLocaleString('en-IN')} total</AppText>
                        <AppText style={{ fontSize: 12, color: colors.fg2, marginTop: spacing.s2 + 2, lineHeight: 17 }}>
                          {cap ? (
                            over ? (
                              <>
                                You&apos;re{' '}
                                <AppText weight="bold" style={{ fontSize: 12, color: colors.expense }}>
                                  ₹{(spent - cap).toLocaleString('en-IN')}
                                </AppText>{' '}
                                over this budget.
                              </>
                            ) : (
                              <>
                                You&apos;ve got{' '}
                                <AppText weight="bold" style={{ fontSize: 12, color: colors.income }}>
                                  ₹{(cap - spent).toLocaleString('en-IN')}
                                </AppText>{' '}
                                left on this budget.
                              </>
                            )
                          ) : (
                            'Set allocations to start tracking this budget.'
                          )}
                        </AppText>
                      </View>
                    </View>
                  </Card>

                  <Card style={{ marginBottom: spacing.s4, padding: spacing.s4, backgroundColor: colors.goldBg }}>
                    <AppText weight="medium" style={{ fontSize: 11, color: colors.fg2, letterSpacing: 0.1 }}>
                      {p.subtitle}
                    </AppText>
                    {segmentBar(p.lines.map((l, i) => ({ name: l.name, pct: (l.cap / (p.lines.reduce((s, x) => s + x.cap, 0) || 1)) * 100, color: lineColor(i) })))}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.s3 - 2 }}>
                      {p.lines.map((l, i) => (
                        <View key={l.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: spacing.s2 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: lineColor(i) }} />
                          <AppText weight="semibold" style={{ fontSize: 11, color: colors.fg2 }}>
                            {l.name} {Math.round((l.cap / (cap || 1)) * 100)}%
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </Card>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 4, marginBottom: spacing.s3 }}>
                    <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1 }}>
                      By category
                    </AppText>
                    <LockedEditButton />
                  </View>
                  <Card style={{ marginBottom: spacing.s4, paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
                    {p.lines.map((l, i, arr) => {
                      const lp = l.cap ? Math.round((l.spent / l.cap) * 100) : 0;
                      const lo = l.spent > l.cap;
                      return (
                        <View key={l.name} style={{ paddingVertical: spacing.s3 + 2, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.s3 - 2, marginBottom: 6 }}>
                            <AppText style={{ fontSize: 13, color: colors.fg2 }}>{l.name}</AppText>
                            <AppText weight="semibold" style={{ fontSize: 11.5, color: lo ? colors.expense : colors.navy, fontVariant: ['tabular-nums'] }}>
                              ₹{l.spent.toLocaleString('en-IN')} <AppText style={{ fontSize: 11.5, color: colors.fg3 }}>/ ₹{l.cap.toLocaleString('en-IN')}</AppText>
                            </AppText>
                          </View>
                          <View style={{ height: 4, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden' }}>
                            <View style={{ width: `${Math.min(lp, 100)}%`, height: '100%', borderRadius: radii.pill, backgroundColor: lo ? colors.expense : lineColor(i) }} />
                          </View>
                        </View>
                      );
                    })}
                  </Card>
                </>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <TabBar active="budget" onChange={handleTab} />

      {/* Jump to month */}
      <BottomSheet open={monthPickOpen} onClose={() => setMonthPickOpen(false)} title="Jump to month">
        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          {new Date().getFullYear()}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2 }}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(mo => {
            const key = `${mo} ${new Date().getFullYear()}`;
            const has = MONTHS.includes(key);
            const on = month === key;
            return (
              <Pressable
                key={key}
                disabled={!has}
                onPress={() => {
                  setMonth(key);
                  setMonthPickOpen(false);
                }}
                style={{
                  width: '22%',
                  height: 40,
                  borderRadius: radii.input,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: on ? colors.navy : colors.borderSubtle,
                  backgroundColor: on ? colors.navy : 'transparent',
                  opacity: has ? 1 : 0.35,
                }}
              >
                <AppText weight={on ? 'semibold' : 'medium'} style={{ fontSize: 13, color: on ? colors.fgOnDark : colors.fg2 }}>
                  {mo}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      {/* Per-card actions */}
      <BottomSheet open={!!cardMenu} onClose={() => setCardMenu(null)} title={cardMenu === 'personal' ? 'Personal' : projects.find(p => p.id === cardMenu)?.name ?? 'Budget'}>
        <Pressable
          onPress={() => {
            const id = cardMenu;
            setCardMenu(null);
            setOpenBudget(id);
            stubNav('edit-budget');
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: cardMenu !== 'personal' ? 1 : 0, borderBottomColor: colors.borderSubtle }}
        >
          <IconChip icon={PencilSimpleIcon} />
          <View>
            <AppText weight="medium" style={{ fontSize: 14, color: colors.navy }}>
              Edit
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>Rename, change icon, adjust allocations</AppText>
          </View>
        </Pressable>
        {cardMenu && cardMenu !== 'personal' ? (
          <Pressable
            onPress={() => {
              const p = projects.find(x => x.id === cardMenu) ?? null;
              setCardMenu(null);
              setDelBudget(p);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4 }}
          >
            <IconChip icon={TrashIcon} color={colors.expense} bg={colors.expenseBg} />
            <View>
              <AppText weight="medium" style={{ fontSize: 14, color: colors.expense }}>
                Delete
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>Removes this budget and its categories</AppText>
            </View>
          </Pressable>
        ) : null}
      </BottomSheet>

      {/* Delete confirmation */}
      <BottomSheet open={!!delBudget} onClose={() => setDelBudget(null)} title={`Delete "${delBudget?.name ?? ''}"?`}>
        <AppText style={{ fontSize: 13, color: colors.fg2, lineHeight: 20, marginBottom: spacing.s4 }}>
          Transactions tagged to this budget will be untagged and remain visible under their original categories.
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" full onPress={() => setDelBudget(null)}>
              Cancel
            </Button>
          </View>
          <Pressable
            onPress={() => {
              const id = delBudget?.id;
              setProjects(prev => prev.filter(p => p.id !== id));
              if (openBudget === id) setOpenBudget('personal');
              showToast(`"${delBudget?.name ?? ''}" deleted`);
              setDelBudget(null);
            }}
            style={{ flex: 1, height: 48, borderRadius: radii.control, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.expense }}
          >
            <AppText weight="semibold" style={{ fontSize: 14, color: colors.fgOnDark }}>
              Delete
            </AppText>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

export default BudgetScreen;
