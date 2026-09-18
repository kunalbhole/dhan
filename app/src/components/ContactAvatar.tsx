import { View } from 'react-native';
import AppText from './AppText';
import { colors } from '../theme';

export function initials(name: string): string {
  return name
    .split(' ')
    .map(s => s[0])
    .join('')
    .slice(0, 2);
}

export interface ContactAvatarProps {
  f: { name: string };
  size?: number;
  fontSize?: number;
}

// Ported from Dhan App 2/screens-split.jsx's ContactAvatar. The reference
// swaps in a real device-contacts photo when one exists (`hasPhoto`); this
// app has no contacts integration at all, so every avatar is always the
// initials circle — the reference's own fallback path, not a stub.
function ContactAvatar({ f, size = 48, fontSize }: ContactAvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: colors.navy,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <AppText weight="semibold" style={{ fontSize: fontSize ?? Math.round(size * 0.31), color: colors.fgOnDark, letterSpacing: 0.2 }}>
        {initials(f.name)}
      </AppText>
    </View>
  );
}

export default ContactAvatar;
