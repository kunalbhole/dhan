import { useState } from 'react';
import { TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PaperPlaneTiltIcon } from 'phosphor-react-native/lib/module/icons/PaperPlaneTilt';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import RadioRow from '../components/RadioRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, radii, spacing, typography } from '../theme';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactSupport'>;

const TOPICS = [
  { id: 'sms', label: 'SMS parsing issue' },
  { id: 'bug', label: 'Bug report' },
  { id: 'feature', label: 'Feature request' },
  { id: 'plus', label: 'Dhan Plus & billing' },
  { id: 'other', label: 'General question' },
];

function ContactSupportScreen({ navigation }: Props) {
  const [topic, setTopic] = useState('sms');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      showToast('Please fill in subject and message');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("Message sent! We'll reply to your email shortly.");
      navigation.goBack();
    }, 600);
  };

  return (
    <SettingsSubScreen title="Contact support" onBack={() => navigation.goBack()}>
      <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        Topic
      </AppText>
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s4 }}>
        {TOPICS.map((t, i) => (
          <RadioRow
            key={t.id}
            label={t.label}
            on={topic === t.id}
            last={i === TOPICS.length - 1}
            onPress={() => setTopic(t.id)}
          />
        ))}
      </Card>

      <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        Details
      </AppText>
      <View style={{ gap: spacing.s1, marginBottom: spacing.s5 }}>
        <Field
          label="Subject"
          placeholder="e.g. HDFC transaction missing"
          value={subject}
          onChangeText={setSubject}
        />

        <View style={{ marginBottom: 14 }}>
          <AppText weight="semibold" style={{ fontSize: 12, color: colors.fg2, marginBottom: 6 }}>
            Message
          </AppText>
          <View
            style={{
              borderWidth: 1,
              borderColor: focused ? colors.navy : colors.borderDefault,
              borderRadius: radii.input,
              paddingHorizontal: spacing.s3,
              paddingVertical: spacing.s3,
              backgroundColor: colors.bgBase,
              minHeight: 100,
            }}
          >
            <TextInput
              value={message}
              onChangeText={setMessage}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Describe what happened or what you need help with…"
              placeholderTextColor={colors.fg3}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                flex: 1,
                fontFamily: typography.family.medium,
                fontSize: typography.scale.body.fontSize,
                color: colors.fg1,
                padding: 0,
              }}
            />
          </View>
        </View>
      </View>

      <Button
        variant="primary"
        size="lg"
        full
        icon={PaperPlaneTiltIcon}
        disabled={submitting}
        onPress={handleSubmit}
      >
        {submitting ? 'Sending…' : 'Send message'}
      </Button>
    </SettingsSubScreen>
  );
}

export default ContactSupportScreen;
