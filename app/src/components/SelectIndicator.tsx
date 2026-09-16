import { View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native/lib/module/icons/Check';
import { colors } from '../theme';

// Ported from Dhan App 2/components.jsx's SelectIndicator — shared
// navy-circle-plus-tick used by every radio/check row across the app.
export interface SelectIndicatorProps {
  on: boolean;
  size?: number;
}

function SelectIndicator({ on, size = 22 }: SelectIndicatorProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        flexShrink: 0,
        borderWidth: 1.5,
        borderColor: on ? colors.navy : colors.borderStrong,
        backgroundColor: on ? colors.navy : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {on && <CheckIcon size={Math.round(size * 0.68)} color="#FAFAFA" weight="bold" />}
    </View>
  );
}

export default SelectIndicator;
