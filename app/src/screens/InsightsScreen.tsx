import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TrendUpIcon } from 'phosphor-react-native/lib/module/icons/TrendUp';
import { TrendDownIcon } from 'phosphor-react-native/lib/module/icons/TrendDown';
import { PiggyBankIcon } from 'phosphor-react-native/lib/module/icons/PiggyBank';
import { SparkleIcon } from 'phosphor-react-native/lib/module/icons/Sparkle';
import { LockSimpleIcon } from 'phosphor-react-native/lib/module/icons/LockSimple';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import AppText from '../components/AppText';
import Card from '../components/Card';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radii, shadows, spacing } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { computeInsightFeed, computeSummary, type InsightPeriodId, type InsightTone } from '../lib/insights';
import { getRecentTransactions, subscribeToTransactionsChanged, type StoredTransaction } from '../lib/db';
import { getBills, subscribeToBills } from '../lib/billsStore';
import type { Bill } from '../lib/bills';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Insights'>;

const PERIODS: { id: InsightPeriodId; label: string }[] = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

const TONE_COLORS: Record<InsightTone, { fg: string; bg: string }> = {
  warn: { fg: colors.warning, bg: colors.warningBg },
  good: { fg: colors.income, bg: colors.incomeBg },
  info: { fg: colors.info, bg: colors.infoBg },
};

function InsightsScreen({ navigation }: Props) {
  const [period, setPeriod] = useState<InsightPeriodId>('week');
  const [txns, setTxns] = useState<StoredTransaction[]>([]);
  const [bills, setBills] = useState<Bill[]>(getBills());

  useEffect(() => {
    const load = () => getRecentTransactions(2000).then(setTxns);
    load();
    return subscribeToTransactionsChanged(load);
  }, []);
  useEffect(() => subscribeToBills(() => setBills([...getBills()])), []);

  const summary = useMemo(() => computeSummary(txns, period), [txns, period]);
  const feed = useMemo(() => computeInsightFeed(txns, bills), [txns, bills]);
  const down = summary.deltaPct < 0;
  const topCat = summary.topCategory ? CATEGORIES[summary.topCategory] : null;
  const TopCatIcon = summary.topCategory ? CATEGORY_ICONS[summary.topCategory] : null;

  const openTarget = (view: 'txn' | 'bills') => {
    if (view === 'txn') navigation.navigate('Transactions');
    else navigation.navigate('Bills');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader title="Insights" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          Summary
        </AppText>

        <View style={{ flexDirection: 'row', gap: spacing.s2, backgroundColor: colors.bgSurface, borderRadius: radii.control, padding: 4, marginBottom: spacing.s2 }}>
          {PERIODS.map(p => (
            <Pressable
              key={p.id}
              onPress={() => setPeriod(p.id)}
              style={[
                { flex: 1, height: 36, borderRadius: radii.input, alignItems: 'center', justifyContent: 'center', backgroundColor: period === p.id ? colors.bgElevated : 'transparent' },
                period === p.id ? shadows.card : null,
              ]}
            >
              <AppText weight="semibold" style={{ fontSize: 13, color: period === p.id ? colors.navy : colors.fg3 }}>
                {p.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <Card style={{ padding: spacing.s4, marginBottom: spacing.s6 }}>
          <AppText style={{ fontSize: 12, color: colors.fg3 }}>Total spent · {summary.rangeLabel}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.s2, marginTop: 4 }}>
            <AppText weight="bold" style={{ fontSize: 30, color: colors.navy, fontVariant: ['tabular-nums'] }}>
              ₹{summary.spent.toLocaleString('en-IN')}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              {down ? <TrendDownIcon size={13} color={colors.income} weight="fill" /> : <TrendUpIcon size={13} color={colors.expense} weight="fill" />}
              <AppText weight="semibold" style={{ fontSize: 12.5, color: down ? colors.income : colors.expense }}>
                {Math.abs(summary.deltaPct)}% vs {period === 'week' ? 'last week' : 'last month'}
              </AppText>
            </View>
          </View>

          <View style={{ marginTop: spacing.s4, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
            {topCat && TopCatIcon ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
                <IconChip icon={TopCatIcon} color={topCat.color} bg={`${topCat.color}1F`} />
                <AppText style={{ flex: 1, fontSize: 14, color: colors.fg2 }}>Biggest category</AppText>
                <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy, fontVariant: ['tabular-nums'] }}>
                  {topCat.name} · ₹{summary.topAmount.toLocaleString('en-IN')}
                </AppText>
              </View>
            ) : (
              <View style={{ paddingVertical: spacing.s4, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
                <AppText style={{ fontSize: 13, color: colors.fg3 }}>No spending {period === 'week' ? 'this week' : 'this month'} yet.</AppText>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4 }}>
              <IconChip icon={PiggyBankIcon} color={colors.income} bg={colors.incomeBg} fill />
              <AppText style={{ flex: 1, fontSize: 14, color: colors.fg2 }}>Savings rate</AppText>
              <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy, fontVariant: ['tabular-nums'] }}>{summary.savingsRate}%</AppText>
            </View>
          </View>
        </Card>

        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          Insights
        </AppText>

        {feed.length === 0 ? (
          <Card style={{ padding: spacing.s4, marginBottom: spacing.s2 }}>
            <AppText style={{ fontSize: 13, color: colors.fg3, lineHeight: 19 }}>
              Not enough transaction history yet to spot patterns — check back once you've had a few weeks of activity.
            </AppText>
          </Card>
        ) : (
          feed.map(n => {
            const tone = TONE_COLORS[n.tone];
            return (
              <Card key={n.id} onPress={() => openTarget(n.target.view)} style={{ padding: spacing.s3 + 2, marginBottom: spacing.s2, flexDirection: 'row', alignItems: 'center', gap: spacing.s4 }}>
                <IconChip icon={n.icon} color={tone.fg} bg={tone.bg} fill />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy, lineHeight: 18 }}>
                    {n.title}
                  </AppText>
                  <AppText style={{ fontSize: 12.5, color: colors.fg3, marginTop: 2, lineHeight: 17 }}>{n.body}</AppText>
                </View>
                <CaretRightIcon size={14} color={colors.fg4} />
              </Card>
            );
          })
        )}

        <Card style={{ padding: spacing.s3 + 2, marginTop: spacing.s2, flexDirection: 'row', alignItems: 'center', gap: spacing.s4, opacity: 0.9 }}>
          <View>
            <View style={{ opacity: 0.5 }}>
              <IconChip icon={SparkleIcon} color={colors.gold} bg={colors.goldBg} fill />
            </View>
            <View
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                width: 18,
                height: 18,
                borderRadius: radii.pill,
                backgroundColor: colors.navy,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockSimpleIcon size={9} color={colors.fgOnDark} weight="fill" />
            </View>
          </View>
          <View style={{ flex: 1, minWidth: 0, opacity: 0.5 }}>
            <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy }}>
              AI-powered insights
            </AppText>
            <AppText style={{ fontSize: 12.5, color: colors.fg3, marginTop: 2, lineHeight: 17 }}>
              Deeper trend breakdowns and personalized tips — included with Dhan Plus
            </AppText>
          </View>
          <View style={{ backgroundColor: colors.gold, paddingVertical: 7, paddingHorizontal: 14, borderRadius: radii.pill }}>
            <AppText weight="bold" style={{ fontSize: 11.5, color: colors.fgOnGold }}>
              Upgrade
            </AppText>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export default InsightsScreen;
