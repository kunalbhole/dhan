import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DotsThreeIcon } from 'phosphor-react-native/lib/module/icons/DotsThree';
import { CalendarBlankIcon } from 'phosphor-react-native/lib/module/icons/CalendarBlank';
import { WalletIcon } from 'phosphor-react-native/lib/module/icons/Wallet';
import { CreditCardIcon } from 'phosphor-react-native/lib/module/icons/CreditCard';
import { HashIcon } from 'phosphor-react-native/lib/module/icons/Hash';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { NotePencilIcon } from 'phosphor-react-native/lib/module/icons/NotePencil';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import { ShareNetworkIcon } from 'phosphor-react-native/lib/module/icons/ShareNetwork';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import { XIcon } from 'phosphor-react-native/lib/module/icons/X';
import { TrendUpIcon } from 'phosphor-react-native/lib/module/icons/TrendUp';
import { CurrencyCircleDollarIcon } from 'phosphor-react-native/lib/module/icons/CurrencyCircleDollar';
import { ArrowsLeftRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowsLeftRight';
import { InfoIcon } from 'phosphor-react-native/lib/module/icons/Info';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import StatusPill from '../components/StatusPill';
import DetailRow from '../components/DetailRow';
import IconChip from '../components/IconChip';
import BottomSheet from '../components/BottomSheet';
import SelectIndicator from '../components/SelectIndicator';
import { colors, radii, spacing, typography } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { formatDay } from '../lib/format';
import { deleteTransaction } from '../lib/db';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TxnDetail'>;

// screens-extra-detail.jsx's fmt() for the currency-details block — n with
// Indian digit grouping plus a fixed decimal count, no Intl (same reason
// as lib/format.ts: Hermes's en-IN locale data isn't guaranteed).
function fmt(n: number, d = 2): string {
  const fixed = n.toFixed(d);
  const [intPart, decPart] = fixed.split('.');
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const groupedRest = rest === '' ? '' : `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},`;
  const grouped = groupedRest + lastThree;
  return decPart ? `${grouped}.${decPart}` : grouped;
}

// Ported from Dhan App 2/screens-extra-detail.jsx's TxnDetailScreen (16).
// Sections that depend on features this app doesn't have yet — the
// learned-budget-suggestion banner, group/split context rows — stay out
// entirely rather than rendered-but-stubbed, matching the reference's own
// conditional rendering (it hides them too when that data is absent).
// "Split with friends" and the 3-dot "Share screenshot" action are real
// UI from the reference kept as no-op taps: Split is a future screen
// (Splits tab, not yet built) and "Share screenshot" is a no-op in the
// reference itself (its own handler only closes the menu).
function TxnDetailScreen({ route, navigation }: Props) {
  const { transaction: t } = route.params;
  const [menu, setMenu] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [budgetPick, setBudgetPick] = useState(false);
  const [budgetId] = useState('personal');
  const [budgetName] = useState('Personal');
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isIncome = t.amount > 0;
  const cat = CATEGORIES[t.category] || CATEGORIES.other;
  const CatIcon = CATEGORY_ICONS[t.category] || CATEGORY_ICONS.other;
  const merchant = t.merchant ?? 'Unknown';
  const day = formatDay(t.timestamp);

  const addTag = () => {
    if (newTag && newTag.trim()) setTags(ts => [...ts, newTag.trim()]);
    setNewTag(null);
  };

  const handleDelete = async () => {
    setConfirmDel(false);
    setDeleting(true);
    await deleteTransaction(t.id);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Transaction"
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            accessibilityLabel="More actions"
            onPress={() => setMenu(true)}
            style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}
          >
            <DotsThreeIcon size={20} color={colors.fg1} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', paddingVertical: spacing.s3, paddingBottom: spacing.s5 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.cardLg,
              backgroundColor: `${cat.color}1A`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.s3 + 2,
            }}
          >
            <CatIcon size={30} color={cat.color} weight="fill" />
          </View>
          <AppText weight="bold" style={{ fontSize: 18 }}>
            {merchant}
          </AppText>
          <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{day}</AppText>
          <AppText
            weight="bold"
            style={{
              fontSize: 38,
              marginTop: 14,
              color: isIncome ? colors.income : colors.fg1,
              fontVariant: ['tabular-nums'],
              letterSpacing: -0.76,
            }}
          >
            {isIncome ? '+' : '−'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
          </AppText>
        </View>

        {/* Currency details — foreign transactions only */}
        {t.isForeignTransaction && t.originalAmount ? (
          (() => {
            const inr = t.inrAmount ?? Math.abs(t.amount);
            const rate = inr / t.originalAmount!;
            return (
              <View style={{ marginBottom: spacing.s4 }}>
                <AppText weight="medium" style={{ fontSize: 16, marginHorizontal: 4, marginBottom: spacing.s2 }}>
                  Currency details
                </AppText>
                <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
                  <DetailRow icon={CurrencyCircleDollarIcon} label="Original amount">
                    {fmt(t.originalAmount!)} {t.originalCurrency}
                  </DetailRow>
                  <DetailRow icon={ArrowsLeftRightIcon} label="Converted to INR">
                    ₹{fmt(inr, 0)}
                  </DetailRow>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s4, paddingVertical: spacing.s4 }}>
                    <IconChip icon={TrendUpIcon} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText style={{ fontSize: 14, color: colors.fg2 }}>Approx. rate used by your bank</AppText>
                      <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 4, lineHeight: 18 }}>
                        Your bank sets this rate at the time of the transaction — it may differ slightly from the market rate.
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy, fontVariant: ['tabular-nums'] }}>
                      ₹{fmt(rate)}
                    </AppText>
                  </View>
                </Card>
                <View style={{ flexDirection: 'row', gap: spacing.s2, paddingTop: spacing.s2, paddingHorizontal: 4 }}>
                  <InfoIcon size={14} color={colors.fg3} />
                  <AppText style={{ flex: 1, fontSize: 12, color: colors.fg3, lineHeight: 18 }}>
                    Your bank may charge a separate forex fee for this transaction. Check your Forex Fee entries in Transactions.
                  </AppText>
                </View>
              </View>
            );
          })()
        ) : null}

        {/* Detail rows */}
        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s3 }}>
          <DetailRow icon={CalendarBlankIcon} label="Date & time">
            {day}
          </DetailRow>
          <DetailRow icon={CatIcon} iconColor={cat.color} iconBg={`${cat.color}1A`} label="Category">
            {cat.name}
          </DetailRow>
          <DetailRow icon={WalletIcon} label="Budget" onPress={() => setBudgetPick(true)} chevron>
            {budgetName}
          </DetailRow>
          <DetailRow icon={CreditCardIcon} label="Payment method">
            UPI · HDFC ••4521
          </DetailRow>
          <DetailRow icon={HashIcon} label="Reference">
            UPI/411923847211
          </DetailRow>
          <DetailRow icon={CheckCircleIcon} label="Status" last>
            <StatusPill tone="income">Posted</StatusPill>
          </DetailRow>
        </Card>

        {/* Notes · tags */}
        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s4, paddingVertical: spacing.s4 }}>
            <IconChip icon={NotePencilIcon} color={editing ? colors.gold : colors.navy} bg={editing ? colors.goldBg : colors.bgSurface} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText style={{ fontSize: 14, color: colors.fg2 }}>Notes</AppText>
                {editing ? (
                  <View style={{ flexDirection: 'row', gap: spacing.s3 }}>
                    <Pressable
                      onPress={() => {
                        setEditing(false);
                        setNewTag(null);
                      }}
                    >
                      <AppText weight="medium" style={{ fontSize: 12.5, color: colors.fg3 }}>
                        Cancel
                      </AppText>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setEditing(false);
                        setNewTag(null);
                      }}
                      style={{ borderWidth: 1, borderColor: colors.gold, borderRadius: radii.input, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(201,168,76,.14)' }}
                    >
                      <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.gold }}>
                        Done
                      </AppText>
                    </Pressable>
                  </View>
                ) : null}
              </View>

              {editing ? (
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  autoFocus
                  multiline
                  numberOfLines={3}
                  placeholder="Add a note…"
                  placeholderTextColor={colors.fg3}
                  style={{
                    width: '100%',
                    marginTop: spacing.s2,
                    padding: spacing.s3,
                    borderWidth: 1,
                    borderColor: colors.borderDefault,
                    borderRadius: radii.input,
                    fontFamily: typography.family.regular,
                    fontSize: 14,
                    color: colors.navy,
                    lineHeight: 21,
                    minHeight: 72,
                    textAlignVertical: 'top',
                    backgroundColor: colors.bgElevated,
                  }}
                />
              ) : (
                <AppText weight={notes ? 'medium' : 'regular'} style={{ fontSize: 14, color: notes ? colors.navy : colors.fg3, marginTop: 4, lineHeight: 21 }}>
                  {notes || 'No note yet'}
                </AppText>
              )}

              <View style={{ flexDirection: 'row', gap: spacing.s2, marginTop: spacing.s3, flexWrap: 'wrap' }}>
                {tags.map(tag => (
                  <View
                    key={tag}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.bgSurface, paddingVertical: 4, paddingHorizontal: 12, borderRadius: radii.pill }}
                  >
                    <AppText style={{ fontSize: 12, color: colors.fg2 }}>#{tag}</AppText>
                    {editing ? (
                      <Pressable accessibilityLabel={`Remove ${tag}`} onPress={() => setTags(ts => ts.filter(x => x !== tag))}>
                        <XIcon size={11} color={colors.fg3} />
                      </Pressable>
                    ) : null}
                  </View>
                ))}
                {newTag !== null ? (
                  <TextInput
                    value={newTag}
                    autoFocus
                    onChangeText={v => setNewTag(v.replace(/[^\w-]/g, ''))}
                    onSubmitEditing={addTag}
                    onBlur={addTag}
                    placeholder="tag name"
                    placeholderTextColor={colors.fg3}
                    style={{
                      width: 96,
                      height: 26,
                      borderRadius: radii.pill,
                      borderWidth: 1,
                      borderColor: colors.gold,
                      paddingHorizontal: 12,
                      fontFamily: typography.family.regular,
                      fontSize: 12,
                      color: colors.navy,
                      backgroundColor: colors.bgElevated,
                    }}
                  />
                ) : (
                  <Pressable
                    onPress={() => {
                      setEditing(true);
                      setNewTag('');
                    }}
                    style={{ borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radii.pill, paddingVertical: 3, paddingHorizontal: 12 }}
                  >
                    <AppText style={{ fontSize: 12, color: colors.fg3 }}>+ Add tag</AppText>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </Card>

        {/* Split action */}
        <Card onPress={() => {}} style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s3 }}>
          <DetailRow icon={UsersThreeIcon} label="Split with friends" sub="Share this expense · equal or custom" last chevron onPress={() => {}} />
        </Card>

        {/* Mini budget impact */}
        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.11, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          Impact on {cat.name} budget
        </AppText>
        <Card style={{ padding: spacing.s3 + 2, marginBottom: spacing.s3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s2 }}>
            <AppText weight="semibold" style={{ fontSize: 12, color: colors.fg2 }}>
              ₹3,200 of ₹5,000
            </AppText>
            <AppText weight="semibold" style={{ fontSize: 12, color: colors.fg3 }}>
              64%
            </AppText>
          </View>
          <View style={{ height: 8, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden' }}>
            <View style={{ width: '64%', height: '100%', backgroundColor: cat.color, borderRadius: radii.pill }} />
          </View>
        </Card>
      </ScrollView>

      {/* 3-dot actions */}
      <BottomSheet open={menu} onClose={() => setMenu(false)} title="Transaction actions">
        {[
          { Icon: ShareNetworkIcon, label: 'Share screenshot', sub: 'Send a PNG of this receipt', danger: false, go: () => setMenu(false) },
          { Icon: NotePencilIcon, label: 'Edit', sub: 'Notes and tags only', danger: false, go: () => { setMenu(false); setEditing(true); } },
          { Icon: TrashIcon, label: 'Delete transaction', sub: "This can't be undone", danger: true, go: () => { setMenu(false); setConfirmDel(true); } },
        ].map((a, i, arr) => (
          <Pressable
            key={a.label}
            onPress={a.go}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}
          >
            <IconChip icon={a.Icon} color={a.danger ? colors.expense : colors.navy} bg={a.danger ? colors.expenseBg : colors.bgSurface} />
            <View>
              <AppText weight="medium" style={{ fontSize: 14, color: a.danger ? colors.expense : colors.navy }}>
                {a.label}
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{a.sub}</AppText>
            </View>
          </Pressable>
        ))}
      </BottomSheet>

      {/* Assign to budget */}
      <BottomSheet open={budgetPick} onClose={() => setBudgetPick(false)} title="Assign to budget">
        <Pressable
          onPress={() => setBudgetPick(false)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4 }}
        >
          <IconChip icon={WalletIcon} />
          <AppText style={{ flex: 1, fontSize: 14, color: colors.fg2 }}>Personal</AppText>
          <SelectIndicator on={budgetId === 'personal'} />
        </Pressable>
        <AppText style={{ fontSize: 11, color: colors.fg3, lineHeight: 15, paddingTop: spacing.s2 }}>
          Dhan remembers this choice and suggests it for similar transactions later.
        </AppText>
      </BottomSheet>

      {/* Delete confirmation */}
      <BottomSheet open={confirmDel} onClose={() => setConfirmDel(false)} title="Delete transaction?">
        <AppText style={{ fontSize: 13, color: colors.fg2, lineHeight: 20, marginBottom: spacing.s4 }}>
          {merchant} · ₹{Math.abs(t.amount).toLocaleString('en-IN')} will be removed from your transactions. This can&apos;t be undone.
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" full onPress={() => setConfirmDel(false)}>
              Cancel
            </Button>
          </View>
          <Pressable
            onPress={handleDelete}
            disabled={deleting}
            style={{ flex: 1, height: 48, borderRadius: radii.control, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.expense, opacity: deleting ? 0.6 : 1 }}
          >
            <AppText weight="semibold" style={{ fontSize: 14, color: colors.fgOnDark }}>
              Delete
            </AppText>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

export default TxnDetailScreen;
