import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowLeft';
import { CaretDownIcon } from 'phosphor-react-native/lib/module/icons/CaretDown';
import { ArrowsDownUpIcon } from 'phosphor-react-native/lib/module/icons/ArrowsDownUp';
import { WifiSlashIcon } from 'phosphor-react-native/lib/module/icons/WifiSlash';
import AppText from '../components/AppText';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Field from '../components/Field';
import GoldButton from '../components/GoldButton';
import RadioRow from '../components/RadioRow';
import { colors, radii, spacing, typography } from '../theme';
import { FX_NAMES, decimalPlaces, fetchFxRates, readFxCache, type FxCache } from '../lib/fx';
import { MONTHS_SHORT } from '../lib/dateRange';
import { formatTime } from '../lib/format';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CurrencyConverter'>;

function groupInt(intPart: string): string {
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const groupedRest = rest === '' ? '' : `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},`;
  return groupedRest + lastThree;
}

function formatAmount(n: number, decimals: number): string {
  const sign = n < 0 ? '−' : '';
  const fixed = Math.abs(n).toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const grouped = groupInt(intPart);
  return decPart ? `${sign}${grouped}.${decPart}` : `${sign}${grouped}`;
}

function formatRate(n: number): string {
  const fixed = Math.abs(n).toFixed(4);
  const [intPart, decPartRaw] = fixed.split('.');
  let decPart = decPartRaw;
  while (decPart.length > 2 && decPart.endsWith('0')) decPart = decPart.slice(0, -1);
  return `${groupInt(intPart)}.${decPart}`;
}

