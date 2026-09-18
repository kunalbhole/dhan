import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import AppText from './AppText';
import { colors, radii } from '../theme';

// Ported from Dhan App 2/components.jsx's Chip — the shared filter/select
// pill (bucket filters on Transactions, type/period chips in the sheets).
export interface ChipProps {
  active?: boolean;
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Chip({ active = false, onPress, children, style }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: radii.pill,
          backgroundColor: active ? colors.navy : colors.bgSurface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <AppText weight="semibold" style={{ fontSize: 13, color: active ? colors.fgOnDark : colors.fg2 }}>
        {children}
      </AppText>
    </Pressable>
  );
}

export default Chip;
