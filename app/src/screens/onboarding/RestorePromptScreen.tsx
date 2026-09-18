import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CloudArrowDownIcon } from 'phosphor-react-native/lib/module/icons/CloudArrowDown';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import { colors, radii, spacing, typography } from '../../theme';
import { signInToGoogle } from '../../lib/driveAuth';
import { restoreFromDrive } from '../../lib/backupService';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Restore'>;

// New screen, no reference to port — inserted between Splash and Onboarding
// only for a fresh install / new device (Splash routes here instead of
// straight to Onboarding when !hasAccount()). Restore only ever runs
// against this empty, not-yet-onboarded state — never against an
// already-onboarded user's live data — so there's nothing to merge here.
function RestorePromptScreen({ navigation }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startFresh = () => navigation.replace('Onboarding');

  const restore = async () => {
    setError(null);
    setBusy(true);
    try {
      const account = await signInToGoogle();
      if (!account) {
        setBusy(false);
        return; // user cancelled the Google sign-in sheet
      }
      const result = await restoreFromDrive(account);
      if (result.status === 'no-backup-found') {
        setBusy(false);
        setError("No backup found for this Google account. Try a different account, or start fresh.");
        return;
      }
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch {
      setBusy(false);
      setError("Couldn't reach Google Drive. Check your connection and try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.spacer} />
        <View style={styles.iconChip}>
          <CloudArrowDownIcon size={32} color={colors.navy} weight="fill" />
        </View>
        <AppText weight="bold" style={styles.title}>
          Restore your data?
        </AppText>
        <AppText style={styles.subtitle}>
          If you've backed up Dhan before, sign in with the same Google account to bring back your transactions,
          income and budget setup.
        </AppText>
        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        ) : null}
        <View style={styles.spacer} />

        {busy ? (
          <ActivityIndicator color={colors.navy} style={styles.loading} />
        ) : (
          <>
            <Button variant="primary" full size="lg" icon={CloudArrowDownIcon} onPress={restore}>
              Restore from Google Drive
            </Button>
            <View style={{ height: spacing.s3 }} />
            <Button variant="ghost" full size="lg" iconRight={ArrowRightIcon} onPress={startFresh}>
              Start fresh instead
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.s6,
    paddingBottom: spacing.s6,
  },
  spacer: {
    flex: 1,
  },
  iconChip: {
    width: 64,
    height: 64,
    borderRadius: radii.cardLg,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.s5,
  },
  title: {
    fontSize: typography.scale.h1.fontSize,
    letterSpacing: -0.24,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.fg2,
    lineHeight: 21,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.expenseBg,
    borderRadius: radii.control,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: spacing.s4,
  },
  errorText: {
    fontSize: 13,
    color: colors.expense,
    lineHeight: 18,
    textAlign: 'center',
  },
  loading: {
    marginBottom: spacing.s4,
  },
});

export default RestorePromptScreen;
