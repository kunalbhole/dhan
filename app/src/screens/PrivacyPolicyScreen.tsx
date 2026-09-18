import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppText from '../components/AppText';
import Card from '../components/Card';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const BLOCKS: [string, string][] = [
  [
    'Local-first by default',
    'Transaction data parsed from your SMS is stored in an encrypted database on your device. With cloud backup off, it never leaves your phone — not to us, not to anyone else.',
  ],
  [
    'What we collect',
    'Account basics you give us: name, phone number, email. If you opt in to anonymous analytics, we also receive crash reports and aggregate feature counts that contain no transaction detail.',
  ],
  [
    'What we never collect',
    'We do not collect your bank credentials, card numbers, SMS text, merchant names, or the amounts of individual transactions. We do not sell or rent data, ever, to anyone.',
  ],
  [
    'Permissions',
    'SMS read access is used solely to detect transaction alerts from the bank senders you enable. Notification access is used to schedule reminders you turn on.',
  ],
  [
    'Backups',
    'If you enable encrypted cloud backup, your database is encrypted on-device with a key derived from your credentials before upload. We cannot read it.',
  ],
  [
    'Your rights',
    'You can export everything you have in Dhan at any time, and you can request account deletion from Privacy settings. Deletion completes within 30 days.',
  ],
  [
    'Contact',
    'Questions or a data request: privacy@dhan.app · Grievance Officer, Dhan Technologies Pvt. Ltd., Bengaluru 560095.',
  ],
];

function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <SettingsSubScreen title="Privacy policy" onBack={() => navigation.goBack()}>
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

export default PrivacyPolicyScreen;
