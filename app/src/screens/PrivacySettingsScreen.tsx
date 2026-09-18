import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChartBarIcon } from 'phosphor-react-native/lib/module/icons/ChartBar';
import { SparkleIcon } from 'phosphor-react-native/lib/module/icons/Sparkle';
import { CloudArrowUpIcon } from 'phosphor-react-native/lib/module/icons/CloudArrowUp';
import { FingerprintIcon } from 'phosphor-react-native/lib/module/icons/Fingerprint';
import { DeviceMobileIcon } from 'phosphor-react-native/lib/module/icons/DeviceMobile';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import IconChip from '../components/IconChip';
import ToggleRow from '../components/ToggleRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, radii, spacing } from '../theme';
import { getPrivacyPrefs, setPrivacyPref, subscribeToPrivacyPrefs } from '../lib/privacySettingsStore';
import { getBackupSettings, setBackupFrequency } from '../lib/backupSettings';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacySettings'>;

function PrivacySettingsScreen({ navigation }: Props) {
  const [prefs, setPrefs] = useState(getPrivacyPrefs());
  // Not a separate flag — the real backupSettings.ts frequency, so this
  // toggle and BackupSettingsScreen can never disagree about whether
  // backup is on.
  const [backupOn, setBackupOn] = useState<boolean | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => subscribeToPrivacyPrefs(() => setPrefs({ ...getPrivacyPrefs() })), []);
  useEffect(() => {
    getBackupSettings().then(s => setBackupOn(s.frequency !== 'manual'));
  }, []);

  const toggleBackup = async () => {
    const next = !backupOn;
    setBackupOn(next);
    await setBackupFrequency(next ? 'weekly' : 'manual');
  };

  return (
    <SettingsSubScreen title="Privacy settings" onBack={() => navigation.goBack()}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, backgroundColor: colors.incomeBg, borderRadius: radii.control, padding: spacing.s4, marginBottom: spacing.s4 }}>
        <IconChip icon={DeviceMobileIcon} color={colors.income} bg="rgba(46,125,91,.14)" />
        <AppText style={{ flex: 1, fontSize: 12.5, color: colors.fg2, lineHeight: 19 }}>
          Your transactions live on this device. Dhan works fully offline — no server sees your money.
        </AppText>
      </View>

      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s4 }}>
        <ToggleRow
          icon={ChartBarIcon}
          label="Anonymous usage analytics"
          sub="Crash reports and feature counts only"
          on={prefs.analytics}
          onToggle={() => setPrivacyPref('analytics', !prefs.analytics)}
        />
        <ToggleRow
          icon={SparkleIcon}
          label="Personalised tips"
          sub="Uses on-device spending patterns"
          on={prefs.personalTips}
          onToggle={() => setPrivacyPref('personalTips', !prefs.personalTips)}
        />
        <ToggleRow
          icon={CloudArrowUpIcon}
          label="Encrypted cloud backup"
          sub="Off keeps everything local-only"
          on={backupOn ?? false}
          disabled={backupOn === null}
          onToggle={toggleBackup}
        />
        <ToggleRow
          icon={FingerprintIcon}
          label="Require unlock for exports"
          sub="Ask for Face ID before sharing data"
          on={prefs.requireUnlockForExports}
          last
          onToggle={() => setPrivacyPref('requireUnlockForExports', !prefs.requireUnlockForExports)}
        />
      </Card>

      {confirmDelete ? (
        <View style={{ backgroundColor: colors.expenseBg, borderRadius: radii.control, padding: spacing.s4 }}>
          <AppText style={{ fontSize: 13, color: colors.navy, marginBottom: spacing.s3, lineHeight: 19 }}>
            Request account deletion? We erase your Dhan account and all synced data within 30 days.
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
            <View style={{ flex: 1 }}>
              <Button variant="outline" full onPress={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                variant="destructive"
                full
                onPress={() => {
                  setConfirmDelete(false);
                  showToast('Deletion request sent');
                }}
              >
                Request
              </Button>
            </View>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setConfirmDelete(true)}
          style={{
            width: '100%',
            height: 48,
            borderRadius: radii.control,
            borderWidth: 1,
            borderColor: colors.expenseBg,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: spacing.s2,
          }}
        >
          <TrashIcon size={16} color={colors.expense} />
          <AppText weight="semibold" style={{ fontSize: 14, color: colors.expense }}>
            Request account deletion
          </AppText>
        </Pressable>
      )}
    </SettingsSubScreen>
  );
}

export default PrivacySettingsScreen;
