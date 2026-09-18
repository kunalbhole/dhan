import type { ComponentType } from 'react';
import { Pressable } from 'react-native';
import { PlusIcon } from 'phosphor-react-native/lib/module/icons/Plus';
import { colors, shadows } from '../theme';
import type { PhosphorIconProps } from './IconChip';

// Ported from Dhan App 2/components.jsx's FAB — navy circle, fixed to the
// bottom-right just above the TabBar. The reference uses bottom: 92 in its
// fixed-size "Phone" frame mock, but TabBar.tsx's real height here is 76 +
// 8 (paddingTop) + 18 (paddingBottom) = 102px, so 92 actually left the
// FAB's bottom ~10px inside the tab bar — overlapping (and, being on top
// in paint order, swallowing taps for) the rightmost tab, Split. Bumped
// to clear the tab bar with a small gap instead.
export interface FABProps {
  onPress?: () => void;
  icon?: ComponentType<PhosphorIconProps>;
}

function FAB({ onPress, icon: Icon = PlusIcon }: FABProps) {
  return (
    <Pressable
      accessibilityLabel="Add"
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: 'absolute',
          bottom: 110,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 999,
          backgroundColor: colors.navy,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.9 : 1,
        },
        shadows.lg,
      ]}
    >
      <Icon size={26} color={colors.fgOnDark} weight="bold" />
    </Pressable>
  );
}

export default FAB;
