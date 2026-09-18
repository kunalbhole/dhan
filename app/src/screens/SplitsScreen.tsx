import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import AppText from '../components/AppText';
import Card from '../components/Card';
import GoldButton from '../components/GoldButton';
import GroupRow from '../components/GroupRow';
import PeerRow from '../components/PeerRow';
import TabBar, { type TabId } from '../components/TabBar';
import CreateGroupSheet from '../components/CreateGroupSheet';
import SettleUpSheet from '../components/SettleUpSheet';
import { colors, radii, spacing } from '../theme';
import { getFriends, getGroups, subscribeToFriends, subscribeToGroups, type Friend } from '../lib/friendsStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splits'>;

// Everything other than Home/Split (this screen), Txns, Budget, Bills,
// Settings, Search and Notifications is a screen this app hasn't built
// yet — the Plus paywall.
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[SplitsScreen] nav ->', dest);
};

function SplitsScreen({ navigation }: Props) {
  const [friends, setFriends] = useState<Friend[]>(getFriends());
  const [groups, setGroups] = useState(getGroups());
  const [createOpen, setCreateOpen] = useState(false);
  const [settleFriendTarget, setSettleFriendTarget] = useState<Friend | null>(null);

  useEffect(() => subscribeToFriends(() => setFriends([...getFriends()])), []);
  useEffect(() => subscribeToGroups(() => setGroups([...getGroups()])), []);

  const get = friends.filter(f => f.net > 0).reduce((s, f) => s + f.net, 0);
  const pay = friends.filter(f => f.net < 0).reduce((s, f) => s + Math.abs(f.net), 0);
  // isPlus is always false — no subscription state exists yet — so the
  // reference's `isPlus ? FRIENDS : FRIENDS.slice(0, 4)` always takes the
  // slice branch here.
  const list = friends.slice(0, 4);

  const handleTab = (id: TabId) => {
    if (id === 'split') return;
    if (id === 'home') navigation.navigate('Home');
    else if (id === 'txn') navigation.navigate('Transactions');
    else if (id === 'budget') navigation.navigate('Budget');
    else if (id === 'bills') navigation.navigate('Bills');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <AppHeader
        onMenu={() => navigation.navigate('Settings')}
        // The reference wires this tab's search icon to nav("txn") instead
        // of nav("search") — every other screen (Home, Transactions,
        // Budget, Bills) consistently uses "search", so this reads as a
        // copy-paste slip in the source rather than a deliberate choice;
        // wired to the real Search screen here for consistency.
        onSearch={() => navigation.navigate('Search')}
        onNotify={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingTop: spacing.s2, paddingBottom: spacing.s6 }}>
        {/* "New split" moved into AppHeader (GlobalAddSheet.tsx), shared
            across every screen — this title row used to also carry a "+"
            button opening SplitSheet directly. */}
        <AppText weight="medium" style={{ fontSize: 20, color: colors.navy, letterSpacing: -0.4, marginBottom: spacing.s4 }}>
          Splits &amp; Dues
        </AppText>

        <View style={{ flexDirection: 'row', gap: spacing.s4, marginBottom: spacing.s4 }}>
          <View style={{ flex: 1, backgroundColor: colors.incomeBg, borderRadius: radii.card, padding: spacing.s4 }}>
            <AppText weight="medium" style={{ fontSize: 13, color: colors.income }}>
              You&apos;ll get
            </AppText>
            <AppText weight="semibold" style={{ fontSize: 24, color: colors.income, marginTop: spacing.s2, letterSpacing: -0.4, fontVariant: ['tabular-nums'] }}>
              ₹{get.toLocaleString('en-IN')}
            </AppText>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.expenseBg, borderRadius: radii.card, padding: spacing.s4 }}>
            <AppText weight="medium" style={{ fontSize: 13, color: colors.navy, opacity: 0.7 }}>
              You&apos;ll pay
            </AppText>
            <AppText weight="semibold" style={{ fontSize: 24, color: colors.navy, marginTop: spacing.s2, letterSpacing: -0.4, fontVariant: ['tabular-nums'] }}>
              ₹{pay.toLocaleString('en-IN')}
            </AppText>
          </View>
        </View>

        <AppText weight="medium" style={{ fontSize: 16, marginBottom: spacing.s4 }}>
          With your people
        </AppText>
        {list.map(f => (
          <PeerRow key={f.id} f={f} onPress={() => navigation.navigate('FriendDetail', { friendId: f.id })} onAction={fr => setSettleFriendTarget(fr)} />
        ))}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.s4, marginBottom: spacing.s4 }}>
          <AppText weight="medium" style={{ fontSize: 16 }}>
            Your groups
          </AppText>
          <GoldButton onPress={() => setCreateOpen(true)}>+ New group</GoldButton>
        </View>
        {groups.length ? (
          groups.map(g => <GroupRow key={g.id} g={g} onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })} />)
        ) : (
          <Card style={{ padding: spacing.s4, marginBottom: spacing.s2 }}>
            <AppText style={{ fontSize: 13, color: colors.fg3, lineHeight: 20 }}>No groups yet. Create one to split a trip or a shared flat.</AppText>
          </Card>
        )}

        <Pressable onPress={() => stubNav('paywall')} style={{ backgroundColor: colors.navy, borderRadius: radii.card, padding: spacing.s4, marginTop: spacing.s4 }}>
          <AppText weight="semibold" style={{ fontSize: 15, color: colors.fgOnDark }}>
            Upgrade to track unlimited friends
          </AppText>
          <AppText weight="medium" style={{ fontSize: 13, color: colors.goldSoft, marginTop: 4 }}>
            Try Dhan Plus free for 3 months
          </AppText>
        </Pressable>
      </ScrollView>

      <TabBar active="split" onChange={handleTab} />

      <CreateGroupSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={g => navigation.navigate('GroupDetail', { groupId: g.id })}
      />
      <SettleUpSheet open={!!settleFriendTarget} onClose={() => setSettleFriendTarget(null)} friend={settleFriendTarget} />
    </SafeAreaView>
  );
}

export default SplitsScreen;
