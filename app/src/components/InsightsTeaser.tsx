import { View } from 'react-native';
import { TrendDownIcon } from 'phosphor-react-native/lib/module/icons/TrendDown';
import { TrendUpIcon } from 'phosphor-react-native/lib/module/icons/TrendUp';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import AppText from './AppText';
import Card from './Card';
import IconChip from './IconChip';
import { colors, spacing } from '../theme';
import { formatIndianNumber } from '../lib/format';

// Ported from insights.jsx's InsightsTeaser, but driven by real numbers —
// HomeScreen passes the output of lib/insights.ts's computeSummary('week')
// instead of the reference's hardcoded spent:8210/delta:-12.
export interface InsightsTeaserProps {
  spent: number;
  deltaPct: number; // negative = down vs. last week
  onPress?: () => void;
}

function InsightsTeaser({ spent, deltaPct, onPress }: InsightsTeaserProps) {
  const down = deltaPct <= 0;
  return (
    <Card onPress={onPress} style={{ padding: spacing.s3 + 2, marginBottom: spacing.s4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4 }}>
        <IconChip icon={down ? TrendDownIcon : TrendUpIcon} color={down ? colors.income : colors.expense} bg={down ? colors.incomeBg : colors.expenseBg} fill />
        <AppText style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: colors.navy, lineHeight: 19 }}>
          You spent{' '}
          <AppText weight="semibold" style={{ fontVariant: ['tabular-nums'] }}>
            ₹{formatIndianNumber(spent)}
          </AppText>{' '}
          this week —{' '}
          <AppText weight="semibold" style={{ color: down ? colors.income : colors.expense }}>
            {down ? 'down' : 'up'} {Math.abs(deltaPct)}%
          </AppText>
        </AppText>
        <ArrowRightIcon size={15} color={colors.gold} />
      </View>
    </Card>
  );
}

export default InsightsTeaser;
