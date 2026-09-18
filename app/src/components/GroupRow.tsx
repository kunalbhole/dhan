import { Pressable, View } from 'react-native';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import AppText from './AppText';
import AvatarStack from './AvatarStack';
import IconChip from './IconChip';
import { colors, radii, shadows, spacing } from '../theme';
import { GROUP_ICONS } from '../lib/groupIcons';
import { groupLedger, type Group } from '../lib/friendsStore';

export interface GroupRowProps {
  g: Group;
  onPress?: () => void;
}

// Ported from Dhan App 2/screens-split.jsx's GroupRow — reads the same
// derived ledger GroupDetailScreen shows, so the two always agree
// (matches the reference's own `window.groupLedger` cross-check).
function GroupRow({ g, onPress }: GroupRowProps) {
  const net = groupLedger(g).reduce((s, m) => s + m.net, 0);
  const settled = net === 0;
  const owed = net > 0;
  const Icon = GROUP_ICONS[g.icon] ?? UsersThreeIcon;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.bgElevated,
          borderRadius: radii.cardSm,
          padding: spacing.s4,
          marginBottom: spacing.s2,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.s4,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        },
        shadows.card,
      ]}
    >
      <IconChip icon={Icon} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="semibold" style={{ fontSize: 15, letterSpacing: -0.15 }} numberOfLines={1}>
          {g.name}
        </AppText>
        <View style={{ marginTop: 6 }}>
          <AvatarStack ids={g.members} />
        </View>
      </View>
      <AppText weight="semibold" style={{ fontSize: 13, color: settled ? colors.fg3 : owed ? colors.income : colors.navy, fontVariant: ['tabular-nums'] }}>
        {settled ? 'Settled' : `${owed ? "You're owed " : 'You owe '}₹${Math.abs(net).toLocaleString('en-IN')}`}
      </AppText>
    </Pressable>
  );
}

export default GroupRow;
