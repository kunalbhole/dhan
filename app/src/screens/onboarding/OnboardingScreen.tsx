import { ComponentType, useCallback, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import OnboardIllo1 from './illustrations/OnboardIllo1';
import OnboardIllo2 from './illustrations/OnboardIllo2';
import OnboardIllo3 from './illustrations/OnboardIllo3';
import { colors, radii, spacing, typography } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface Slide {
  title: string;
  body: string;
  Illo: ComponentType<{ width: number }>;
}

// Copy ported verbatim from screens-onboarding.jsx's OnboardingScreen.
const SLIDES: Slide[] = [
  {
    title: 'Track effortlessly',
    body: "Dhan reads your UPI & bank SMS to log every transaction — no manual entry, no fuss.",
    Illo: OnboardIllo1,
  },
  {
    title: 'Budget your way',
    body: 'Pick a framework — 50/30/20, zero-based, or roll your own — and stick to it calmly.',
    Illo: OnboardIllo2,
  },
  {
    title: 'Stay on top',
    body: 'Bill reminders, overspend alerts, weekly summaries. We nudge; you decide.',
    Illo: OnboardIllo3,
  },
];

// The reference's illustration container is padded 24px each side of a
// 390px phone frame; the ratio (not the absolute number) is what matters
// here since our device width varies.
const ILLO_HORIZONTAL_PADDING = 24;

function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const illoWidth = width - ILLO_HORIZONTAL_PADDING * 2;

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const Illo = slide.Illo;

  // navigate (not replace): keeps Onboarding on the stack so SignUp's back
  // button can pop straight back to it, matching onDone("back") in app.jsx.
  const goSignUp = useCallback(() => navigation.navigate('SignUp'), [navigation]);
  const onNext = useCallback(() => {
    if (isLast) goSignUp();
    else setIndex(i => i + 1);
  }, [isLast, goSignUp]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.skipRow}>
        <Pressable onPress={goSignUp} hitSlop={8}>
          <AppText weight="semibold" style={styles.skipText}>
            Skip
          </AppText>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.illoArea}>
          <Illo width={illoWidth} />
        </View>
        <View style={styles.textArea}>
          <AppText weight="bold" style={styles.title}>
            {slide.title}
          </AppText>
          <AppText style={styles.bodyText}>{slide.body}</AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === index ? 22 : 6,
                  backgroundColor: i === index ? colors.navy : colors.borderStrong,
                },
              ]}
            />
          ))}
        </View>
        <Button variant="primary" full size="lg" onPress={onNext} iconRight={ArrowRightIcon}>
          {isLast ? 'Get started' : 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: spacing.s1,
    paddingHorizontal: spacing.s5,
  },
  skipText: {
    fontSize: 14,
    color: colors.fg3,
  },
  body: {
    flex: 1,
  },
  illoArea: {
    flex: 1,
    paddingVertical: spacing.s2,
    paddingHorizontal: spacing.s6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    paddingTop: spacing.s2,
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 28,
    color: colors.navy,
    letterSpacing: -0.28,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: typography.scale.body.fontSize,
    lineHeight: typography.scale.body.lineHeight,
    color: colors.fg2,
  },
  footer: {
    paddingTop: spacing.s4,
    paddingHorizontal: spacing.s5,
    paddingBottom: 28,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.s5,
  },
  dot: {
    height: 6,
    borderRadius: radii.pill,
  },
});

export default OnboardingScreen;
