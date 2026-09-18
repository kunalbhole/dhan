import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DotsThreeIcon } from 'phosphor-react-native/lib/module/icons/DotsThree';
import { HandshakeIcon } from 'phosphor-react-native/lib/module/icons/Handshake';
import { PaperPlaneTiltIcon } from 'phosphor-react-native/lib/module/icons/PaperPlaneTilt';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { ExportIcon } from 'phosphor-react-native/lib/module/icons/Export';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import ContactAvatar from '../components/ContactAvatar';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import BottomSheet from '../components/BottomSheet';
import SettleUpSheet from '../components/SettleUpSheet';
import { colors, radii, spacing } from '../theme';
import { getFriend, subscribeToFriends, type Friend } from '../lib/friendsStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendDetail'>;

interface SplitLine {
  id: string;
  m: string;
  d: string;
  split: string;
  share: number;
}

// Ported verbatim from screens-detail.jsx's FriendDetailScreen — 4
// deterministic sample split lines per friend, same status as the
// group-expense sample rows in src/lib/friendsStore.ts.
function friendTxns(friend: Friend): SplitLine[] {
  const owed = friend.net > 0;
  return [
    { id: `sp-${friend.id}-1`, m: 'Dinner at Indigo', d: 'Apr 18', split: 'You split ₹1,200', share: owed ? 450 : -320 },
    { id: `sp-${friend.id}-2`, m: 'Grocery run', d: 'Apr 10', split: 'You covered ₹600', share: owed ? 300 : -200 },
    { id: `sp-${friend.id}-3`, m: 'Uber to airport', d: 'Mar 24', split: 'Split 50/50', share: owed ? 450 : -330 },
    { id: `sp-${friend.id}-4`, m: 'Cafe catch-up', d: 'Mar 12', split: 'You paid', share: owed ? 200 : -180 },
  ];
}

function FriendDetailScreen({ route, navigation }: Props) {
  const { friendId } = route.params;
  const [friend, setFriend] = useState<Friend | undefined>(() => getFriend(friendId));
  const [menuOpen, setMenuOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  useEffect(() => subscribeToFriends(() => setFriend(getFriend(friendId))), [friendId]);

  if (!friend) return null;
  const net = friend.net;
  const label = net > 0 ? 'Owes you' : net < 0 ? 'You owe' : 'Settled';
  const netColor = net > 0 ? colors.income : net < 0 ? colors.expense : colors.fg1;
  const txns = friendTxns(friend);

  const reminderText = `Hi ${friend.name.split(' ')[0]}, just a reminder — you owe ₹${Math.abs(net).toLocaleString('en-IN')} on Dhan.`;

  const requestSettlement = () => {
    setMenuOpen(false);
    Share.share({ message: reminderText }).catch(() => {});
  };
  const exportHistory = () => {
    setMenuOpen(false);
    Share.share({ message: `${friend.name} · ${txns.length} shared transactions on Dhan` }).catch(() => {});
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
          History
        </AppText>
        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
          {txns.map((t, i, arr) => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
              <IconChip icon={ReceiptIcon} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText weight="medium" style={{ fontSize: 14, color: colors.fg2 }} numberOfLines={1}>
                  {t.m}
                </AppText>
                <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }} numberOfLines={1}>
                  {t.d} · {t.split}
                </AppText>
              </View>
              <AppText weight="semibold" style={{ fontSize: 14, color: t.share > 0 ? colors.income : colors.fg1, fontVariant: ['tabular-nums'] }}>
                {t.share > 0 ? '+' : '−'}₹{Math.abs(t.share).toLocaleString('en-IN')}
              </AppText>
            </View>
          ))}
        </Card>
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
    </SafeAreaView>
  );
}

export default FriendDetailScreen;