function stampFmt(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}, ${formatTime(ts)}`;
}

function CurrencyConverterScreen({ navigation }: Props) {
  const [cache, setCache] = useState<FxCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [from, setFrom] = useState('INR');
  const [to, setTo] = useState('USD');
  const [amount, setAmount] = useState('1000');
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchFxRates();
    setCache(result.cache);
    setOffline(result.offline);
    setLoading(false);
  }, []);

  // Show whatever's cached immediately (if anything), then fetch fresh
  // rates in the background — real network data, not a fabricated static
  // rate table.
  useEffect(() => {
    let alive = true;
    readFxCache().then(cached => {
      if (alive && cached) {
        setCache(cached);
        setLoading(false);
      }
    });
    refresh().then(() => {
      if (!alive) return;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rates = cache?.rates;
  const codes = useMemo(() => {
    if (!rates) return [];
    return Object.keys(FX_NAMES)
      .filter(c => rates[c])
      .sort();
  }, [rates]);

  const rate = rates && rates[from] && rates[to] ? rates[to] / rates[from] : null;
  const entered = parseFloat(amount.replace(/,/g, '')) || 0;
  const converted = rate ? entered * rate : 0;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const shown = codes.filter(c => {
    const q = query.trim().toLowerCase();
    return !q || c.toLowerCase().includes(q) || FX_NAMES[c].toLowerCase().includes(q);
  });

  const amountTextStyle = {
    fontFamily: typography.family.medium,
    fontSize: 20,
    color: colors.navy,
    fontVariant: ['tabular-nums' as const],
    padding: 0,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <View style={{ paddingTop: spacing.s1, paddingHorizontal: spacing.s4, paddingBottom: spacing.s2 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
          style={{ width: 40, height: 40, borderRadius: radii.control, backgroundColor: colors.bgBase, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeftIcon size={20} color={colors.fg1} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        <AppText weight="medium" style={{ fontSize: 20, color: colors.navy, marginHorizontal: 4, marginBottom: spacing.s4 }}>
          Currency converter
        </AppText>

        {cache ? (
          <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>
            {stampFmt(cache.fetchedAt)} · {offline ? 'Cached rate' : 'Live rate'}
          </AppText>
        ) : null}

        {!rates ? (
          loading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <AppText style={{ fontSize: 13, color: colors.fg3 }}>Fetching latest rates…</AppText>
            </View>
          ) : (
            <View style={{ paddingVertical: 40, paddingHorizontal: spacing.s2, alignItems: 'center' }}>
              <WifiSlashIcon size={48} color={colors.fg3} />
              <AppText weight="medium" style={{ fontSize: 16, color: colors.navy, marginTop: spacing.s4 }}>
                No rates yet
              </AppText>
              <AppText style={{ fontSize: 13, color: colors.fg3, lineHeight: 19, marginTop: spacing.s2, maxWidth: 260, textAlign: 'center' }}>
                Connect to the internet to fetch the latest exchange rates.
              </AppText>
              <View style={{ marginTop: spacing.s4 }}>
                <Button variant="primary" onPress={refresh}>
                  Retry
                </Button>
              </View>
            </View>
          )
        ) : (
          <>
            <View style={{ borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radii.card, backgroundColor: colors.bgElevated, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'stretch', minHeight: 56 }}>
                <View style={{ flex: 1, minWidth: 0, padding: spacing.s4, justifyContent: 'center' }}>
                  <TextInput
                    value={amount}
                    onChangeText={v => setAmount(v.replace(/[^\d.,]/g, ''))}
                    inputMode="decimal"
                    accessibilityLabel={`Amount in ${from}`}
                    style={amountTextStyle}
                  />
                </View>
                <View style={{ width: 1, backgroundColor: colors.borderSubtle }} />
                <Pressable
                  accessibilityLabel={`Change currency (${from})`}
                  onPress={() => {
                    setPicking('from');
                    setQuery('');
                  }}
                  style={{ width: 116, padding: spacing.s4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <AppText weight="medium" style={{ fontSize: 14, color: colors.navy }}>
                    {from}
                  </AppText>
                  <CaretDownIcon size={14} color={colors.fg3} />
                </Pressable>
              </View>

              <View style={{ height: 1, backgroundColor: colors.borderSubtle }}>
                <Pressable
                  onPress={swap}
                  accessibilityLabel="Swap currencies"
                  style={{
                    position: 'absolute',
                    top: -14,
                    right: 16,
                    width: 28,
                    height: 28,
                    borderRadius: radii.pill,
                    backgroundColor: colors.bgElevated,
                    borderWidth: 1,
                    borderColor: 'rgba(201,168,76,.5)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowsDownUpIcon size={13} color={colors.gold} />
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'stretch', minHeight: 56 }}>
                <View style={{ flex: 1, minWidth: 0, padding: spacing.s4, justifyContent: 'center' }}>
                  <AppText style={[amountTextStyle, { fontFamily: typography.family.medium }]}>{formatAmount(converted, decimalPlaces(to))}</AppText>
                </View>
                <View style={{ width: 1, backgroundColor: colors.borderSubtle }} />
                <Pressable
                  accessibilityLabel={`Change currency (${to})`}
                  onPress={() => {
                    setPicking('to');
                    setQuery('');
                  }}
                  style={{ width: 116, padding: spacing.s4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <AppText weight="medium" style={{ fontSize: 14, color: colors.navy }}>
                    {to}
                  </AppText>
                  <CaretDownIcon size={14} color={colors.fg3} />
                </Pressable>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.s3, marginTop: spacing.s4, marginHorizontal: 4 }}>
              <AppText style={{ fontSize: 12.5, color: colors.fg2, fontVariant: ['tabular-nums'] }}>
                1 {from} = {rate ? formatRate(rate) : '—'} {to}
              </AppText>
              <GoldButton onPress={refresh}>{loading ? 'Updating…' : 'Refresh'}</GoldButton>
            </View>
          </>
        )}
      </ScrollView>

      <BottomSheet open={!!picking} onClose={() => setPicking(null)} title={picking === 'from' ? 'Convert from' : 'Convert to'}>
        <Field label="Search" value={query} onChangeText={setQuery} placeholder="Currency or code" autoFocus />
        {shown.map((c, i) => {
          const active = c === (picking === 'from' ? from : to);
          return (
            <RadioRow
              key={c}
              label={`${c} · ${FX_NAMES[c]}`}
              on={active}
              last={i === shown.length - 1}
              onPress={() => {
                if (picking === 'from') {
                  setFrom(c);
                  if (c === to) setTo(from);
                } else {
                  setTo(c);
                  if (c === from) setFrom(to);
                }
                setPicking(null);
              }}
            />
          );
        })}
        {shown.length === 0 ? (
          <View style={{ paddingVertical: spacing.s5, alignItems: 'center' }}>
            <AppText style={{ fontSize: 13, color: colors.fg3 }}>No currency matches “{query}”.</AppText>
          </View>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

export default CurrencyConverterScreen;
