import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { SparkleIcon } from 'phosphor-react-native/lib/module/icons/Sparkle';
import { XIcon } from 'phosphor-react-native/lib/module/icons/X';
import AppHeader from '../components/AppHeader';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusPill, { type StatusPillTone } from '../components/StatusPill';
import TabBar, { type TabId } from '../components/TabBar';
import { colors, radii, spacing } from '../theme';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { getBills, markBillPaid, subscribeToBills, runBillDetection, confirmSuggestedBill, dismissSuggestedBill } from '../lib/billsStore';
import { getAllTransactions } from '../lib/db';
import { daysUntil, formatShortDate, monthYearLabel } from '../lib/dateRange';
import { showToast } from '../lib/toast';
import type { Bill } from '../lib/bills';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Bills'>;

const STATUS_META: Record<'upcoming' | 'due-soon' | 'paid', { tone: StatusPillTone; label: string }> = {
  upcoming: { tone: 'info', label: 'Upcoming' },
  'due-soon': { tone: 'warning', label: 'Due soon' },
  paid: { tone: 'income', label: 'Paid' },
};

// Every destination other than Home/Bills (this screen), Txns, Budget,
// Settings, Search and Notifications is a tab this app hasn't built yet.
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[BillsScreen] nav ->', dest);
};

