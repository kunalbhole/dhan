import { Pressable, View } from 'react-native';
import AppText from './AppText';
import ContactAvatar from './ContactAvatar';
import { colors, radii, shadows, spacing } from '../theme';
import type { Friend } from '../lib/friendsStore';

export interface PeerRowProps {
  f: Friend;
  onPress?: () => void;
  onAction?: (f: Friend) => void;
}

// Ported from Dhan App 2/screens-split.jsx's PeerRow — fixed-width right
// column so the amount + action pill never collide with a long name.
function PeerRow({ f, onPress, onAction }: PeerRowProps) {
  const owesYou = f.net > 0;
  const settled = f.net === 0;

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
      <ContactAvatar f={f} size={48} fontSize={15} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="semibold" style={{ fontSize: 15, letterSpacing: -0.15 }} numberOfLines={1}>
          {f.name}
        </AppText>
        <AppText style={{ fontSize: 13, color: colors.fg3, marginTop: 2 }} numberOfLines={1}>
          {settled ? f.last : owesYou ? 'Owes you' : 'You owe'}
        </AppText>
      </View>
      <View style={{ width: 96, alignItems: 'flex-end' }}>
        <AppText weight="semibold" style={{ fontSize: 15, letterSpacing: -0.15, color: settled ? colors.fg3 : owesYou ? colors.income : colors.navy, fontVariant: ['tabular-nums'] }}>
          {settled ? '—' : `₹${Math.abs(f.net).toLocaleString('en-IN')}`}
        </AppText>
        {!settled ? (
          <Pressable
            onPress={() => onAction?.(f)}
            style={{
              marginTop: spacing.s2,
              width: '100%',
              height: 28,
              paddingHorizontal: spacing.s2,
              borderRadius: radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: owesYou ? colors.incomeBg : colors.expenseBg,
            }}
          >
            <AppText weight="semibold" style={{ fontSize: 12, color: owesYou ? colors.income : colors.navy }}>
              {owesYou ? 'Collect' : 'Settle'}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

export default PeerRow;
