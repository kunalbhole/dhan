import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { WarningIcon } from 'phosphor-react-native/lib/module/icons/Warning';
import { ChartLineUpIcon } from 'phosphor-react-native/lib/module/icons/ChartLineUp';
import { SparkleIcon } from 'phosphor-react-native/lib/module/icons/Sparkle';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import { MegaphoneIcon } from 'phosphor-react-native/lib/module/icons/Megaphone';
import AppText from '../components/AppText';
import Card from '../components/Card';
import ToggleRow from '../components/ToggleRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, spacing } from '../theme';
import { getNotificationPrefs, setNotificationPref, subscribeToNotificationPrefs, type NotifId } from '../lib/notificationsStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'NotifSettings'>;

const ROWS: { id: NotifId; icon: typeof ReceiptIcon; label: string; sub: string }[] = [
  { id: 'bills', icon: ReceiptIcon, label: 'Bill reminders', sub: 'Three days before a bill is due' },
  { id: 'budget', icon: WarningIcon, label: 'Budget warnings', sub: 'When a bucket passes 80%' },
  { id: 'weekly', icon: ChartLineUpIcon, label: 'Weekly summary', sub: 'Every Monday morning' },
  { id: 'ai', icon: SparkleIcon, label: 'AI insights', sub: 'Included with Dhan Plus' },
  { id: 'splits', icon: UsersThreeIcon, label: 'Split activity', sub: 'When someone settles up' },
  { id: 'promos', icon: MegaphoneIcon, label: 'Product news', sub: 'New features and tips' },
];

function NotifSettingsScreen({ navigation }: Props) {
  const [prefs, setPrefs] = useState(getNotificationPrefs());

  useEffect(() => subscribeToNotificationPrefs(() => setPrefs({ ...getNotificationPrefs() })), []);

  const count = ROWS.filter(r => prefs[r.id]).length;

  return (
    <SettingsSubScreen title="Notifications" onBack={() => navigation.goBack()}>
      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        {count} of {ROWS.length} on
      </AppText>
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
        {ROWS.map((r, i) => (
          <ToggleRow
            key={r.id}
            icon={r.icon}
            label={r.label}
            sub={r.sub}
            on={prefs[r.id]}
            last={i === ROWS.length - 1}
            onToggle={() => setNotificationPref(r.id, !prefs[r.id])}
          />
        ))}
      </Card>
    </SettingsSubScreen>
  );
}

export default NotifSettingsScreen;
