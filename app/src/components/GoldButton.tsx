import type { ComponentType, ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import AppText from './AppText';
import { colors, radii, spacing } from '../theme';
import type { PhosphorIconProps } from './IconChip';

export interface GoldButtonProps {
  children: ReactNode;
  onPress?: () => void;
  iconRight?: ComponentType<PhosphorIconProps>;
  style?: StyleProp<ViewStyle>;
}

// CLAUDE.md's `.gold-btn`: 1px solid gold border, 8px radius, 8/16px
// padding, light gold fill (rgba(201,168,76,.14)), gold text, weight 600,
// 6px gap. Used for CTAs like "Categorise now" — never for Home's "See
// all" links, which are plain navy Medium 12px + caret (see the section
// header row inline in HomeScreen, not this component).
function GoldButton({ children, onPress, iconRight: IconRight, style }: GoldButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.s2 - 2,
            borderWidth: 1,
            borderColor: colors.gold,
            borderRadius: radii.input,
            paddingVertical: spacing.s2,
            paddingHorizontal: spacing.s4,
            backgroundColor: 'rgba(201,168,76,.14)',
          },
          style,
        ]}
      >
        <AppText weight="semibold" style={{ fontSize: 13, color: colors.gold }}>
          {children}
        </AppText>
        {IconRight ? <IconRight size={15} color={colors.gold} /> : null}
      </View>
    </Pressable>
  );
}

export default GoldButton;
