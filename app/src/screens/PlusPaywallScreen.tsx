import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { DownloadSimpleIcon } from 'phosphor-react-native/lib/module/icons/DownloadSimple';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import { SparkleIcon } from 'phosphor-react-native/lib/module/icons/Sparkle';
import { StarIcon } from 'phosphor-react-native/lib/module/icons/Star';
import { TrendUpIcon } from 'phosphor-react-native/lib/module/icons/TrendUp';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import { XIcon } from 'phosphor-react-native/lib/module/icons/X';
import AppText from '../components/AppText';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, radii, spacing } from '../theme';
import { activateTrial } from '../lib/planStore';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PlusPaywall'>;

const FEATURES = [
  { icon: UsersThreeIcon, title: 'Split bills with friends', body: 'Track who owes who, settle up via UPI.' },
  { icon: SparkleIcon, title: 'AI-powered insights', body: 'Anomaly detection, savings tips, monthly reports.' },
  { icon: DownloadSimpleIcon, title: 'Bank-grade exports', body: 'PDF, Excel, ITR-ready statements.' },
  { icon: ShieldCheckIcon, title: 'Priority support', body: 'Skip the queue. Reply within 1 hour.' },
  { icon: TrendUpIcon, title: 'Multi-account analytics', body: 'Combined dashboard across all linked accounts.' },
];

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank (UPI Auto-Mandate)' },
  { id: 'icici', name: 'ICICI Bank iMobile' },
  { id: 'sbi', name: 'State Bank of India (YONO)' },
  { id: 'axis', name: 'Axis Bank Mobile' },
  { id: 'gpay', name: 'Google Pay / PhonePe UPI' },
];

