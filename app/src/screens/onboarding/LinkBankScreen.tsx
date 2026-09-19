import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckIcon } from 'phosphor-react-native/lib/module/icons/Check';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import Field from '../../components/Field';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radii, shadows, spacing, typography } from '../../theme';
import { scanAndProcessInbox } from '../../lib/smsPipeline';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'LinkBank'>;

interface Bank {
  id: string;
  name: string;
  color: string;
  short: string;
}

const ALL_BANKS: Bank[] = [
  { id: 'hdfc', name: 'HDFC Bank', color: '#004C8F', short: 'HD' },
  { id: 'icici', name: 'ICICI Bank', color: '#F37920', short: 'IC' },
  { id: 'axis', name: 'Axis Bank', color: '#97144D', short: 'AX' },
  { id: 'sbi', name: 'State Bank', color: '#22409A', short: 'SB' },
  { id: 'kotak', name: 'Kotak Mahindra', color: '#ED1A3B', short: 'KM' },
  { id: 'yes', name: 'Yes Bank', color: '#00518F', short: 'YS' },
  { id: 'indus', name: 'IndusInd Bank', color: '#88001B', short: 'IN' },
  { id: 'pnb', name: 'Punjab National Bank', color: '#A11B20', short: 'PN' },
  { id: 'bob', name: 'Bank of Baroda', color: '#F26522', short: 'BO' },
  { id: 'lazypay', name: 'LazyPay', color: '#20C997', short: 'LZ' },
  { id: 'cred', name: 'CRED Pay', color: '#141C41', short: 'CR' },
];

function Spinner() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />;
}

function LinkBankScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [linked, setLinked] = useState<string[]>(['hdfc', 'icici']);
  const [scanning, setScanning] = useState(false);

  const filtered = ALL_BANKS.filter(b => b.name.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = async (id: string) => {
    if (linked.includes(id)) {
      setLinked(l => l.filter(x => x !== id));
      return;
    }
    setScanning(true);
    await scanAndProcessInbox(200);
    setLinked(l => [...l, id]);
    setScanning(false);
  };

  const goNext = () => navigation.navigate('IncomeSetup');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Link your accounts"
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={goNext} hitSlop={8}>
            <AppText weight="semibold" style={styles.skipText}>
              Skip
            </AppText>
          </Pressable>
        }
      />
      <View style={styles.body}>
        <AppText weight="bold" style={styles.title}>
          Pick your banks
        </AppText>
        <AppText style={styles.subtitle}>Dhan reads SMS only — no logins, no OTPs. Add the ones you use.</AppText>

        <Field placeholder="Search banks or wallets…" value={query} onChangeText={setQuery} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.s4, paddingTop: spacing.s3 }}>
          <View style={styles.grid}>
            {filtered.map(bank => {
              const isLinked = linked.includes(bank.id);
              return (
                <Pressable
                  key={bank.id}
                  onPress={() => toggle(bank.id)}
                  style={[
                    styles.card,
                    { borderColor: isLinked ? colors.navy : colors.borderSubtle },
                    isLinked && shadows.md,
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={[styles.badge, { backgroundColor: bank.color }]}>
                      <AppText weight="semibold" style={styles.badgeText}>
                        {bank.short}
                      </AppText>
                    </View>
                    {isLinked && (
                      <View style={styles.checkBadge}>
                        <CheckIcon size={12} color={colors.bgBase} weight="fill" />
                      </View>
                    )}
                  </View>
                  <AppText weight="semibold" style={styles.bankName}>
                    {bank.name}
                  </AppText>
                  <AppText weight="semibold" style={[styles.bankStatus, { color: isLinked ? colors.income : colors.fg3 }]}>
                    {isLinked ? 'Linked · SMS detected' : 'Tap to link'}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {scanning && (
            <View style={styles.scanRow}>
              <Spinner />
              <AppText style={styles.scanText}>Scanning recent SMS…</AppText>
            </View>
          )}

          <View style={styles.summaryBanner}>
            <AppText style={styles.summaryText}>
              <AppText weight="bold" style={styles.summaryBold}>
                {linked.length} linked.
              </AppText>{' '}
              Add more anytime in Settings.
            </AppText>
          </View>
        </ScrollView>

        <Button
          variant="primary"
          full
          size="lg"
          iconRight={ArrowRightIcon}
          disabled={linked.length === 0}
          onPress={goNext}
        >
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  skipText: {
    fontSize: 14,
    color: colors.fg3,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.s6,
    paddingBottom: spacing.s4,
  },
  title: {
    fontSize: typography.scale.h1.fontSize,
    letterSpacing: -0.24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.fg2,
    lineHeight: 21,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.bgBase,
    borderWidth: 2,
    borderRadius: radii.cardSm,
    padding: 14,
    gap: spacing.s2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    color: colors.bgBase,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.income,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 13,
  },
  bankStatus: {
    fontSize: 10.5,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.control,
    marginTop: spacing.s3,
  },
  scanText: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.fg2,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: colors.borderSubtle,
    borderTopColor: colors.navy,
  },
  summaryBanner: {
    marginTop: spacing.s3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.goldBg,
    borderRadius: radii.control,
  },
  summaryText: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.fg2,
    lineHeight: 18.2,
  },
  summaryBold: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.fg1,
  },
});

export default LinkBankScreen;
