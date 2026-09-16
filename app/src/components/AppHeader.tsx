import { Pressable, View } from 'react-native';
import { MagnifyingGlassIcon } from 'phosphor-react-native/lib/module/icons/MagnifyingGlass';
import { BellIcon } from 'phosphor-react-native/lib/module/icons/Bell';
import DhanMark from '../assets/DhanMark';
import { colors, radii, spacing } from '../theme';

export interface AppHeaderProps {
  onMenu?: () => void;
  onSearch?: () => void;
  onNotify?: () => void;
  unread?: boolean;
}

// Ported from components.jsx's AppHeader — logo button (opens More) on the
// left, search + notifications (with unread dot) on the right.
function AppHeader({ onMenu, onSearch, onNotify, unread = true }: AppHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.s4,
        paddingBottom: spacing.s2,
        gap: spacing.s2,
      }}
    >
      <Pressable
        onPress={onMenu}
        accessibilityLabel="Menu"
        style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
      >
        <DhanMark size={32} />
      </Pressable>
      <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
        <Pressable onPress={onSearch} accessibilityLabel="Search" style={headerBtnStyle}>
          <MagnifyingGlassIcon size={20} color={colors.navy} />
        </Pressable>
        <Pressable onPress={onNotify} accessibilityLabel="Notifications" style={[headerBtnStyle, { position: 'relative' }]}>
          <BellIcon size={20} color={colors.navy} />
          {unread ? (
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: radii.pill,
                backgroundColor: colors.gold,
                borderWidth: 2,
                borderColor: colors.bgElevated,
              }}
            />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const headerBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: radii.input,
  backgroundColor: colors.bgElevated,
  borderWidth: 1,
  borderColor: colors.borderSubtle,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export default AppHeader;
