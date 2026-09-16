import type { ComponentType } from 'react';
import { View } from 'react-native';
import type { IconWeight } from 'phosphor-react-native';
import { colors, radii } from '../theme';

export interface PhosphorIconProps {
  size?: number;
  color?: string;
  weight?: IconWeight;
}

export interface IconChipProps {
  icon: ComponentType<PhosphorIconProps>;
  size?: number;
  color?: string;
  bg?: string;
  fill?: boolean;
}

// Ported from components.jsx's IconChip — size×size, r-input, icon at 45%
// of the box. `icon` is a deep-imported phosphor component (see the
// phosphor-react-native ambient-shim note in src/types) rather than the
// reference's CSS class slug.
function IconChip({ icon: Icon, size = 40, color = colors.navy, bg = colors.bgSurface, fill = false }: IconChipProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radii.input,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={Math.round(size * 0.45)} color={color} weight={fill ? 'fill' : 'regular'} />
    </View>
  );
}

export default IconChip;
