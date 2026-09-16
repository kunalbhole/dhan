import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radii, spacing, typography } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'IncomeSetup'>;

const PRESETS = [50000, 75000, 100000, 150000];

interface SplitBucket {
  label: string;
  share: number;
  color: string;
}

// "Save" color (#2E7D5B) is the same value as theme.colors.income, reused
// rather than duplicated.
const SPLIT: SplitBucket[] = [
  { label: 'Needs', share: 0.5, color: colors.navy },
  { label: 'Wants', share: 0.3, color: colors.gold },
  { label: 'Save', share: 0.2, color: colors.income },
];

// Indian digit grouping (lakh/crore — last 3 digits, then pairs), matching
// the reference's `toLocaleString("en-IN")`. Not relying on Intl since
// Hermes's en-IN locale data support isn't guaranteed.
function formatIndianNumber(n: number): string {
  const intPart = Math.max(0, Math.trunc(n)).toString();
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const groupedRest = rest === '' ? '' : `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},`;
  return groupedRest + lastThree;
}

function formatPresetLabel(p: number): string {
  return p >= 100000 ? `${p / 100000}L` : `${p / 1000}k`;
}

function IncomeSetupScreen({ navigation }: Props) {
  const [income, setIncome] = useState(82500);

  const onChangeIncome = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');
    setIncome(digitsOnly ? parseInt(digitsOnly, 10) : 0);
  };

  const goNext = () => navigation.navigate('Framework');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Monthly income" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <AppText weight="bold" style={styles.title}>
          What&apos;s coming in?
        </AppText>
        <AppText style={styles.subtitle}>
          Roughly your take-home each month. We&apos;ll use this to suggest budgets.
        </AppText>

        <View style={styles.amountBlock}>
          <AppText weight="medium" style={styles.perMonth}>
            Per month
          </AppText>
          <View style={styles.amountRow}>
            <AppText weight="bold" style={styles.currencySymbol}>
              ₹
            </AppText>
            <TextInput
              value={formatIndianNumber(income)}
              onChangeText={onChangeIncome}
              keyboardType="number-pad"
              style={styles.amountInput}
            />
          </View>
          <AppText style={styles.perYear}>That&apos;s ₹{formatIndianNumber(income * 12)} a year</AppText>
        </View>

        <View style={styles.presetsRow}>
          {PRESETS.map(p => {
            const active = income === p;
            return (
              <Pressable
                key={p}
                onPress={() => setIncome(p)}
                style={[
                  styles.presetChip,
                  { backgroundColor: active ? colors.navy : colors.bgBase, borderColor: active ? colors.navy : colors.borderSubtle },
                ]}
              >
                <AppText weight="medium" style={[styles.presetChipText, { color: active ? colors.bgBase : colors.fg2 }]}>
                  ₹{formatPresetLabel(p)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.splitCard}>
          <AppText weight="medium" style={styles.splitLabel}>
            Suggested 50/30/20 split
          </AppText>
          {SPLIT.map(s => (
            <View key={s.label} style={styles.splitRow}>
              <View style={styles.splitLeft}>
                <View style={[styles.splitDot, { backgroundColor: s.color }]} />
                <AppText weight="semibold" style={styles.splitRowText}>
                  {s.label}{' '}
                  <AppText weight="medium" style={styles.splitPct}>
                    · {Math.round(s.share * 100)}%
                  </AppText>
                </AppText>
              </View>
              <AppText weight="semibold" style={styles.splitAmount}>
                ₹{formatIndianNumber(Math.round(income * s.share))}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <AppText style={styles.disclaimer}>
          You can adjust this any time. Variable income? Set an average.
        </AppText>
        <Button variant="primary" full size="lg" iconRight={ArrowRightIcon} disabled={!income} onPress={goNext}>
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
  body: {
    flex: 1,
    paddingHorizontal: spacing.s6,
    paddingBottom: spacing.s5,
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
    marginBottom: 28,
  },
  amountBlock: {
    alignItems: 'center',
    paddingTop: spacing.s2,
    paddingBottom: spacing.s3,
  },
  perMonth: {
    fontSize: typography.scale.label.fontSize,
    color: colors.fg3,
    letterSpacing: 0.11,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
  },
  currencySymbol: {
    fontSize: typography.scale.display.fontSize,
    color: colors.navy,
  },
  amountInput: {
    fontFamily: typography.family.bold,
    fontSize: 46,
    color: colors.navy,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    width: 240,
    padding: 0,
  },
  perYear: {
    fontSize: typography.scale.caption.fontSize,
    color: colors.fg3,
    marginTop: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.s2,
    marginTop: 14,
    marginBottom: 18,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.s2,
    paddingHorizontal: spacing.s1,
  },
  presetChipText: {
    fontSize: typography.scale.caption.fontSize,
    fontVariant: ['tabular-nums'],
  },
  splitCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.card,
    padding: spacing.s4,
    marginBottom: 14,
  },
  splitLabel: {
    fontSize: typography.scale.label.fontSize,
    color: colors.fg3,
    letterSpacing: 0.11,
    marginBottom: 10,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  splitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s2,
  },
  splitDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  splitRowText: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.fg1,
  },
  splitPct: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.fg3,
  },
  splitAmount: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.fg1,
    fontVariant: ['tabular-nums'],
  },
  spacer: {
    flex: 1,
  },
  disclaimer: {
    fontSize: typography.scale.label.fontSize,
    color: colors.fg3,
    textAlign: 'center',
    marginBottom: spacing.s3,
    lineHeight: 15.4,
  },
});

export default IncomeSetupScreen;
