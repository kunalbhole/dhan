import { ComponentType, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddressBookIcon } from 'phosphor-react-native/lib/module/icons/AddressBook';
import { ArrowRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowRight';
import { BellIcon } from 'phosphor-react-native/lib/module/icons/Bell';
import { ChatCenteredTextIcon } from 'phosphor-react-native/lib/module/icons/ChatCenteredText';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import Toggle from '../../components/Toggle';
import { colors, radii, spacing, typography } from '../../theme';
import { requestSmsPermission } from '../../native/sms';
import { scanAndProcessInbox } from '../../lib/smsPipeline';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

type PermId = 'sms' | 'notif' | 'contacts';

interface PermItem {
  id: PermId;
  Icon: ComponentType<{ size?: number; color?: string; weight?: 'fill' }>;
  title: string;
  body: string;
  required?: boolean;
  color: string;
}

const ITEMS: PermItem[] = [
  {
    id: 'sms',
    Icon: ChatCenteredTextIcon,
    title: 'Read SMS',
    body: 'We auto-detect bank & UPI txns. Stays on-device — never uploaded.',
    required: true,
    color: colors.navy,
  },
  {
    id: 'notif',
    Icon: BellIcon,
    title: 'Notifications',
    body: 'Bill reminders, overspend nudges, weekly summaries.',
    color: colors.gold,
  },
  {
    id: 'contacts',
    Icon: AddressBookIcon,
    title: 'Contacts',
    body: 'Optional — only if you split bills with friends on Dhan Plus.',
    color: colors.catBills,
  },
];

function PermissionsScreen({ navigation }: Props) {
  const [perms, setPerms] = useState<Record<PermId, boolean>>({
    sms: true,
    notif: true,
    contacts: false,
  });
  const [loading, setLoading] = useState(false);

  const goNext = async () => {
    setLoading(true);
    try {
      if (perms.sms) {
        const granted = await requestSmsPermission();
        if (granted) {
          await scanAndProcessInbox(500);
        }
      }
    } catch {
      // Permission optional / continuation guaranteed
    } finally {
      setLoading(false);
      navigation.navigate('LinkBank');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Permissions" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <AppText weight="bold" style={styles.title}>
          A few permissions
        </AppText>
        <AppText style={styles.subtitle}>
          Dhan works best with these. You can change any of them later in Settings.
        </AppText>

        {ITEMS.map(item => {
          const on = perms[item.id];
          const Icon = item.Icon;
          return (
            <View key={item.id} style={styles.row}>
              <View style={[styles.iconChip, { backgroundColor: `${item.color}15` }]}>
                <Icon size={22} color={item.color} weight="fill" />
              </View>
              <View style={styles.rowText}>
                <View style={styles.rowTitleLine}>
                  <AppText weight="semibold" style={styles.rowTitle}>
                    {item.title}
                  </AppText>
                  {item.required && (
                    <View style={styles.badge}>
                      <AppText weight="bold" style={styles.badgeText}>
                        RECOMMENDED
                      </AppText>
                    </View>
                  )}
                </View>
                <AppText style={styles.rowBody}>{item.body}</AppText>
              </View>
              <Toggle on={on} onToggle={() => setPerms(p => ({ ...p, [item.id]: !on }))} />
            </View>
          );
        })}

        <View style={styles.spacer} />

        <View style={styles.securityNote}>
          <ShieldCheckIcon size={18} color={colors.income} weight="fill" />
          <AppText style={styles.securityText}>
            <AppText weight="bold" style={styles.securityBold}>
              Bank-grade security.
            </AppText>{' '}
            Your data stays on this device. We never store SMS content on our servers.
          </AppText>
        </View>

        <Button
          variant="primary"
          full
          size="lg"
          iconRight={ArrowRightIcon}
          disabled={loading}
          onPress={goNext}
        >
          {loading ? 'Scanning SMS history...' : 'Continue'}
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
  body: {
    flex: 1,
    paddingHorizontal: spacing.s6,
    paddingBottom: spacing.s4,
  },
  title: {
    fontSize: typography.scale.h1.fontSize,
    letterSpacing: -0.24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.fg2,
    lineHeight: 21,
    marginBottom: spacing.s5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s3,
    backgroundColor: colors.bgBase,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.card,
    padding: 14,
    marginBottom: spacing.s2,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowTitle: {
    fontSize: 14,
  },
  badge: {
    backgroundColor: colors.goldBg,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    color: colors.navy,
    letterSpacing: 0.36,
  },
  rowBody: {
    fontSize: 11.5,
    color: colors.fg3,
    marginTop: 3,
    lineHeight: 16.1,
  },
  spacer: {
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s2,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.s3,
  },
  securityText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.fg2,
    lineHeight: 16.1,
  },
  securityBold: {
    fontSize: 11.5,
    color: colors.fg1,
  },
});

export default PermissionsScreen;
