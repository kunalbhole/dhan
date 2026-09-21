import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DotsThreeIcon } from 'phosphor-react-native/lib/module/icons/DotsThree';
import { HandshakeIcon } from 'phosphor-react-native/lib/module/icons/Handshake';
import { PaperPlaneTiltIcon } from 'phosphor-react-native/lib/module/icons/PaperPlaneTilt';
import { ExportIcon } from 'phosphor-react-native/lib/module/icons/Export';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import CategoryIcon from '../components/CategoryIcon';
import ContactAvatar from '../components/ContactAvatar';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import BottomSheet from '../components/BottomSheet';
import SettleUpSheet from '../components/SettleUpSheet';
import SplitSheet, { type SplitTxn } from '../components/SplitSheet';
import { colors, radii, spacing } from '../theme';
import { getFriend, subscribeToFriends, type Friend } from '../lib/friendsStore';
import { getPersonTransactionsSync, subscribeToTransactionsChanged, type StoredTransaction } from '../lib/db';
import { formatDay, formatTime } from '../lib/format';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendDetail'>;

function FriendDetailScreen({ route, navigation }: Props) {
  const { friendId } = route.params;
  const [friend, setFriend] = useState<Friend | undefined>(() => getFriend(friendId));
  const [txns, setTxns] = useState<StoredTransaction[]>(() => getPersonTransactionsSync(friendId));
  const [menuOpen, setMenuOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [splitTxn, setSplitTxn] = useState<SplitTxn | null>(null);

  useEffect(() => subscribeToFriends(() => setFriend(getFriend(friendId))), [friendId]);
  useEffect(
    () => subscribeToTransactionsChanged(() => setTxns(getPersonTransactionsSync(friendId))),
    [friendId],
  );

  if (!friend) return null;
  const net = friend.net;
  const label = net > 0 ? 'Owes you' : net < 0 ? 'You owe' : 'Settled';
  const netColor = net > 0 ? colors.income : net < 0 ? colors.expense : colors.fg1;

  const reminderText = `Hi ${friend.name.split(' ')[0]}, just a reminder — you owe ₹${Math.abs(net).toLocaleString('en-IN')} on Dhan.`;

  const requestSettlement = () => {
    setMenuOpen(false);
    Share.share({ message: reminderText }).catch(() => {});
  };
  const exportHistory = () => {
    setMenuOpen(false);
    Share.share({ message: `${friend.name} · ${txns.length} payments on Dhan` }).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader
        title={friend.name}
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            accessibilityLabel="More actions"
            onPress={() => setMenuOpen(true)}
            style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}
          >
            <DotsThreeIcon size={20} color={colors.fg1} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        <View style={{ alignItems: 'center', paddingVertical: spacing.s3 }}>
          <ContactAvatar f={friend} size={72} fontSize={26} />
          {friend.phone ? (
            <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: spacing.s2 }}>{friend.phone}</AppText>
          ) : null}
          <View style={{ height: 10 }} />
          <AppText weight="semibold" style={{ fontSize: 12, color: colors.fg3, letterSpacing: 0.1 }}>
            {label}
          </AppText>
          <AppText weight="bold" style={{ fontSize: 32, marginTop: 4, color: netColor, fontVariant: ['tabular-nums'] }}>
            ₹{Math.abs(net).toLocaleString('en-IN')}
          </AppText>
          <AppText style={{ fontSize: 11.5, color: colors.fg3, marginTop: 4 }}>
            Only reflects payments you&apos;ve actually split — not every payment below
          </AppText>
        </View>

        <View style={{ gap: spacing.s2 }}>
          <Button variant="primary" full size="lg" icon={HandshakeIcon} disabled={net === 0} onPress={() => setSettleOpen(true)}>
            {net === 0 ? 'All settled' : 'Settle up'}
          </Button>
          {net > 0 ? (
            <Button variant="outline" full icon={PaperPlaneTiltIcon} onPress={requestSettlement}>
              Request settlement
            </Button>
          ) : null}
        </View>

        <View style={{ height: 20 }} />
        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          Payment history · from your messages
        </AppText>
        {txns.length === 0 ? (
          <Card style={{ padding: spacing.s4 }}>
            <AppText style={{ fontSize: 13, color: colors.fg3, lineHeight: 19 }}>No payments found with {friend.name} yet.</AppText>
          </Card>
        ) : (
          <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
            {txns.map((t, i, arr) => (
              <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
                <CategoryIcon cat={t.category} tint />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText weight="medium" style={{ fontSize: 14, color: colors.fg2 }} numberOfLines={1}>
                    {t.merchant ?? friend.name}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }} numberOfLines={1}>
                    {formatDay(t.timestamp)} · {formatTime(t.timestamp)}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <AppText weight="semibold" style={{ fontSize: 14, color: t.amount > 0 ? colors.income : colors.fg1, fontVariant: ['tabular-nums'] }}>
                    {t.amount > 0 ? '+' : '−'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                  </AppText>
                  <Pressable
                    onPress={() =>
                      setSplitTxn({
                        id: t.id,
                        merchant: t.merchant ?? friend.name,
                        amount: Math.abs(t.amount),
                        category: t.category,
                        day: formatDay(t.timestamp),
                      })
                    }
                  >
                    <AppText weight="semibold" style={{ fontSize: 11.5, color: colors.navy }}>
                      Split this
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title={friend.name}>
        {[
          { Icon: HandshakeIcon, label: 'Settle all', sub: `Close out ₹${Math.abs(net).toLocaleString('en-IN')} outstanding`, go: () => { setMenuOpen(false); setSettleOpen(true); }, hidden: net === 0 },
          { Icon: PaperPlaneTiltIcon, label: 'Request settlement', sub: 'Send a reminder by message', go: requestSettlement, hidden: net <= 0 },
          { Icon: ExportIcon, label: 'Export history', sub: 'Share a summary of these transactions', go: exportHistory, hidden: false },
        ]
          .filter(a => !a.hidden)
          .map((a, i, arr) => (
            <Pressable key={a.label} onPress={a.go} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
              <IconChip icon={a.Icon} />
              <View>
                <AppText weight="medium" style={{ fontSize: 14, color: colors.navy }}>
                  {a.label}
                </AppText>
                <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{a.sub}</AppText>
              </View>
            </Pressable>
          ))}
      </BottomSheet>

      <SettleUpSheet open={settleOpen} onClose={() => setSettleOpen(false)} friend={friend} />
      <SplitSheet open={!!splitTxn} onClose={() => setSplitTxn(null)} txn={splitTxn} />
    </SafeAreaView>
  );
}

export default FriendDetailScreen;
