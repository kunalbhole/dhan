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
import BottomSheet from '../components/BottomSheet';
import Card from '../components/Card';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radii, shadows, spacing } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { computeInsightFeed, computeSummary, type InsightCard, type InsightPeriodId, type InsightTone } from '../lib/insights';
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
  const [selectedInsight, setSelectedInsight] = useState<InsightCard | null>(null);

  useEffect(() => {
    const load = () => {
      getRecentTransactions(2000).then(setTxns);
    };
    load();
    return subscribeToTransactionsChanged(load);
  }, []);

  useEffect(() => {
    return subscribeToBills(() => setBills([...getBills()]));
  }, []);

  const summary = useMemo(() => computeSummary(txns, period), [txns, period]);
  const feed = useMemo(() => computeInsightFeed(txns, bills), [txns, bills]);
  const down = summary.deltaPct < 0;
  const topCat = summary.topCategory ? CATEGORIES[summary.topCategory] : null;
  const TopCatIcon = summary.topCategory ? CATEGORY_ICONS[summary.topCategory] : null;

  const insightTxns = useMemo(() => {
    if (!selectedInsight) return [];
    const meta = selectedInsight.meta;
    if (meta.type === 'cheapest-day' && meta.weekdayIndex !== undefined) {
      return txns.filter(t => t.amount < 0 && new Date(t.timestamp).getDay() === meta.weekdayIndex);
    }
    if (meta.type === 'trend' && meta.categoryKey) {
      return txns.filter(t => t.category === meta.categoryKey);
    }
    if (meta.type === 'steady' && meta.billName) {
      const query = meta.billName.toLowerCase();
      return txns.filter(t => (t.merchant && t.merchant.toLowerCase().includes(query)) || t.subtitle.toLowerCase().includes(query));
    }
    return txns.slice(0, 10);
  }, [selectedInsight, txns]);

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
              <Pressable
                onPress={() => summary.topCategory && navigation.navigate('CategoryTxns', { category: summary.topCategory })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}
              >
                <IconChip icon={TopCatIcon} color={topCat.color} bg={`${topCat.color}1F`} />
                <AppText style={{ flex: 1, fontSize: 14, color: colors.fg2 }}>Biggest category</AppText>
                <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy, fontVariant: ['tabular-nums'] }}>
                  {topCat.name} · ₹{summary.topAmount.toLocaleString('en-IN')}
                </AppText>
              </Pressable>
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
              <Card
                key={n.id}
                onPress={() => setSelectedInsight(n)}
                style={{ padding: spacing.s3 + 2, marginBottom: spacing.s2, flexDirection: 'row', alignItems: 'center', gap: spacing.s4 }}
              >
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

        <Pressable onPress={() => navigation.navigate('PlusPaywall', { note: 'Unlock AI-powered behavioral analytics with Dhan Plus' })}>
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
        </Pressable>
      </ScrollView>

      {/* Insight Breakdown Sheet */}
      <BottomSheet open={!!selectedInsight} onClose={() => setSelectedInsight(null)} title={selectedInsight?.title ?? 'Insight Breakdown'}>
        <View style={{ gap: spacing.s3, paddingBottom: spacing.s4 }}>
          <AppText style={{ fontSize: 13, color: colors.fg2, lineHeight: 19 }}>
            {selectedInsight?.body}
          </AppText>

          {selectedInsight?.meta.type === 'cheapest-day' ? (
            <Card style={{ padding: spacing.s3, backgroundColor: colors.bgSurface }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s2 }}>
                <View>
                  <AppText style={{ fontSize: 11, color: colors.fg3 }}>{selectedInsight.meta.weekdayName}s Avg</AppText>
                  <AppText weight="bold" style={{ fontSize: 18, color: colors.income, marginTop: 2 }}>
                    ₹{selectedInsight.meta.avgSpend?.toLocaleString('en-IN')}
                  </AppText>
                </View>
                <View>
                  <AppText style={{ fontSize: 11, color: colors.fg3 }}>Other Days Avg</AppText>
                  <AppText weight="bold" style={{ fontSize: 18, color: colors.navy, marginTop: 2 }}>
                    ₹{selectedInsight.meta.otherAvgSpend?.toLocaleString('en-IN')}
                  </AppText>
                </View>
              </View>
              <AppText style={{ fontSize: 11.5, color: colors.fg3, marginTop: 4 }}>
                Based on your transaction history over the last 60 days.
              </AppText>
            </Card>
          ) : null}

          {/* Filtered Transactions Header */}
          <AppText weight="semibold" style={{ fontSize: 13, color: colors.fg1, marginTop: spacing.s2 }}>
            {selectedInsight?.meta.type === 'cheapest-day'
              ? `Transactions on ${selectedInsight.meta.weekdayName}s`
              : selectedInsight?.meta.type === 'trend'
                ? 'Category Transactions'
                : 'Related Transactions'}
          </AppText>

          {insightTxns.length === 0 ? (
            <AppText style={{ fontSize: 12, color: colors.fg3, paddingVertical: 12 }}>
              No individual transactions match this filter.
            </AppText>
          ) : (
            insightTxns.map(t => (
              <Pressable
                key={t.id}
                onPress={() => {
                  setSelectedInsight(null);
                  navigation.navigate('TxnDetail', { transaction: t });
                }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderSubtle,
                }}
              >
                <View>
                  <AppText weight="semibold" style={{ fontSize: 13.5, color: colors.fg1 }}>
                    {t.merchant || 'Transaction'}
                  </AppText>
                  <AppText style={{ fontSize: 11.5, color: colors.fg3, marginTop: 2 }}>
                    {new Date(t.timestamp).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </AppText>
                </View>
                <AppText weight="bold" style={{ fontSize: 14, color: colors.fg1 }}>
                  ₹{Math.abs(t.amount).toLocaleString('en-IN')}
                </AppText>
              </Pressable>
            ))
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

export default InsightsScreen;
