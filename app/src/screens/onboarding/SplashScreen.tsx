import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import DhanLogo from '../../assets/DhanLogo';
import { colors, spacing } from '../../theme';
import { hasAccount } from '../../lib/account';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

// Matches screens-onboarding.jsx's SplashScreen: same 1800ms hold and the
// same 600ms fade+slide-in (CSS `fadeSlideIn` / --ease-spring).
const HOLD_MS = 1800;
const ANIM_MS = 600;
const SPRING_EASING = Easing.bezier(0.2, 0.9, 0.3, 1.3);
const LOGO_HEIGHT = 160;

function SplashScreen({ navigation }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIM_MS,
        easing: SPRING_EASING,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIM_MS,
        easing: SPRING_EASING,
        useNativeDriver: true,
      }),
    ]).start();

    // Mirrors app.jsx's splash onDone: returning users (hasAccount()) go to
    // Login, new users to Restore (offering to bring back a Google Drive
    // backup before Onboarding — see RestorePromptScreen). LoginScreen
    // isn't built yet, so a returning user is routed to Home for now —
    // TODO: rewire to 'Login' once that screen exists.
    const timer = setTimeout(() => {
      hasAccount().then(known => navigation.replace(known ? 'Home' : 'Restore'));
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [navigation, opacity, translateY]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <DhanLogo height={LOGO_HEIGHT} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s8,
  },
});

export default SplashScreen;
