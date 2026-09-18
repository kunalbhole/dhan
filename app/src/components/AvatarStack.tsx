import { View } from 'react-native';
import AppText from './AppText';
import ContactAvatar from './ContactAvatar';
import { colors } from '../theme';
import { getFriend } from '../lib/friendsStore';

export interface AvatarStackProps {
  ids: string[];
  size?: number;
}

// Ported from Dhan App 2/screens-split.jsx's AvatarStack — max 3
// avatars overlapping, then a "+N" chip.
function AvatarStack({ ids, size = 28 }: AvatarStackProps) {
  const people = ids.map(id => getFriend(id)).filter((f): f is NonNullable<typeof f> => !!f);
  const shown = people.slice(0, 3);
  const extra = people.length - shown.length;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((f, i) => (
        <View
          key={f.id}
          style={{
            marginLeft: i ? -8 : 0,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: colors.bgElevated,
          }}
        >
          <ContactAvatar f={f} size={size} fontSize={Math.round(size * 0.36)} />
        </View>
      ))}
      {extra > 0 ? (
        <View
          style={{
            marginLeft: -8,
            width: size,
            height: size,
            borderRadius: 999,
            backgroundColor: colors.bgSurface,
            borderWidth: 2,
            borderColor: colors.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText weight="semibold" style={{ fontSize: Math.round(size * 0.36), color: colors.fg2 }}>
            +{extra}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

export default AvatarStack;