function BillsScreen({ navigation }: Props) {
  const [bills, setBills] = useState<Bill[]>(getBills());

  useEffect(() => subscribeToBills(() => setBills(getBills())), []);

  // Detection runs on focus, not on every SMS/transaction insert — cheap
  // even at a few thousand rows, and there's no reason to recompute it
  // more often than this screen is actually open (see billsStore.ts).
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getAllTransactions().then(runBillDetection);
    });
    return unsubscribe;
  }, [navigation]);

  const suggested = bills.filter(b => b.status === 'suggested');
  const tracked = bills.filter(b => b.status !== 'suggested' && b.status !== 'dismissed');
  const dueSoon = tracked.filter(b => b.status === 'due-soon').sort((a, b) => a.dueDate - b.dueDate);
  const unpaid = tracked.filter(b => b.status !== 'paid');
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amt, 0);
  const totalMonthly = tracked.reduce((s, b) => s + b.amt, 0);

  // Grouped by the month/year of each bill's due date (matching
  // screens-main.jsx's original structure) rather than category — real
  // detected merchants don't fall into a small fixed set of lifestyle
  // buckets the way the old hardcoded sample bills did. Sorting `tracked`
  // by due date before grouping means the Map's insertion order already
  // puts month groups in chronological order for free.
  const byMonth = new Map<string, Bill[]>();
  for (const b of [...tracked].sort((a, b) => a.dueDate - b.dueDate)) {
    const label = monthYearLabel(b.dueDate);
    byMonth.set(label, [...(byMonth.get(label) ?? []), b]);
  }

  const handleTab = (id: TabId) => {
    if (id === 'bills') return;
    if (id === 'home') navigation.navigate('Home');
    else if (id === 'txn') navigation.navigate('Transactions');
    else if (id === 'budget') navigation.navigate('Budget');
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

      <View style={{ paddingHorizontal: spacing.s4, paddingTop: 4, paddingBottom: spacing.s2 + 2 }}>
        {/* "Add bill" moved into AppHeader (GlobalAddSheet.tsx), shared
            across every screen — this title row used to also carry a "+"
            button opening AddBillSheet directly. */}
        <AppText weight="medium" style={{ fontSize: 20, color: colors.navy, marginBottom: spacing.s3 - 2 }}>
          Bills &amp; subs
        </AppText>

        <View style={{ backgroundColor: colors.navy, borderRadius: radii.card, padding: spacing.s4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <AppText weight="medium" style={{ fontSize: 10, color: colors.fgOnDark, opacity: 0.7, letterSpacing: 0.1 }}>
              Still due this month
            </AppText>
            <AppText weight="bold" style={{ fontSize: 26, color: colors.fgOnDark, marginTop: 2, fontVariant: ['tabular-nums'] }}>
              ₹{totalUnpaid.toLocaleString('en-IN')}
            </AppText>
            <AppText style={{ fontSize: 11, color: colors.fgOnDark, opacity: 0.7, marginTop: 2 }}>
              {tracked.filter(b => b.status === 'paid').length} of {tracked.length} paid · ₹{totalMonthly.toLocaleString('en-IN')} total
            </AppText>
          </View>
          <View style={{ width: 52, height: 52, borderRadius: radii.pill, backgroundColor: 'rgba(201,168,76,.2)', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptIcon size={22} color={colors.goldSoft} weight="fill" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        {suggested.length > 0 ? (
          <>
            <AppText weight="medium" style={{ fontSize: 16, marginHorizontal: 4, marginBottom: spacing.s2 + 2 }}>
              Suggested
            </AppText>
            {suggested.map(b => {
              const Icon = CATEGORY_ICONS[b.category] ?? CATEGORY_ICONS.other;
              const occurrenceCount = b.occurrences?.length ?? 0;
              return (
                <Card key={b.id} style={{ marginBottom: spacing.s3, padding: spacing.s4, borderColor: colors.gold, borderWidth: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, marginBottom: spacing.s3 }}>
                    <View style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.goldBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={colors.navy} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText weight="semibold" style={{ fontSize: 14 }}>
                        {b.name}
                      </AppText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <SparkleIcon size={11} color={colors.gold} weight="fill" />
                        <AppText style={{ fontSize: 11.5, color: colors.fg3 }}>
                          Looks like a monthly bill · {occurrenceCount} payments
                        </AppText>
                      </View>
                    </View>
                    <AppText weight="semibold" style={{ fontSize: 15, fontVariant: ['tabular-nums'] }}>
                      ₹{b.amt.toLocaleString('en-IN')}
                    </AppText>
                  </View>
                  <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        variant="primary"
                        full
                        size="sm"
                        icon={CheckCircleIcon}
                        onPress={() => {
                          confirmSuggestedBill(b.id);
                          showToast('Added as a bill');
                        }}
                      >
                        Add as bill
                      </Button>
                    </View>
                    <Pressable
                      accessibilityLabel="Dismiss suggestion"
                      onPress={() => dismissSuggestedBill(b.id)}
                      style={{ width: 36, height: 36, borderRadius: radii.control, borderWidth: 1, borderColor: colors.borderDefault, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <XIcon size={16} color={colors.fg2} />
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </>
        ) : null}

        {dueSoon.length > 0 ? (
          <>
            <AppText weight="medium" style={{ fontSize: 16, marginHorizontal: 4, marginBottom: spacing.s2 + 2 }}>
              Due soon
            </AppText>
            {dueSoon.map(b => {
              const Icon = CATEGORY_ICONS[b.category] ?? CATEGORY_ICONS.other;
              const dueIn = daysUntil(b.dueDate);
              // screens-main.jsx's own Due-soon Card uses raw 8/14/10px
              // (marginBottom/padding/row-gap) — off-token values with no
              // clean equivalent in theme.spacing. Rounding each up to its
              // nearest real token (s2→s3, s3+2→s4, s3-2→s3) instead of
              // replicating that arithmetic gives the stacked card+button
              // pairs real breathing room without inventing an arbitrary
              // number.
              return (
                <Card key={b.id} style={{ marginBottom: spacing.s3, padding: spacing.s4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, marginBottom: spacing.s3 }}>
                    <View style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.warningBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={colors.warning} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText weight="semibold" style={{ fontSize: 14 }}>
                        {b.name}
                      </AppText>
                      <AppText weight="semibold" style={{ fontSize: 12, color: colors.warning, marginTop: 2 }}>
                        Due {formatShortDate(b.dueDate)} · in {dueIn}d
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={{ fontSize: 15, fontVariant: ['tabular-nums'] }}>
                      ₹{b.amt.toLocaleString('en-IN')}
                    </AppText>
                  </View>
                  <Button
                    variant="primary"
                    full
                    size="sm"
                    icon={CheckCircleIcon}
                    onPress={() => {
                      markBillPaid(b.id);
                      showToast('Marked as paid 💸');
                    }}
                  >
                    Mark as paid
                  </Button>
                </Card>
              );
            })}
          </>
        ) : null}

        {tracked.length > 0 ? (
          <View style={{ marginTop: spacing.s5 - 2 }}>
            {[...byMonth.entries()].map(([month, items]) => (
              <View key={month} style={{ marginBottom: spacing.s4 }}>
                <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
                  {month}
                </AppText>
                {items.map(b => {
                  const Icon = CATEGORY_ICONS[b.category] ?? CATEGORY_ICONS.other;
                  const meta = STATUS_META[b.status as 'upcoming' | 'due-soon' | 'paid'];
                  return (
                    <Card key={b.id} onPress={() => navigation.navigate('BillDetail', { bill: b })} style={{ marginBottom: 6, padding: spacing.s3 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 }}>
                        <View style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.bgSurface, alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={20} color={colors.navy} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <AppText weight="semibold" style={{ fontSize: 14 }}>
                            {b.name}
                          </AppText>
                          <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>Due {formatShortDate(b.dueDate)}</AppText>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <AppText weight="semibold" style={{ fontSize: 14, fontVariant: ['tabular-nums'] }}>
                            ₹{b.amt.toLocaleString('en-IN')}
                          </AppText>
                          <View style={{ marginTop: 4 }}>
                            <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                          </View>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            ))}
          </View>
        ) : suggested.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ReceiptIcon size={40} color={colors.fg3} />
            <AppText weight="medium" style={{ fontSize: 15, color: colors.fg2, marginTop: spacing.s3, textAlign: 'center' }}>
              No bills yet
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.fg3, marginTop: 6, textAlign: 'center', lineHeight: 19, paddingHorizontal: spacing.s5 }}>
              Dhan will pick up recurring payments automatically once you've had a few months of transactions — or add one yourself with the + button above.
            </AppText>
          </View>
        ) : null}
      </ScrollView>

      <TabBar active="bills" onChange={handleTab} />
    </SafeAreaView>
  );
}

export default BillsScreen;
