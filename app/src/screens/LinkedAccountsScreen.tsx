import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { DotsThreeIcon } from 'phosphor-react-native/lib/module/icons/DotsThree';
import { PlusIcon } from 'phosphor-react-native/lib/module/icons/Plus';
import AppText from '../components/AppText';
import Card from '../components/Card';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, radii, spacing } from '../theme';
import {
  getLinkedAccounts,
  removeLinkedAccount,
  subscribeLinkedAccounts,
  togglePrimaryAccount,
  type LinkedAccount,
} from '../lib/linkedAccountsStore';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'LinkedAccounts'>;

function LinkedAccountsScreen({ navigation }: Props) {
  const [accounts, setAccounts] = useState<LinkedAccount[]>(getLinkedAccounts());

  useEffect(() => {
    return subscribeLinkedAccounts(() => {
      setAccounts([...getLinkedAccounts()]);
    });
  }, []);

  const handleAccountOptions = (account: LinkedAccount) => {
    Alert.alert(
      account.name,
      `${account.type} (${account.mask})`,
      [
        account.primary
          ? { text: 'Primary account', style: 'cancel' }
          : {
              text: 'Set as primary',
              onPress: () => {
                togglePrimaryAccount(account.id);
                showToast(`Set ${account.name} as primary account`);
              },
            },
        {
          text: 'Unlink account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              `Unlink ${account.name}?`,
              'SMS transactions from this account will remain in your history.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Unlink',
                  style: 'destructive',
                  onPress: () => {
                    removeLinkedAccount(account.id);
                    showToast(`Unlinked ${account.name}`);
                  },
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <SettingsSubScreen title="Linked accounts" onBack={() => navigation.goBack()}>
      {/* Sync Status Banner */}
      <View
        style={{
          backgroundColor: colors.incomeBg,
          borderRadius: radii.control,
          paddingHorizontal: spacing.s3,
          paddingVertical: spacing.s3,
          marginBottom: spacing.s4,
          flexDirection: 'row',
          gap: spacing.s2,
          alignItems: 'flex-start',
        }}
      >
        <CheckCircleIcon size={18} color={colors.income} weight="fill" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 12, color: colors.fg2, lineHeight: 18 }}>
            <AppText weight="bold" style={{ color: colors.fg1 }}>
              SMS sync working.{' '}
            </AppText>
            Last update 2 minutes ago across {accounts.length} accounts.
          </AppText>
        </View>
      </View>

      {/* Account Cards */}
      {accounts.map(a => (
        <Card key={a.id} style={{ padding: spacing.s4, marginBottom: spacing.s3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, marginBottom: spacing.s3 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radii.control,
                backgroundColor: a.color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText weight="bold" style={{ color: '#FFFFFF', fontSize: 14 }}>
                {a.short}
              </AppText>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText weight="semibold" style={{ fontSize: 14, color: colors.fg1 }}>
                  {a.name}
                </AppText>
                {a.primary ? (
                  <View
                    style={{
                      backgroundColor: colors.goldBg,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 999,
                    }}
                  >
                    <AppText weight="bold" style={{ fontSize: 9, color: '#8E7420', letterSpacing: 0.4 }}>
                      PRIMARY
                    </AppText>
                  </View>
                ) : null}
              </View>
              <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: 2 }}>
                {a.type} · {a.mask}
              </AppText>
            </View>

            <Pressable hitSlop={8} onPress={() => handleAccountOptions(a)}>
              <DotsThreeIcon size={20} color={colors.fg3} weight="bold" />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <AppText weight="medium" style={{ fontSize: 10, color: colors.fg3, letterSpacing: 0.1 }}>
                {a.balance < 0 ? 'Outstanding' : 'Available'}
              </AppText>
              <AppText
                weight="bold"
                style={{
                  fontSize: 18,
                  color: a.balance < 0 ? colors.expense : colors.fg1,
                  marginTop: 2,
                }}
              >
                ₹{Math.abs(a.balance).toLocaleString('en-IN')}
              </AppText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.income }} />
              <AppText weight="semibold" style={{ fontSize: 11, color: colors.income }}>
                Synced {a.last}
              </AppText>
            </View>
          </View>
        </Card>
      ))}

      {/* Link Another Account Button */}
      <Pressable
        onPress={() => {
          showToast('Select your bank to scan SMS');
        }}
        style={{
          width: '100%',
          marginTop: spacing.s1,
          paddingVertical: 14,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.borderStrong,
          borderRadius: radii.control,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          backgroundColor: 'transparent',
        }}
      >
        <PlusIcon size={16} color={colors.fg2} />
        <AppText weight="semibold" style={{ fontSize: 13, color: colors.fg2 }}>
          Link another account
        </AppText>
      </Pressable>

      {/* Privacy Note */}
      <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginTop: spacing.s5, marginBottom: spacing.s2 }}>
        Privacy
      </AppText>
      <Card style={{ padding: 14 }}>
        <AppText style={{ fontSize: 12, color: colors.fg2, lineHeight: 18 }}>
          Dhan reads only SMS from these banks. We never store login credentials, never connect to your bank's servers.{' '}
          <AppText
            weight="medium"
            style={{ color: colors.navy, fontSize: 12 }}
            onPress={() => showToast('All SMS parsing happens on-device')}
          >
            Learn more →
          </AppText>
        </AppText>
      </Card>
    </SettingsSubScreen>
  );
}

export default LinkedAccountsScreen;
