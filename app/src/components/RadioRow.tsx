import { Pressable, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native/lib/module/icons/Check';
import AppText from './AppText';
import IconChip from './IconChip';
import { colors, spacing } from '../theme';
import type { PhosphorIconProps } from './IconChip';
import type { ComponentType } from 'react';

// Ported from Dhan App 2/settings-sub.jsx's RadioRow + components.jsx's
// SelectIndicator — the shared single-select row used by Language,
// Currency, Appearance, Export data's format/range pickers, and App
// lock's method picker.
export interface RadioRowProps {
  icon?: ComponentType<PhosphorIconProps>;
  label: string;
  sub?: string;
  on: boolean;
  onPress: () => void;
  last?: boolean;
  disabled?: boolean;
}

function RadioRow({ icon: Icon, label, sub, on, onPress, last = false, disabled = false }: RadioRowProps) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} disabled={disabled}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.s4,
          paddingVertical: spacing.s4,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: colors.borderSubtle,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {Icon ? <IconChip icon={Icon} /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText style={{ fontSize: 14, color: colors.fg2 }}>{label}</AppText>
          {sub ? (
            <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{sub}</AppText>
          ) : null}
        </View>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: on ? colors.navy : colors.borderStrong,
            backgroundColor: on ? colors.navy : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {on ? <CheckIcon size={14} color={colors.bgBase} weight="bold" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

export default RadioRow;
