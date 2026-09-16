import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowLeft';
import AppText from './AppText';
import { colors, radii, spacing } from '../theme';

// Ported from Dhan App 2/components.jsx's ScreenHeader.
export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} style={styles.backButton} hitSlop={8} accessibilityLabel="Back">
        <ArrowLeftIcon size={20} color={colors.fg1} />
      </Pressable>
      <AppText weight="semibold" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.s1,
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.s3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.control,
    backgroundColor: colors.bgBase,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: colors.fg1,
  },
  right: {
    minWidth: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default ScreenHeader;
