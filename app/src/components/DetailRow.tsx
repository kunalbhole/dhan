import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import AppText from './AppText';
import IconChip from './IconChip';
import { colors, spacing } from '../theme';
import type { PhosphorIconProps } from './IconChip';
import type { ComponentType } from 'react';

// Ported from Dhan App 2/components.jsx's DetailRow — the shared icon-led
// label/value row standard (Transaction Detail visual standard per
// CLAUDE.md: icon chip + regular-weight label + hairline divider, 16px
// row padding, fixed-width right column for aligned amounts/pills).
export interface DetailRowProps {
  icon: ComponentType<PhosphorIconProps>;
  iconColor?: string;
  iconBg?: string;
  label: string;
  labelColor?: string;
  sub?: string;
  children?: ReactNode;
  last?: boolean;
  onPress?: () => void;
  chevron?: boolean;
}

function DetailRow({ icon, iconColor, iconBg, label, labelColor, sub, children, last = false, onPress, chevron = false }: DetailRowProps) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s4,
        paddingVertical: spacing.s4,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.borderSubtle,
      }}
    >
      <IconChip icon={icon} color={iconColor} bg={iconBg} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText style={{ fontSize: 14, color: labelColor ?? colors.fg2 }}>{label}</AppText>
        {sub ? (
          <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{sub}</AppText>
        ) : null}
      </View>
      {typeof children === 'string' || typeof children === 'number' ? (
        <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
          {children}
        </AppText>
      ) : (
        children
      )}
      {chevron ? <CaretRightIcon size={14} color={colors.fg4} /> : null}
    </View>
  );

  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default DetailRow;
