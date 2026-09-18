import { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FingerprintIcon } from 'phosphor-react-native/lib/module/icons/Fingerprint';
import { LockKeyIcon } from 'phosphor-react-native/lib/module/icons/LockKey';
import { PasswordIcon } from 'phosphor-react-native/lib/module/icons/Password';
import { ScanSmileyIcon } from 'phosphor-react-native/lib/module/icons/ScanSmiley';
import AppText from '../components/AppText';
import Card from '../components/Card';
import RadioRow from '../components/RadioRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import ToggleRow from '../components/ToggleRow';
import { colors, spacing } from '../theme';
import { getAppLockSettings, setAppLockEnabled, setAppLockMethod, subscribeToAppLock, type LockMethod } from '../lib/appLockStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AppLock'>;

const METHODS: { id: LockMethod; label: string; icon: typeof ScanSmileyIcon; sub: string }[] = [
  { id: 'faceid', label: 'Face ID', icon: ScanSmileyIcon, sub: "Fastest — uses your phone's biometrics" },
  { id: 'fingerprint', label: 'Fingerprint', icon: FingerprintIcon, sub: "Touch sensor — uses your phone's biometrics" },
  { id: 'pin', label: 'PIN', icon: PasswordIcon, sub: 'Six-digit code you set' },
];

function AppLockScreen({ navigation }: Props) {
  const [settings, setSettings] = useState(getAppLockSettings());

  useEffect(() => subscribeToAppLock(() => setSettings({ ...getAppLockSettings() })), []);

  return (
    <SettingsSubScreen
      title="App lock"
      onBack={() => navigation.goBack()}
      note="App lock protects Dhan itself. Your phone passcode still guards the device."
    >
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s4 }}>
        <ToggleRow
          icon={LockKeyIcon}
          label="App lock"
          sub={settings.enabled ? 'Unlock required on open' : 'Anyone with your phone can open Dhan'}
          on={settings.enabled}
          onToggle={() => setAppLockEnabled(!settings.enabled)}
          last
        />
      </Card>

      <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        Method
      </AppText>
      <View style={{ opacity: settings.enabled ? 1 : 0.5 }}>
        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
          {METHODS.map((m, i) => (
            <RadioRow
              key={m.id}
              icon={m.icon}
              label={m.label}
              sub={m.sub}
              on={settings.enabled && settings.method === m.id}
              last={i === METHODS.length - 1}
              disabled={!settings.enabled}
              onPress={() => setAppLockMethod(m.id)}
            />
          ))}
        </Card>
      </View>
    </SettingsSubScreen>
  );
}

export default AppLockScreen;
