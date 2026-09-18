import { View } from 'react-native';
import AppText from './AppText';
import IconChip from './IconChip';
import Toggle from './Toggle';
import { colors, spacing } from '../theme';
import type { PhosphorIconProps } from './IconChip';
import type { ComponentType } from 'react';

// Ported from Dhan App 2/settings-sub.jsx's ToggleRow — the shared
// icon-led label/sub/switch row used by App lock, Notifications, and
// Privacy settings. The reference makes the whole row clickable; only the
// switch itself is interactive here, matching this app's own existing
// convention for a row+Toggle (see AddBillSheet's "Remind me" row) and
// avoiding a nested-Pressable double-toggle on the switch itself.
export interface ToggleRowProps {
  icon?: ComponentType<PhosphorIconProps>;
  label: string;
  sub?: string;
  on: boolean;
  onToggle: () => void;
  last?: boolean;
  disabled?: boolean;
}

function ToggleRow({ icon: Icon, label, sub, on, onToggle, last = false, disabled = false }: ToggleRowProps) {
  return (
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
          <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2, lineHeight: 17 }}>{sub}</AppText>
        ) : null}
      </View>
      <Toggle on={on} onToggle={disabled ? () => {} : onToggle} />
    </View>
  );
}

export default ToggleRow;
