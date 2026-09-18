import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppText from '../components/AppText';
import Card from '../components/Card';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsOfService'>;

const BLOCKS: [string, string][] = [
  [
    '1. Acceptance',
    'By creating a Dhan account you agree to these terms. If you do not agree, do not use the app. We may update these terms; material changes are announced in-app at least 14 days before they take effect.',
  ],
  [
    '2. Your account',
    'You are responsible for keeping your device, PIN and biometrics secure. Dhan cannot recover data from a device you lose if cloud backup is switched off.',
  ],
  [
    '3. Permitted use',
    'Dhan is for personal money management. You may not resell access, scrape the app, reverse-engineer its SMS parsers, or use it to process funds on behalf of others.',
  ],
  [
    '4. Financial information',
    'Dhan is not a bank, broker, adviser or lender. Budgets, insights and projections are informational only and are not financial advice. Always confirm balances with your bank.',
  ],
  [
    '5. Subscriptions',
    "Dhan Plus bills ₹199 per month or ₹1,908 per year through your app store account. Cancel any time; access continues to the end of the paid period. Refunds follow your app store's policy.",
  ],
  [
    '6. Availability',
    'We aim for continuous availability but do not guarantee it. Features may change, and the app may be unavailable during maintenance or for reasons outside our control.',
  ],
  [
    '7. Liability',
    "To the extent permitted by law, Dhan's liability is limited to the amount you paid us in the twelve months before a claim. We are not liable for indirect or consequential loss.",
  ],
  [
    '8. Governing law',
    'These terms are governed by the laws of India. Disputes fall under the exclusive jurisdiction of the courts of Bengaluru, Karnataka.',
  ],
];

function TermsOfServiceScreen({ navigation }: Props) {
  return (
    <SettingsSubScreen title="Terms of service" onBack={() => navigation.goBack()}>
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

export default TermsOfServiceScreen;
