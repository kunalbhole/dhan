import { Pressable, View } from 'react-native';
import AppText from './AppText';
import CategoryIcon from './CategoryIcon';
import { colors, spacing } from '../theme';
import { formatIndianNumber } from '../lib/format';

export interface TxnRowProps {
  merchant: string;
  meta: string;
  amount: number;
  cat: string;
  last?: boolean;
  onPress?: () => void;
  isForeign?: boolean;
  currency?: string;
  originalAmount?: number;
  budgetTag?: string;
}

// Ported from components.jsx's TxnRow — 40px icon / flexible middle /
// fixed-trailing-column grid, hairline divider unless `last`, plus the
// forex-fee and foreign-currency badge paths (exercised by the "Figma Inc"
// and "Forex markup fee" sample rows).
function TxnRow({ merchant, meta, amount, cat, last = false, onPress, isForeign = false, currency, originalAmount, budgetTag }: TxnRowProps) {
  const isIn = amount > 0;
  const isFee = cat === 'forex-fee';

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s3,
        paddingVertical: spacing.s4,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.borderSubtle,
      }}
    >
      <CategoryIcon cat={cat} tint />
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="medium" numberOfLines={1} style={{ fontSize: 14 }}>
          {merchant}
        </AppText>
        <AppText numberOfLines={1} style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
          {meta}
        </AppText>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4, minWidth: 0 }}>
        <AppText
          weight="semibold"
          style={{ fontSize: 15, color: isIn ? colors.income : colors.fg1, fontVariant: ['tabular-nums'] }}
        >
          {isIn ? '+' : '−'}₹{formatIndianNumber(amount)}
        </AppText>
        {isFee ? (
          <View style={pillStyle(colors.bgSurface, colors.borderSubtle)}>
            <AppText weight="medium" style={pillTextStyle(colors.fg2)}>
              Forex Fee
            </AppText>
          </View>
        ) : isForeign && currency ? (
          <View style={pillStyle('rgba(201,168,76,.18)')}>
            <AppText weight="medium" style={pillTextStyle(colors.fg1)}>
              {currency}
              {originalAmount ? ` ${originalAmount}` : ''}
            </AppText>
          </View>
        ) : null}
        {budgetTag ? (
          <View style={pillStyle(colors.bgSurface, colors.borderDefault)}>
            <AppText weight="semibold" style={pillTextStyle(colors.fg1)}>
              {budgetTag}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

function pillStyle(background: string, borderColor?: string) {
  return {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: background,
    ...(borderColor ? { borderWidth: 1, borderColor } : null),
  } as const;
}

function pillTextStyle(color: string) {
  return { fontSize: 10.5, color, letterSpacing: 0.2 } as const;
}

export default TxnRow;
