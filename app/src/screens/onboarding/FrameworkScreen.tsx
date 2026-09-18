import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import SelectIndicator from '../../components/SelectIndicator';
import { colors, radii, shadows, spacing, typography } from '../../theme';
import { FRAMEWORKS, frameworkBuckets } from '../../lib/frameworks';
import { CATEGORIES } from '../../lib/categories';
import { setOnboarded, setFramework } from '../../lib/account';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Framework'>;

// Copy ported verbatim from screens-onboarding.jsx's FrameworkScreen.
const BLURBS: Record<string, string> = {
  '50-30-20': 'The classic. Good starting point.',
  '70-20-10': "If you're paying off loans or EMIs.",
  '80-20': 'Simplest split — spend, then save.',
  pyf: 'Savings comes off the top, guilt-free after.',
  zero: 'Assign income down to zero each month.',
  '60-20-20': 'Balanced, flexible mid-ground.',
};

const OPTIONS = [...FRAMEWORKS, { id: 'custom', name: 'Custom', desc: 'Build your own mix' }];

function FrameworkScreen({ navigation }: Props) {
  const [sel, setSel] = useState('50-30-20');

  const choose = async () => {
    // Mirrors app.jsx's framework onDone: localStorage.setItem("dhan-framework", id)
    // and localStorage.setItem("dhan-onboarded", "1") before landing on
    // home, so a relaunch's Splash routes to Login instead of Onboarding,
    // and HomeScreen's budget math reads the framework the user actually
    // picked instead of a hardcoded default.
    await setFramework(sel);
    await setOnboarded();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Budget framework" onBack={() => navigation.goBack()} />
      <View style={styles.headerBlock}>
        <AppText weight="bold" style={styles.title}>
          How do you want to budget?
        </AppText>
        <AppText style={styles.subtitle}>Pick a framework. Categories are pre-filled and fully editable later.</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {OPTIONS.map(o => {
          const active = sel === o.id;
          const isCustom = o.id === 'custom';
          const buckets = isCustom ? [] : frameworkBuckets(o.id);
          const isPopular = o.id === '50-30-20';
          return (
            <Pressable
              key={o.id}
              onPress={() => setSel(o.id)}
              style={[
                styles.card,
                { borderColor: active ? colors.navy : 'transparent' },
                active ? shadows.md : shadows.card,
              ]}
            >
              {isPopular && (
                <View style={styles.popularBadge}>
                  <AppText weight="medium" style={styles.popularBadgeText}>
                    POPULAR
                  </AppText>
                </View>
              )}
              <View style={[styles.nameRow, { paddingRight: isPopular ? 76 : 0 }]}>
                <SelectIndicator on={active} />
                <AppText weight="bold" style={styles.name}>
                  {o.name}
                </AppText>
              </View>
              <AppText style={[styles.blurb, { marginBottom: buckets.length ? 12 : 0 }]}>
                {BLURBS[o.id] || o.desc}
              </AppText>
              {buckets.length > 0 && (
                <>
                  <View style={styles.barRow}>
                    {buckets.map(b => (
                      <View key={b.id} style={{ flex: b.pct, backgroundColor: b.color }} />
                    ))}
                  </View>
                  <View style={styles.legend}>
                    {buckets.map(b => (
                      <View key={b.id} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: b.color }]} />
                        <View style={styles.legendTextBlock}>
                          <AppText weight="semibold" style={styles.legendPct}>
                            {b.pct}% {b.label}
                          </AppText>
                          <AppText style={styles.legendCats}>
                            {b.cats.map(c => CATEGORIES[c].name).join(' · ')}
                          </AppText>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" full size="lg" iconRight={ArrowRightIcon} onPress={choose}>
          {sel === 'custom' ? 'Build my categories' : "Let's go"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSurface,
  },
  headerBlock: {
    paddingHorizontal: spacing.s5,
    paddingBottom: spacing.s2,
  },
  title: {
    fontSize: typography.scale.h1.fontSize,
    letterSpacing: -0.24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.fg2,
    marginBottom: spacing.s4,
  },
  scrollContent: {
    paddingHorizontal: spacing.s5,
    paddingBottom: spacing.s4,
  },
  card: {
    backgroundColor: colors.bgBase,
    borderRadius: radii.card,
    padding: spacing.s4,
    marginBottom: 10,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 14,
    right: 16,
    backgroundColor: colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  popularBadgeText: {
    fontSize: 10,
    color: colors.navy,
    letterSpacing: 0.4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s3,
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
  },
  blurb: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.fg2,
    marginLeft: 34,
  },
  barRow: {
    marginLeft: 34,
    flexDirection: 'row',
    gap: 4,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
  },
  legend: {
    marginLeft: 34,
    gap: 4,
    marginTop: spacing.s2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginTop: 4,
  },
  legendTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  legendPct: {
    fontSize: typography.scale.label.fontSize,
    color: colors.fg2,
  },
  legendCats: {
    fontSize: typography.scale.label.fontSize,
    color: colors.fg3,
    lineHeight: 15.95,
  },
  footer: {
    paddingTop: spacing.s3,
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.s6,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
});

export default FrameworkScreen;