function PlusPaywallScreen({ navigation, route }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [mandateSheet, setMandateSheet] = useState(false);
  const [selectedBank, setSelectedBank] = useState(BANKS[0].name);

  const note = route?.params?.note;

  const now = new Date();
  const firstDebitDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  const formattedDebitDate = firstDebitDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleConfirmMandate = () => {
    activateTrial(selectedBank, plan);
    setMandateSheet(false);
    showToast(`Dhan Plus Activated! Auto-mandate set for ₹${plan === 'monthly' ? '199' : '1,799'}/yr starting ${formattedDebitDate}`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.navy }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.s4, paddingTop: spacing.s2 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.pill,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <XIcon size={18} color={colors.fgOnDark} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s5, paddingBottom: spacing.s6 }}>
        <View style={{ alignItems: 'center', marginVertical: spacing.s4 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radii.card,
              backgroundColor: colors.gold,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.s3,
            }}
          >
            <StarIcon size={28} color={colors.navy} weight="fill" />
          </View>
          <AppText weight="bold" style={{ fontSize: 12, color: colors.gold, letterSpacing: 0.5, marginBottom: 4 }}>
            DHAN PLUS
          </AppText>
          <AppText weight="bold" style={{ fontSize: 24, color: colors.fgOnDark, textAlign: 'center', lineHeight: 30 }}>
            Money superpowers,{'\n'}fewer surprises.
          </AppText>
          <AppText style={{ fontSize: 13, color: colors.fgOnDark, opacity: 0.7, marginTop: spacing.s2, textAlign: 'center' }}>
            {note || 'Unlock everything Dhan can do for you.'}
          </AppText>
        </View>

        {/* Plan Cards */}
        <View style={{ gap: spacing.s2, marginBottom: spacing.s4 }}>
          <Pressable
            onPress={() => setPlan('monthly')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.s4,
              borderRadius: radii.card,
              backgroundColor: plan === 'monthly' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
              borderWidth: 1.5,
              borderColor: plan === 'monthly' ? colors.gold : 'rgba(255,255,255,0.1)',
            }}
          >
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText weight="bold" style={{ fontSize: 15, color: colors.fgOnDark }}>
                  Monthly
                </AppText>
                <View style={{ backgroundColor: colors.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <AppText weight="bold" style={{ fontSize: 9, color: colors.navy }}>
                    3 MONTHS FREE
                  </AppText>
                </View>
              </View>
              <AppText style={{ fontSize: 12, color: colors.fgOnDark, opacity: 0.7, marginTop: 2 }}>
                ₹199/month after trial · cancel anytime
              </AppText>
            </View>
            <AppText weight="bold" style={{ fontSize: 18, color: colors.gold }}>
              ₹199
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setPlan('annual')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.s4,
              borderRadius: radii.card,
              backgroundColor: plan === 'annual' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
              borderWidth: 1.5,
              borderColor: plan === 'annual' ? colors.gold : 'rgba(255,255,255,0.1)',
            }}
          >
            <View>
              <AppText weight="bold" style={{ fontSize: 15, color: colors.fgOnDark }}>
                Annual
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fgOnDark, opacity: 0.7, marginTop: 2 }}>
                ₹150/mo · billed annually as ₹1,799
              </AppText>
            </View>
            <AppText weight="bold" style={{ fontSize: 18, color: colors.fgOnDark }}>
              ₹1,799
            </AppText>
          </Pressable>
        </View>

        {/* Features List */}
        <AppText weight="semibold" style={{ fontSize: 13, color: colors.fgOnDark, marginBottom: spacing.s3 }}>
          WHAT'S INCLUDED
        </AppText>
        <View style={{ gap: spacing.s3, marginBottom: spacing.s5 }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.s3, alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radii.control,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={16} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight="semibold" style={{ fontSize: 13.5, color: colors.fgOnDark }}>
                    {f.title}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.fgOnDark, opacity: 0.7, marginTop: 2 }}>
                    {f.body}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>

        <Button variant="primary" full size="lg" onPress={() => setMandateSheet(true)}>
          Start 3-month free trial
        </Button>
      </ScrollView>

      {/* Auto-Mandate Setup Sheet */}
      <BottomSheet open={mandateSheet} onClose={() => setMandateSheet(false)} title="UPI Auto-Mandate Setup">
        <View style={{ gap: spacing.s3, paddingBottom: spacing.s4 }}>
          <AppText style={{ fontSize: 13, color: colors.fg2, lineHeight: 18 }}>
            Set up an automatic mandate for your Dhan Plus trial. No payment is charged today.
          </AppText>

          <Card style={{ padding: spacing.s3, backgroundColor: colors.bgSurface }}>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText style={{ fontSize: 12, color: colors.fg3 }}>Today's Charge:</AppText>
                <AppText weight="bold" style={{ fontSize: 13, color: colors.income }}>₹0.00 (3 Months Free)</AppText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText style={{ fontSize: 12, color: colors.fg3 }}>First Auto-Debit Date:</AppText>
                <AppText weight="semibold" style={{ fontSize: 13, color: colors.fg1 }}>{formattedDebitDate}</AppText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText style={{ fontSize: 12, color: colors.fg3 }}>Auto-Debit Amount:</AppText>
                <AppText weight="bold" style={{ fontSize: 13, color: colors.navy }}>₹{plan === 'monthly' ? '199' : '1,799'} / {plan}</AppText>
              </View>
            </View>
          </Card>

          <AppText weight="semibold" style={{ fontSize: 13, color: colors.fg1, marginTop: spacing.s2 }}>
            Select Bank for Mandate
          </AppText>

          <View style={{ gap: spacing.s2 }}>
            {BANKS.map(b => {
              const active = selectedBank === b.name;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => setSelectedBank(b.name)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: spacing.s3,
                    borderWidth: 1,
                    borderColor: active ? colors.navy : colors.borderSubtle,
                    borderRadius: radii.control,
                    backgroundColor: active ? `${colors.navy}0D` : colors.bgSurface,
                  }}
                >
                  <AppText weight={active ? 'semibold' : 'regular'} style={{ fontSize: 13, color: colors.fg1 }}>
                    {b.name}
                  </AppText>
                  {active ? <CheckCircleIcon size={18} color={colors.navy} weight="fill" /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: spacing.s2 }}>
            <Button variant="primary" full size="lg" onPress={handleConfirmMandate}>
              Approve Mandate & Start Trial
            </Button>
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

export default PlusPaywallScreen;
