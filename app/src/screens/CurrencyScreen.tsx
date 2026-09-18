import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CurrencyInrIcon } from 'phosphor-react-native/lib/module/icons/CurrencyInr';
import { CurrencyDollarIcon } from 'phosphor-react-native/lib/module/icons/CurrencyDollar';
import { CurrencyCircleDollarIcon } from 'phosphor-react-native/lib/module/icons/CurrencyCircleDollar';
import { CurrencyGbpIcon } from 'phosphor-react-native/lib/module/icons/CurrencyGbp';
import { LockSimpleIcon } from 'phosphor-react-native/lib/module/icons/LockSimple';
import AppText from '../components/AppText';
import Card from '../components/Card';
import IconChip from '../components/IconChip';
import RadioRow from '../components/RadioRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, radii, spacing } from '../theme';
import { getIsPlus, subscribeToPlan } from '../lib/planStore';
import { getActiveCurrencies, setSingleCurrency, subscribeToCurrencyPrefs, toggleCurrency, type CurrencyCode } from '../lib/currencyPrefStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Currency'>;

// Paywall isn't a built screen yet — same stub-destination convention
// SettingsScreen's own "Upgrade to Dhan Plus" banner and BudgetScreen
// already use for it.
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[CurrencyScreen] nav ->', dest);
};

const CURRENCIES: { id: CurrencyCode; label: string; sub: string; icon: typeof CurrencyInrIcon; plus?: boolean }[] = [
  { id: 'INR', label: '₹ Indian Rupee', sub: 'INR', icon: CurrencyInrIcon },
  { id: 'USD', label: '$ US Dollar', sub: 'USD', icon: CurrencyDollarIcon, plus: true },
  // No Arabic glyph prefix (unlike $/£) — Poppins has no Arabic coverage,
  // so the dirham sign renders as disconnected, malformed letterforms via
  // font fallback rather than a real Arabic glyph. Showing the name alone
  // beats shipping a broken-looking symbol.
  { id: 'AED', label: 'UAE Dirham', sub: 'AED', icon: CurrencyCircleDollarIcon, plus: true },
  { id: 'GBP', label: '£ Pound Sterling', sub: 'GBP', icon: CurrencyGbpIcon, plus: true },
];

function CurrencyScreen({ navigation }: Props) {
  const [isPlus, setIsPlusState] = useState(getIsPlus());
  const [active, setActive] = useState(getActiveCurrencies());

  useEffect(() => subscribeToPlan(() => setIsPlusState(getIsPlus())), []);
  useEffect(() => subscribeToCurrencyPrefs(() => setActive(new Set(getActiveCurrencies()))), []);

  return (
    <SettingsSubScreen
      title="Currency"
      onBack={() => navigation.goBack()}
      note={isPlus ? 'Active currencies appear across budgets and transactions.' : 'Unlock multi-currency accounts with Dhan Plus.'}
    >
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
        {CURRENCIES.map((c, i) => {
          const last = i === CURRENCIES.length - 1;
          const locked = c.plus && !isPlus;
          if (!locked) {
            return (
              <RadioRow
                key={c.id}
                icon={c.icon}
                label={c.label}
                sub={c.sub}
                on={isPlus ? active.has(c.id) : c.id === 'INR'}
                last={last}
                onPress={() => (isPlus ? toggleCurrency(c.id) : setSingleCurrency('INR'))}
              />
            );
          }
          return (
            <Pressable
              key={c.id}
              accessibilityLabel={`${c.label} — Dhan Plus feature, upgrade to unlock`}
              onPress={() => navigation.navigate('PlusPaywall', { note: 'Manage multi-currency balances with Dhan Plus' })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.s4,
                paddingVertical: spacing.s4,
                borderBottomWidth: last ? 0 : 1,
                borderBottomColor: colors.borderSubtle,
              }}
            >
              <View>
                <View style={{ opacity: 0.5 }}>
                  <IconChip icon={c.icon} />
                </View>
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 18,
                    height: 18,
                    borderRadius: radii.pill,
                    backgroundColor: colors.navy,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockSimpleIcon size={10} color={colors.fgOnDark} weight="fill" />
                </View>
              </View>
              <View style={{ flex: 1, minWidth: 0, opacity: 0.5 }}>
                <AppText style={{ fontSize: 14, color: colors.fg2 }}>{c.label}</AppText>
                <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{c.sub}</AppText>
              </View>
              <View style={{ borderWidth: 1, borderColor: colors.gold, borderRadius: radii.pill, paddingVertical: 3, paddingHorizontal: 8 }}>
                <AppText weight="semibold" style={{ fontSize: 9, color: colors.gold, letterSpacing: 0.8 }}>
                  DHAN PLUS
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </Card>
    </SettingsSubScreen>
  );
}

export default CurrencyScreen;
