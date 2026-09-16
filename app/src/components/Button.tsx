import { ComponentType } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import AppText from './AppText';
import { colors, radii, typography } from '../theme';

// Ported from Dhan App 2/components.jsx's Button — same variants/sizes.
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'gold'
  | 'ghost'
  | 'outline'
  | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Loose enough to accept both phosphor icon components (IconProps is a
// superset of this) and one-off brand marks like GoogleIcon that only
// care about `size`.
export type ButtonIcon = ComponentType<{ size?: number; color?: string }>;

export interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  icon?: ButtonIcon;
  iconRight?: ButtonIcon;
}

const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 36, paddingHorizontal: 14, fontSize: typography.scale.bodySm.fontSize },
  md: { height: 48, paddingHorizontal: 20, fontSize: typography.scale.body.fontSize },
  lg: { height: 56, paddingHorizontal: 24, fontSize: 16 },
};

const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; borderColor?: string }> = {
  primary: { bg: colors.navy, fg: colors.fgOnDark },
  secondary: { bg: colors.bgSurface, fg: colors.navy },
  gold: { bg: colors.gold, fg: colors.fgOnGold },
  ghost: { bg: 'transparent', fg: colors.navy },
  outline: { bg: colors.bgBase, fg: colors.navy, borderColor: colors.borderDefault },
  destructive: { bg: colors.expenseBg, fg: colors.expense },
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  onPress,
  icon: Icon,
  iconRight: IconRight,
}: ButtonProps) {
  const sizeStyle = SIZES[size];
  const variantStyle = VARIANTS[variant];

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }): ViewStyle => ({
        height: sizeStyle.height,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        backgroundColor: variantStyle.bg,
        borderRadius: radii.control,
        borderWidth: variantStyle.borderColor ? 1 : 0,
        borderColor: variantStyle.borderColor,
        width: full ? '100%' : undefined,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      })}
    >
      {Icon && <Icon size={18} color={variantStyle.fg} />}
      <AppText
        weight="semibold"
        style={[styles.label, { color: variantStyle.fg, fontSize: sizeStyle.fontSize }]}
      >
        {children}
      </AppText>
      {IconRight && <IconRight size={18} color={variantStyle.fg} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
  },
});

export default Button;
