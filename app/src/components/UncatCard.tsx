import { View } from 'react-native';
import { TrayIcon } from 'phosphor-react-native/lib/module/icons/Tray';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import AppText from './AppText';
import Card from './Card';
import GoldButton from './GoldButton';
import IconChip from './IconChip';
import { colors, spacing } from '../theme';
import { UNCAT_TXNS, type UncatTxn } from '../lib/sampleData';
import { formatIndianNumber } from '../lib/format';

export interface UncatCardProps {
  list?: UncatTxn[];
  onCategorise?: () => void;
}

const uncatTotal = (list: UncatTxn[]) => list.reduce((s, t) => s + Math.abs(t.a), 0);

// Ported from screens-main.jsx's UncatCard — shared between Home and the
// Uncategorised screen (not yet built).
function UncatCard({ list = UNCAT_TXNS, onCategorise }: UncatCardProps) {
  if (!list.length) return null;

  return (
    <Card style={{ marginBottom: spacing.s4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4 }}>
        <IconChip icon={TrayIcon} color={colors.gold} bg={colors.goldBg} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText weight="semibold" style={{ fontSize: 14 }}>
            Uncategorised
          </AppText>
          <AppText style={{ fontSize: 12.5, color: colors.fg3, marginTop: 2, fontVariant: ['tabular-nums'] }}>
            {list.length} transactions · ₹{formatIndianNumber(uncatTotal(list))} uncategorised
          </AppText>
        </View>
      </View>
      <GoldButton onPress={onCategorise} iconRight={ArrowRightIcon} style={{ marginTop: spacing.s4, width: '100%' }}>
        Categorise now
      </GoldButton>
    </Card>
  );
}

export default UncatCard;
