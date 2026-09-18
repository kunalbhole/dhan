import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppText from '../components/AppText';
import Card from '../components/Card';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AboutDhan'>;

const BLOCKS: [string, string][] = [
  [
    'What Dhan is',
    'Dhan is a local-first money app for India. It reads your bank SMS on your device, sorts spending into Needs, Wants and Savings, and keeps every rupee accounted for without shipping your data anywhere.',
  ],
  [
    'Why we built it',
    "Most money apps sell insight back to you or sell you to someone else. Dhan is built to be boring about privacy and opinionated about budgeting frameworks — 50/30/20 by default, five more if that doesn't fit.",
  ],
  [
    'Company',
    'Dhan Technologies Pvt. Ltd.\n4th Floor, Koramangala 5th Block\nBengaluru 560095, Karnataka, India\nCIN U62099KA2024PTC112233',
  ],
  [
    'Version',
    '2.4.1 (build 2410) · September 2026\nMade with ♥ in Bengaluru',
  ],
];

function AboutDhanScreen({ navigation }: Props) {
  return (
    <SettingsSubScreen title="About Dhan" onBack={() => navigation.goBack()}>
      <Card style={{ padding: spacing.s4 }}>
        {BLOCKS.map(([heading, content], i) => (
          <View key={heading} style={i === 0 ? undefined : { marginTop: spacing.s5 }}>
            <AppText weight="semibold" style={{ fontSize: 14, color: colors.navy }}>
              {heading}
            </AppText>
            <AppText
              style={{
                fontSize: 13,
                color: colors.fg2,
                lineHeight: 20,
                marginTop: 6,
              }}
            >
              {content}
            </AppText>
          </View>
        ))}
      </Card>
    </SettingsSubScreen>
  );
}

export default AboutDhanScreen;
