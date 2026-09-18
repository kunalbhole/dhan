import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DownloadSimpleIcon } from 'phosphor-react-native/lib/module/icons/DownloadSimple';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import { SparkleIcon } from 'phosphor-react-native/lib/module/icons/Sparkle';
import { StarIcon } from 'phosphor-react-native/lib/module/icons/Star';
import { TrendUpIcon } from 'phosphor-react-native/lib/module/icons/TrendUp';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import { XIcon } from 'phosphor-react-native/lib/module/icons/X';
import AppText from '../components/AppText';
import Button from '../components/Button';
import { colors, radii, spacing } from '../theme';
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

function PlusPaywallScreen({ navigation, route }: Props) {
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  const note = route?.params?.note;

  const handleSubscribe = () => {
    showToast('Subscribed to Dhan Plus!');
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText weight="bold" style={{ fontSize: 15, color: colors.fgOnDark }}>
                  Annual
                </AppText>
                <View style={{ backgroundColor: colors.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <AppText weight="bold" style={{ fontSize: 9, color: colors.navy }}>
                    BEST VALUE
                  </AppText>
                </View>
              </View>
              <AppText style={{ fontSize: 12, color: colors.fgOnDark, opacity: 0.7, marginTop: 2 }}>
                ₹150/mo · save ₹600
              </AppText>
            </View>
            <AppText weight="bold" style={{ fontSize: 18, color: colors.gold }}>
              ₹1,799
            </AppText>
          </Pressable>

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
              <AppText weight="bold" style={{ fontSize: 15, color: colors.fgOnDark }}>
                Monthly
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fgOnDark, opacity: 0.7, marginTop: 2 }}>
                Per month · cancel anytime
              </AppText>
            </View>
            <AppText weight="bold" style={{ fontSize: 18, color: colors.fgOnDark }}>
              ₹199
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

        <Button variant="primary" full size="lg" onPress={handleSubscribe}>
          Start 7-day free trial
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PlusPaywallScreen;
