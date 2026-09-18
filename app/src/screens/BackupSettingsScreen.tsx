import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoogleLogoIcon } from 'phosphor-react-native/lib/module/icons/GoogleLogo';
import { SignOutIcon } from 'phosphor-react-native/lib/module/icons/SignOut';
import { WifiHighIcon } from 'phosphor-react-native/lib/module/icons/WifiHigh';
import { CloudArrowUpIcon } from 'phosphor-react-native/lib/module/icons/CloudArrowUp';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import DetailRow from '../components/DetailRow';
import ScreenHeader from '../components/ScreenHeader';
import Toggle from '../components/Toggle';
import { colors, spacing } from '../theme';
import { formatRelativeTime } from '../lib/format';
import { showToast } from '../lib/toast';
import { signInToGoogle, signOutOfGoogle, type DriveAccount } from '../lib/driveAuth';
import { runBackup } from '../lib/backupService';
import {
  getBackupSettings,
  setBackupFrequency,
  setBackupWifiOnly,
  getBackupStatus,
  setBackupStatus,
  subscribeToBackupStatus,
} from '../lib/backupSettings';
import { BACKUP_FREQUENCIES, type BackupFrequency, type BackupSettings } from '../lib/backupTypes';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BackupSettings'>;

// New screen, no reference to port — free for every user (no Dhan Plus
// gating, unlike Budget's "Edit categories"). Sign-in here is its own
// independent Google OAuth session (src/lib/driveAuth.ts), separate from
// SignUpScreen's own "Continue with Google" (a different, unrelated,
// still-in-progress workstream).
function BackupSettingsScreen({ navigation }: Props) {
  const [account, setAccount] = useState<DriveAccount | null>(null);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [status, setStatus] = useState(getBackupStatus());
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    getBackupSettings().then(setSettings);
  }, []);

  useEffect(() => subscribeToBackupStatus(() => setStatus(getBackupStatus())), []);

  const connect = async () => {
    setConnecting(true);
    try {
      const signedIn = await signInToGoogle();
      if (signedIn) setAccount(signedIn);
    } catch {
      showToast("Couldn't connect to Google");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    await signOutOfGoogle();
    setAccount(null);
  };

  const chooseFrequency = async (frequency: BackupFrequency) => {
    setSettings(s => (s ? { ...s, frequency } : s));
    await setBackupFrequency(frequency);
  };

  const toggleWifiOnly = async () => {
    if (!settings) return;
    const wifiOnly = !settings.wifiOnly;
    setSettings(s => (s ? { ...s, wifiOnly } : s));
    await setBackupWifiOnly(wifiOnly);
  };

  const backUpNow = async () => {
    let activeAccount = account;
    if (!activeAccount) {
      activeAccount = await signInToGoogle().catch(() => null);
      if (!activeAccount) return;
      setAccount(activeAccount);
    }
    setBackupStatus('running');
    try {
      await runBackup(activeAccount);
      setBackupStatus('success');
      setSettings(await getBackupSettings());
      showToast('Backup complete');
    } catch {
      setBackupStatus('error');
      showToast("Backup failed — check your connection");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader title="Backup & restore" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        <AppText style={{ fontSize: 13, color: colors.fg2, lineHeight: 19, marginHorizontal: 4, marginBottom: spacing.s4 }}>
          Dhan can keep an encrypted copy of your transactions, income and budget setup in your own Google Drive —
          free for everyone. Your data on this device is always the real copy; Drive only ever holds a backup, never
          a live sync.
        </AppText>

        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s4 }}>
          {account ? (
            <DetailRow
              icon={SignOutIcon}
              iconColor={colors.expense}
              iconBg={colors.expenseBg}
              label="Disconnect Google account"
              sub={account.email}
              last
              onPress={disconnect}
            />
          ) : (
            <DetailRow
              icon={GoogleLogoIcon}
              iconBg={colors.bgSurface}
              label={connecting ? 'Connecting…' : 'Connect your Google account'}
              sub="Required to back up or restore"
              last
              chevron
              onPress={connecting ? undefined : connect}
            />
          )}
        </Card>

        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          Backup frequency
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 }}>
          {BACKUP_FREQUENCIES.map(f => (
            <Chip key={f.id} active={settings?.frequency === f.id} onPress={() => chooseFrequency(f.id)}>
              {f.label}
            </Chip>
          ))}
        </View>

        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s4 }}>
          <DetailRow icon={WifiHighIcon} iconBg={colors.bgSurface} label="Wi-Fi only" sub="Skip backups on mobile data" last>
            <Toggle on={settings?.wifiOnly ?? true} onToggle={toggleWifiOnly} />
          </DetailRow>
        </Card>

        <Button variant="primary" full size="lg" icon={CloudArrowUpIcon} disabled={status.status === 'running'} onPress={backUpNow}>
          {status.status === 'running' ? 'Backing up…' : 'Back up now'}
        </Button>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.s3 }}>
          {settings?.lastBackupAt ? (
            <>
              <CheckCircleIcon size={14} color={colors.income} weight="fill" />
              <AppText style={{ fontSize: 12, color: colors.fg3 }}>Last backup: {formatRelativeTime(settings.lastBackupAt)}</AppText>
            </>
          ) : (
            <AppText style={{ fontSize: 12, color: colors.fg3 }}>No backup yet</AppText>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default BackupSettingsScreen;
