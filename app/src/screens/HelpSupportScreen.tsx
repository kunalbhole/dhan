import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import { ChatCenteredTextIcon } from 'phosphor-react-native/lib/module/icons/ChatCenteredText';
import { ChatsIcon } from 'phosphor-react-native/lib/module/icons/Chats';
import { CreditCardIcon } from 'phosphor-react-native/lib/module/icons/CreditCard';
import { DownloadSimpleIcon } from 'phosphor-react-native/lib/module/icons/DownloadSimple';
import { EnvelopeIcon } from 'phosphor-react-native/lib/module/icons/Envelope';
import { MagnifyingGlassIcon } from 'phosphor-react-native/lib/module/icons/MagnifyingGlass';
import { PaperPlaneTiltIcon } from 'phosphor-react-native/lib/module/icons/PaperPlaneTilt';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import IconChip from '../components/IconChip';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, radii, spacing } from '../theme';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

interface HelpTopic {
  id: string;
  icon: any;
  title: string;
  category: string;
  answer: string;
}

const TOPICS: HelpTopic[] = [
  {
    id: '1',
    icon: ChatCenteredTextIcon,
    title: 'How does SMS reading work?',
    category: 'Setup',
    answer: 'Dhan parses transaction alerts directly from your device SMS inbox. Your messages never leave your phone or upload to any cloud server.',
  },
  {
    id: '2',
    icon: CreditCardIcon,
    title: 'Add a new bank account',
    category: 'Accounts',
    answer: 'Accounts are automatically detected whenever an SMS alert arrives from a supported bank sender ID.',
  },
  {
    id: '3',
    icon: ReceiptIcon,
    title: 'Set up bill reminders',
    category: 'Bills',
    answer: 'Go to the Bills tab and tap "+ Add bill" to set up monthly recurring bill trackers and notifications.',
  },
  {
    id: '4',
    icon: UsersThreeIcon,
    title: 'Splitting bills with friends',
    category: 'Plus',
    answer: 'Open the Split tab to track group expenses, see who owes whom, and generate UPI payment links.',
  },
  {
    id: '5',
    icon: ShieldCheckIcon,
    title: 'Privacy & data security',
    category: 'Privacy',
    answer: 'All data is stored in a local SQLite database encrypted on device. No account credentials or login data are ever requested or stored.',
  },
  {
    id: '6',
    icon: DownloadSimpleIcon,
    title: 'Export your data',
    category: 'Data',
    answer: 'Go to Settings ➔ Export data to download your complete transaction ledger in CSV format anytime.',
  },
];

function HelpSupportScreen({ navigation }: Props) {
  const [q, setQ] = useState('');

  const filteredTopics = TOPICS.filter(
    t => t.title.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase())
  );

  const openTopic = (t: HelpTopic) => {
    Alert.alert(t.title, t.answer, [{ text: 'Got it', style: 'default' }]);
  };

  return (
    <SettingsSubScreen title="Help & support" onBack={() => navigation.goBack()}>
      {/* Search Bar */}
      <View style={{ marginBottom: 14 }}>
        <Field
          placeholder="Search for help…"
          value={q}
          onChangeText={setQ}
        />
      </View>

      {/* Quick Actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.s4 }}>
        <Pressable
          onPress={() => navigation.navigate('ContactSupport')}
          style={{
            flex: 1,
            backgroundColor: colors.bgElevated,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            borderRadius: radii.cardSm,
            padding: 14,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.control,
              backgroundColor: 'rgba(20, 28, 65, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.s2,
            }}
          >
            <ChatsIcon size={18} color={colors.navy} weight="fill" />
          </View>
          <AppText weight="semibold" style={{ fontSize: 13, color: colors.fg1 }}>
            Chat with us
          </AppText>
          <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: 2 }}>
            Avg 3 min
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => showToast('Email support: help@dhan.in')}
          style={{
            flex: 1,
            backgroundColor: colors.bgElevated,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            borderRadius: radii.cardSm,
            padding: 14,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.control,
              backgroundColor: 'rgba(182, 142, 60, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.s2,
            }}
          >
            <EnvelopeIcon size={18} color={colors.gold} weight="fill" />
          </View>
          <AppText weight="semibold" style={{ fontSize: 13, color: colors.fg1 }}>
            Email support
          </AppText>
          <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: 2 }}>
            help@dhan.in
          </AppText>
        </Pressable>
      </View>

      {/* Popular Topics */}
      <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        Popular topics
      </AppText>
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s4 }}>
        {filteredTopics.map((it, i) => (
          <Pressable
            key={it.id}
            onPress={() => openTopic(it)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.s4,
              paddingVertical: spacing.s4,
              borderBottomWidth: i === filteredTopics.length - 1 ? 0 : 1,
              borderBottomColor: colors.borderSubtle,
            }}
          >
            <IconChip icon={it.icon} />
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 14, color: colors.fg1 }}>{it.title}</AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{it.category}</AppText>
            </View>
            <CaretRightIcon size={14} color={colors.fg3} />
          </Pressable>
        ))}
      </Card>

      {/* Footer Banner */}
      <View
        style={{
          backgroundColor: colors.bgElevated,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          borderRadius: radii.cardSm,
          padding: spacing.s4,
          alignItems: 'center',
        }}
      >
        <AppText weight="semibold" style={{ fontSize: 13, color: colors.fg1, marginBottom: 4 }}>
          Still stuck?
        </AppText>
        <AppText style={{ fontSize: 12, color: colors.fg2, textAlign: 'center', marginBottom: spacing.s3, lineHeight: 18 }}>
          We reply within a few hours, even on weekends.
        </AppText>
        <Button
          variant="primary"
          size="md"
          icon={PaperPlaneTiltIcon}
          onPress={() => navigation.navigate('ContactSupport')}
        >
          Contact support
        </Button>
      </View>
    </SettingsSubScreen>
  );
}

export default HelpSupportScreen;
