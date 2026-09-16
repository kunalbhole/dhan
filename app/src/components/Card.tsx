import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

// Ported from components.jsx's Card — bg-elevated, r-card, 16px padding,
// shadow-card, 1px card-border-color (transparent in the source).
function Card({ children, style, onPress }: CardProps) {
  const content = (
    <View
      style={[
        {
          backgroundColor: colors.bgElevated,
          borderRadius: radii.card,
          padding: spacing.s4,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        },
        shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default Card;
