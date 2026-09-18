import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BankIcon } from 'phosphor-react-native/lib/module/icons/Bank';
import { PlusCircleIcon } from 'phosphor-react-native/lib/module/icons/PlusCircle';
import AppText from '../components/AppText';
import Card from '../components/Card';
import ToggleRow from '../components/ToggleRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, radii, spacing } from '../theme';
import { getAllTransactions, type StoredTransaction } from '../lib/db';
import { getDisabledSenders, setSenderEnabled, subscribeToSmsSources } from '../lib/smsSourcesStore';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SmsSources'>;

interface SenderRow {
  sender: string;
  count: number;
}

// Real senders from real parsed transactions — grouped from
// getAllTransactions() rather than the reference's 4 hardcoded banks
// (HDFC/Axis/ICICI/SBI). A fresh install with no SMS history yet
// legitimately has an empty list here.
function groupBySender(txns: StoredTransaction[]): SenderRow[] {
  const counts = new Map<string, number>();
  txns.forEach(t => {
    if (!t.sender) return;
    counts.set(t.sender, (counts.get(t.sender) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([sender, count]) => ({ sender, count }));
}

function SmsSourcesScreen({ navigation }: Props) {
  const [txns, setTxns] = useState<StoredTransaction[]>([]);
  const [disabled, setDisabled] = useState(getDisabledSenders());

  useEffect(() => {
    getAllTransactions().then(setTxns);
  }, []);
  useEffect(() => subscribeToSmsSources(() => setDisabled(new Set(getDisabledSenders()))), []);

  const rows = useMemo(() => groupBySender(txns), [txns]);

  return (
    <SettingsSubScreen
      title="SMS sources"
      onBack={() => navigation.goBack()}
      note="Dhan reads transaction SMS on your device only. Nothing is uploaded."
    >
      {rows.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <BankIcon size={40} color={colors.fg3} />
          <AppText weight="medium" style={{ fontSize: 15, color: colors.fg2, marginTop: spacing.s3, textAlign: 'center' }}>
            No senders yet
          </AppText>
          <AppText style={{ fontSize: 13, color: colors.fg3, marginTop: 6, textAlign: 'center', lineHeight: 19, paddingHorizontal: spacing.s5 }}>
            Once Dhan reads a transaction SMS, the sender shows up here.
          </AppText>
        </View>
      ) : (
        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s3 }}>
          {rows.map((r, i) => {
            const on = !disabled.has(r.sender);
            return (
              <ToggleRow
                key={r.sender}
                icon={BankIcon}
                label={r.sender}
                sub={`${r.count} message${r.count === 1 ? '' : 's'} read${on ? '' : ' · new messages paused'}`}
                on={on}
                last={i === rows.length - 1}
                onToggle={() => setSenderEnabled(r.sender, !on)}
              />
            );
          })}
        </Card>
      )}

      <Pressable
        onPress={() => showToast('Scanning for new bank senders…')}
        style={{
          width: '100%',
          paddingVertical: spacing.s4,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.borderStrong,
          borderRadius: radii.cardSm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <PlusCircleIcon size={18} color={colors.navy} />
        <AppText weight="semibold" style={{ fontSize: 13, color: colors.navy }}>
          Add source
        </AppText>
      </Pressable>
    </SettingsSubScreen>
  );
}

export default SmsSourcesScreen;
