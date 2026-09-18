import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PencilSimpleIcon } from 'phosphor-react-native/lib/module/icons/PencilSimple';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { BellIcon } from 'phosphor-react-native/lib/module/icons/Bell';
import { CalendarIcon } from 'phosphor-react-native/lib/module/icons/Calendar';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radii, spacing } from '../theme';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { getBills, markBillPaid, subscribeToBills } from '../lib/billsStore';
import { showToast } from '../lib/toast';
import { daysUntil, formatShortDate } from '../lib/dateRange';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BillDetail'>;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BillDetailScreen({ route, navigation }: Props) {
  const { bill: initialBill } = route.params;
  const [bill, setBill] = useState(initialBill);

  // Reflects a "Mark paid" made elsewhere (Bills list) while this screen
  // stays mounted underneath it, via the shared bills store.
  useEffect(() => {
    return subscribeToBills(() => {
      const fresh = getBills().find(b => b.id === initialBill.id);
      if (fresh) setBill(fresh);
    });
  }, [initialBill.id]);

  const isPaid = bill.status === 'paid';
  const dueIn = daysUntil(bill.dueDate);
  const Icon = CATEGORY_ICONS[bill.category] ?? CATEGORY_ICONS.other;
  const badgeBg = isPaid ? 'rgba(46,125,91,.25)' : dueIn <= 5 ? 'rgba(216,152,56,.2)' : 'rgba(255,255,255,.12)';
  const badgeColor = isPaid ? '#9CDFB6' : dueIn <= 5 ? colors.goldSoft : colors.fgOnDark;

  const markPaid = () => {
    markBillPaid(bill.id);
    showToast('Marked as paid 💸');
    // Matches app.jsx's onTogglePaid wiring from Bill Detail: marking
    // paid here also returns to the Bills list.
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Bill"
        onBack={() => navigation.goBack()}
        right={
          <View style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}>
            <PencilSimpleIcon size={18} color={colors.fg1} />
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        <View style={{ backgroundColor: colors.navy, borderRadius: radii.cardLg, padding: spacing.s5 + 2, marginBottom: spacing.s3 + 2, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, marginBottom: spacing.s4 - 2 }}>
            <View style={{ width: 48, height: 48, borderRadius: radii.cardSm, backgroundColor: 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={24} color={colors.goldSoft} weight="fill" />
            </View>
            <View>
              <AppText weight="bold" style={{ fontSize: 18, color: colors.fgOnDark }}>
                {bill.name}
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fgOnDark, opacity: 0.7 }}>
                Monthly · {bill.source === 'detected' ? 'auto-detected' : 'added manually'}
              </AppText>
            </View>
          </View>
          <AppText weight="bold" style={{ fontSize: 11, color: colors.fgOnDark, opacity: 0.7, letterSpacing: 0.1 }}>
            Amount due
          </AppText>
          <AppText weight="bold" style={{ fontSize: 36, color: colors.fgOnDark, marginTop: 4, fontVariant: ['tabular-nums'] }}>
            ₹{bill.amt.toLocaleString('en-IN')}
          </AppText>
          <View style={{ flexDirection: 'row', marginTop: spacing.s3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: radii.pill, backgroundColor: badgeBg }}>
              {isPaid ? <CheckCircleIcon size={12} color={badgeColor} weight="fill" /> : <CalendarIcon size={12} color={badgeColor} weight="fill" />}
              <AppText weight="semibold" style={{ fontSize: 11, color: badgeColor }}>
                {isPaid ? 'Paid' : `Due ${formatShortDate(bill.dueDate)} · in ${dueIn}d`}
              </AppText>
            </View>
          </View>
        </View>

        {!isPaid ? (
          <View style={{ flexDirection: 'row', gap: spacing.s3 - 2, marginBottom: spacing.s3 + 2 }}>
            <View style={{ flex: 1 }}>
              <Button variant="primary" full icon={CheckCircleIcon} onPress={markPaid}>
                Mark paid
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="outline" full icon={BellIcon}>
                Snooze
              </Button>
            </View>
          </View>
        ) : null}

        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          Reminders
        </AppText>
        <Card style={{ padding: spacing.s3 + 2, marginBottom: spacing.s3 }}>
          {[
            { label: '3 days before', on: true },
            { label: '1 day before', on: true },
            { label: 'On due date', on: false },
          ].map((r, i, arr) => (
            <View
              key={r.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}
            >
              <IconChip icon={BellIcon} />
              <AppText style={{ flex: 1, fontSize: 14, color: colors.fg2 }}>{r.label}</AppText>
              <View style={{ width: 36, height: 20, borderRadius: radii.pill, backgroundColor: r.on ? colors.navy : colors.borderStrong, justifyContent: 'center' }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.bgBase, marginLeft: r.on ? 18 : 2 }} />
              </View>
            </View>
          ))}
        </Card>

        {/* Real payment history, backfilled from the transactions that
            triggered the original suggestion (see billsStore.ts's
            runBillDetection) — manually-added bills have no occurrences to
            show yet, so this card doesn't render for them rather than
            faking one. */}
        {bill.occurrences && bill.occurrences.length > 0 ? (
          (() => {
            const recent = bill.occurrences!.slice(-6);
            const maxAmt = Math.max(...recent.map(o => o.amount));
            const avg = recent.reduce((s, o) => s + o.amount, 0) / recent.length;
            return (
              <>
                <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginTop: spacing.s2, marginBottom: spacing.s2 }}>
                  Last {recent.length} payment{recent.length === 1 ? '' : 's'}
                </AppText>
                <Card style={{ padding: spacing.s3 + 2, marginBottom: spacing.s3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100, marginBottom: spacing.s2 }}>
                    {recent.map((o, i) => (
                      <View key={o.timestamp} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                        <View
                          style={{
                            width: '100%',
                            height: Math.max(6, (o.amount / maxAmt) * 80),
                            backgroundColor: i === recent.length - 1 ? colors.gold : colors.navy,
                            borderRadius: 4,
                            opacity: i === recent.length - 1 ? 1 : 0.7,
                          }}
                        />
                        <AppText weight="semibold" style={{ fontSize: 9, color: colors.fg3 }}>
                          {MONTHS_SHORT[new Date(o.timestamp).getMonth()]}
                        </AppText>
                      </View>
                    ))}
                  </View>
                  <AppText style={{ fontSize: 12, color: colors.fg2, textAlign: 'center' }}>
                    Avg ₹{Math.round(avg).toLocaleString('en-IN')}/mo · {recent.length} payment{recent.length === 1 ? '' : 's'} detected
                  </AppText>
                </Card>
              </>
            );
          })()
        ) : null}

        <Pressable style={{ marginTop: spacing.s2, height: 48, borderRadius: radii.control, borderWidth: 1, borderColor: colors.expenseBg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.s2 }}>
          <TrashIcon size={18} color={colors.expense} />
          <AppText weight="semibold" style={{ fontSize: 14, color: colors.expense }}>
            Delete bill
          </AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default BillDetailScreen;
