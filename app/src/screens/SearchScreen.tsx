import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowLeft';
import { MagnifyingGlassIcon } from 'phosphor-react-native/lib/module/icons/MagnifyingGlass';
import { MagnifyingGlassMinusIcon } from 'phosphor-react-native/lib/module/icons/MagnifyingGlassMinus';
import { XCircleIcon } from 'phosphor-react-native/lib/module/icons/XCircle';
import { ClockCounterClockwiseIcon } from 'phosphor-react-native/lib/module/icons/ClockCounterClockwise';
import { ArrowUpLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowUpLeft';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import AppText from '../components/AppText';
import Card from '../components/Card';
import DetailRow from '../components/DetailRow';
import IconChip from '../components/IconChip';
import { colors, radii, spacing, typography } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { getBills, subscribeToBills } from '../lib/billsStore';
import { formatShortDate } from '../lib/dateRange';
import type { Bill } from '../lib/bills';
import { getRecentTransactions, type StoredTransaction } from '../lib/db';
import { getSearchRecents, saveSearchRecents, clearSearchRecents } from '../lib/searchRecents';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

type SearchItem =
  | { kind: 'txn'; id: string; title: string; sub: string; hay: string; ref: StoredTransaction }
  | { kind: 'bill'; id: string; title: string; sub: string; hay: string; ref: Bill };

// Group order/labels/nav-targets ported verbatim from screens-search.jsx's
// GROUPS. "Budgets" and "People" stay in the list (matching the reference's
// own layout) but never produce hits — this app has no budgets or
// friends/splits data source yet, same status as an empty `txns`/`bills`
// array would be in the reference itself.
const GROUPS: { kind: SearchItem['kind'] | 'budget' | 'person'; label: string; to: string }[] = [
  { kind: 'txn', label: 'Transactions', to: 'txn' },
  { kind: 'budget', label: 'Budgets', to: 'budget' },
  { kind: 'bill', label: 'Bills', to: 'bills' },
  { kind: 'person', label: 'People', to: 'splits' },
];

function buildIndex(txns: StoredTransaction[], bills: Bill[]): SearchItem[] {
  const items: SearchItem[] = [];
  txns.forEach(t => {
    const catName = CATEGORIES[t.category]?.name;
    items.push({
      kind: 'txn',
      id: `t${t.id}`,
      title: t.merchant ?? 'Unknown',
      sub: t.subtitle,
      ref: t,
      hay: [t.merchant, t.subtitle, catName, Math.abs(t.amount)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });
  });
  // Suggested bills aren't confirmed yet and dismissed ones are meant to
  // stay out of sight — only real, tracked bills are searchable.
  bills
    .filter(b => b.status !== 'suggested' && b.status !== 'dismissed')
    .forEach(b => {
      const due = formatShortDate(b.dueDate);
      items.push({
        kind: 'bill',
        id: `l${b.id}`,
        title: b.name,
        sub: `Due ${due} · ₹${b.amt.toLocaleString('en-IN')}`,
        ref: b,
        hay: [b.name, due, String(b.amt)].join(' ').toLowerCase(),
      });
    });
  return items;
}

// Destinations this screen links to that aren't built yet (bill detail,
// friend detail, and every "See all in X" target — the Transactions,
// Budget, Bills and Splits tabs themselves).
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[SearchScreen] nav ->', dest);
};

function SearchScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [recents, setRecents] = useState<string[]>([]);
  const [txns, setTxns] = useState<StoredTransaction[]>([]);
  const [bills, setBills] = useState<Bill[]>(getBills());

  useEffect(() => {
    getSearchRecents().then(setRecents);
    getRecentTransactions(500).then(setTxns);
  }, []);

  useEffect(() => subscribeToBills(() => setBills(getBills())), []);

  const index = useMemo(() => buildIndex(txns, bills), [txns, bills]);

  const term = q.trim().toLowerCase();
  const hits = useMemo(() => {
    if (!term) return [];
    return index.filter(x => x.hay.includes(term));
  }, [term, index]);

  const remember = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setRecents(prev => {
      const next = [v, ...prev.filter(r => r.toLowerCase() !== v.toLowerCase())].slice(0, 5);
      saveSearchRecents(next);
      return next;
    });
  };

  const open = (item: SearchItem) => {
    remember(q);
    if (item.kind === 'txn') navigation.navigate('TxnDetail', { transaction: item.ref });
    else navigation.navigate('BillDetail', { bill: item.ref });
  };

  const clearRecents = () => {
    setRecents([]);
    clearSearchRecents();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgElevated }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: spacing.s3 - 2, paddingHorizontal: spacing.s4, paddingBottom: spacing.s3 }}>
        <Pressable
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, borderRadius: radii.control, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <ArrowLeftIcon size={20} color={colors.fg1} />
        </Pressable>
        <View
          style={{
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.s2,
            height: 44,
            paddingHorizontal: spacing.s3,
            borderRadius: radii.input,
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <MagnifyingGlassIcon size={16} color={colors.fg3} />
          <TextInput
            value={q}
            autoFocus
            onChangeText={setQ}
            onBlur={() => remember(q)}
            placeholder="Search Dhan"
            placeholderTextColor={colors.fg3}
            accessibilityLabel="Search transactions, budgets, bills and people"
            style={{ flex: 1, minWidth: 0, fontFamily: typography.family.regular, fontSize: 14, color: colors.navy, padding: 0 }}
          />
          {q ? (
            <Pressable accessibilityLabel="Clear search" onPress={() => setQ('')}>
              <XCircleIcon size={16} color={colors.fg3} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        {!term ? (
          recents.length ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 4, marginBottom: spacing.s2, gap: spacing.s3 }}>
                <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.11 }}>
                  Recent searches
                </AppText>
                <Pressable onPress={clearRecents}>
                  <AppText weight="medium" style={{ fontSize: 12, color: colors.navy }}>
                    Clear
                  </AppText>
                </Pressable>
              </View>
              <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
                {recents.map((r, i, arr) => (
                  <DetailRow
                    key={r}
                    icon={ClockCounterClockwiseIcon}
                    label={r}
                    last={i === arr.length - 1}
                    onPress={() => setQ(r)}
                  >
                    <ArrowUpLeftIcon size={14} color={colors.fg4} />
                  </DetailRow>
                ))}
              </Card>
            </>
          ) : (
            <View style={{ paddingVertical: 48, paddingHorizontal: spacing.s2, alignItems: 'center' }}>
              <IconChip icon={MagnifyingGlassIcon} size={48} />
              <AppText style={{ fontSize: 13, color: colors.fg3, lineHeight: 20, marginTop: spacing.s4, maxWidth: 240, textAlign: 'center' }}>
                Search transactions, budgets, bills, and people.
              </AppText>
            </View>
          )
        ) : !hits.length ? (
          <View style={{ paddingVertical: 48, paddingHorizontal: spacing.s2, alignItems: 'center' }}>
            <IconChip icon={MagnifyingGlassMinusIcon} size={48} />
            <AppText weight="semibold" style={{ fontSize: 15, color: colors.navy, marginTop: spacing.s4 }}>
              No results for “{q.trim()}”
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.fg3, lineHeight: 20, marginTop: spacing.s2, maxWidth: 250, textAlign: 'center' }}>
              Check the spelling or try a different term.
            </AppText>
          </View>
        ) : (
          GROUPS.map(g => {
            const found = hits.filter(h => h.kind === g.kind);
            if (!found.length) return null;
            const shown = found.slice(0, 3);
            return (
              <View key={g.kind} style={{ marginBottom: spacing.s4 }}>
                <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.11, marginHorizontal: 4, marginBottom: spacing.s2 }}>
                  {g.label} · {found.length}
                </AppText>
                <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
                  {shown.map((item, i) => {
                    const isTxn = item.kind === 'txn';
                    // Bills carry a real category now too (see lib/bills.ts),
                    // so both kinds resolve their icon/color the same way.
                    const cat = CATEGORIES[item.ref.category] ?? CATEGORIES.other;
                    const icon = CATEGORY_ICONS[item.ref.category] ?? CATEGORY_ICONS.other;
                    return (
                      <DetailRow
                        key={item.id}
                        icon={icon}
                        iconColor={cat.color}
                        iconBg={`${cat.color}1F`}
                        label={item.title}
                        sub={item.sub}
                        last={i === shown.length - 1}
                        chevron
                        onPress={() => open(item)}
                      >
                        {isTxn ? (
                          <AppText weight="semibold" style={{ fontSize: 14, color: item.ref.amount > 0 ? colors.income : colors.fg1, fontVariant: ['tabular-nums'] }}>
                            {item.ref.amount > 0 ? '+' : '−'}₹{Math.abs(item.ref.amount).toLocaleString('en-IN')}
                          </AppText>
                        ) : (
                          `₹${item.ref.amt.toLocaleString('en-IN')}`
                        )}
                      </DetailRow>
                    );
                  })}
                </Card>
                {found.length > shown.length ? (
                  <Pressable
                    onPress={() => {
                      remember(q);
                      stubNav(g.to);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: spacing.s3 - 2, paddingHorizontal: 4 }}
                  >
                    <AppText weight="medium" style={{ fontSize: 12, color: colors.navy }}>
                      See all in {g.label}
                    </AppText>
                    <CaretRightIcon size={12} color={colors.navy} />
                  </Pressable>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default SearchScreen;
