import { View } from 'react-native';
import { TrendDownIcon } from 'phosphor-react-native/lib/module/icons/TrendDown';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import AppText from './AppText';
import Card from './Card';
import IconChip from './IconChip';
import { colors, spacing } from '../theme';
import { formatIndianNumber } from '../lib/format';

// Ported from insights.jsx's InsightsTeaser + INSIGHT_PERIODS.week (spent
// 8210, delta -12) — the reference's own hardcoded weekly-recap figures.
const WEEK_SPENT = 8210;
const WEEK_DELTA = -12;

export interface InsightsTeaserProps {
  onPress?: () => void;
}

function InsightsTeaser({ onPress }: InsightsTeaserProps) {
  return (
    <Card onPress={onPress} style={{ padding: spacing.s3 + 2, marginBottom: spacing.s4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4 }}>
        <IconChip icon={TrendDownIcon} color={colors.income} bg={colors.incomeBg} fill />
        <AppText style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: colors.navy, lineHeight: 19 }}>
          You spent{' '}
          <AppText weight="semibold" style={{ fontVariant: ['tabular-nums'] }}>
            ₹{formatIndianNumber(WEEK_SPENT)}
          </AppText>{' '}
          this week —{' '}
          <AppText weight="semibold" style={{ color: colors.income }}>
            down {Math.abs(WEEK_DELTA)}%
          </AppText>
        </AppText>
        <ArrowRightIcon size={15} color={colors.gold} />
      </View>
    </Card>
  );
}

export default InsightsTeaser;
