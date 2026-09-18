import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from './AppText';
import ScreenHeader from './ScreenHeader';
import { colors, spacing } from '../theme';

// Ported from Dhan App 2/settings-sub.jsx's SubScreen — the shared
// header + scroll body + optional footnote shell every Settings sub-page
// (Language, Currency, Appearance, App lock, ...) sits inside.
export interface SettingsSubScreenProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
  note?: string;
}

function SettingsSubScreen({ title, onBack, children, note }: SettingsSubScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader title={title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        {children}
        {note ? (
          <View style={{ paddingTop: spacing.s4, paddingHorizontal: 4 }}>
            <AppText style={{ fontSize: 12, color: colors.fg3, lineHeight: 18 }}>{note}</AppText>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default SettingsSubScreen;
