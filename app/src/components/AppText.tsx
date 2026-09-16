import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export type FontWeight = keyof typeof typography.family;

export interface AppTextProps extends TextProps {
  weight?: FontWeight;
}

// The app's default text component — every screen should render text
// through this (not RN's raw <Text>) so Poppins and the design system's
// text color apply everywhere without repeating fontFamily/color per style.
// RN's Text has no global default-font mechanism (defaultProps isn't
// supported on function components since React 19), so this wrapper is it.
function AppText({ weight = 'regular', style, ...rest }: AppTextProps) {
  return (
    <Text
      style={[styles.base, { fontFamily: typography.family[weight] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.fg1,
  },
});

export default AppText;
