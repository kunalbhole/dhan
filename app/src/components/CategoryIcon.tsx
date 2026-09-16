import { View } from 'react-native';
import { colors, radii } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';

export interface CategoryIconProps {
  cat: string;
  size?: number;
  tint?: boolean;
}

// Ported from components.jsx's CategoryIcon: `tint` (used in TxnRow) shows
// a ~12% ("1F" hex alpha) tinted square with the category's own icon
// color; the solid variant (unused on Home, used elsewhere) fills the
// whole chip with the category color and a white icon.
function CategoryIcon({ cat, size = 40, tint = false }: CategoryIconProps) {
  const c = CATEGORIES[cat] || CATEGORIES.other;
  const Icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.other;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: tint ? radii.input : Math.round(size * radii.iconPct),
        backgroundColor: tint ? `${c.color}1F` : c.color,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={Math.round(size * 0.5)} color={tint ? c.color : colors.bgBase} />
    </View>
  );
}

export default CategoryIcon;
