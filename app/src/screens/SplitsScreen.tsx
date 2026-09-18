import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { StarIcon } from 'phosphor-react-native/lib/module/icons/Star';
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
import { getIsPlus, getPlanDetails, subscribeToPlan } from '../lib/planStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splits'>;

function SplitsScreen({ navigation }: Props) {
  const [friends, setFriends] = useState<Friend[]>(getFriends());
  const [groups, setGroups] = useState(getGroups());
  const [plan, setPlanState] = useState(getPlanDetails());
  const [createOpen, setCreateOpen] = useState(false);
  const [settleFriendTarget, setSettleFriendTarget] = useState<Friend | null>(null);

  useEffect(() => {
    return subscribeToFriends(() => setFriends([...getFriends()]));
  }, []);

  useEffect(() => {
    return subscribeToGroups(() => setGroups([...getGroups()]));
  }, []);

  useEffect(() => {
    return subscribeToPlan(() => setPlanState(getPlanDetails()));
  }, []);

  const get = friends.filter(f => f.net > 0).reduce((s, f) => s + f.net, 0);
  const pay = friends.filter(f => f.net < 0).reduce((s, f) => s + Math.abs(f.net), 0);

  // If Dhan Plus is active, show ALL friends and unlimited groups!
  const list = plan.isPlus ? friends : friends.slice(0, 4);

  const formattedExpiry = plan.trialExpiresAt
    ? new Date(plan.trialExpiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

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
        onSearch={() => navigation.navigate('Search')}
        onNotify={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingTop: spacing.s2, paddingBottom: spacing.s6 }}>
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
            Your groups ({groups.length})
          </AppText>
          <GoldButton onPress={() => setCreateOpen(true)}>+ New group</GoldButton>
        </View>
        {groups.length ? (
          groups.map(g => <GroupRow key={g.id} g={g} onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })} />)
        ) : (
          <Card style={{ padding: spacing.s4, marginBottom: spacing.s2 }}>
            <AppText style={{ fontSize: 13, color: colors.fg3, lineHeight: 20 }}>
              No groups yet. Tap + New group above to split a trip, flat, or dinner party.
            </AppText>
          </Card>
        )}

        {/* Plus Membership Status or Upgrade Card */}
        {plan.isPlus ? (
          <Card style={{ backgroundColor: colors.navy, padding: spacing.s4, marginTop: spacing.s4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <StarIcon size={18} color={colors.gold} weight="fill" />
                <AppText weight="bold" style={{ fontSize: 15, color: colors.fgOnDark }}>
                  Dhan Plus Active
                </AppText>
              </View>
              <View style={{ backgroundColor: colors.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill }}>
                <AppText weight="bold" style={{ fontSize: 10, color: colors.navy }}>
                  3-MONTH TRIAL
                </AppText>
              </View>
            </View>
            <AppText style={{ fontSize: 12.5, color: colors.goldSoft, marginTop: 6 }}>
              {plan.mandateBank || 'UPI Auto-Mandate'} active · First auto-debit on {formattedExpiry}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <CheckCircleIcon size={14} color={colors.income} weight="fill" />
              <AppText style={{ fontSize: 11.5, color: colors.fgOnDark, opacity: 0.8 }}>
                Unlimited groups, AI insights, and multi-currency unlocked
              </AppText>
            </View>
          </Card>
        ) : (
          <Pressable onPress={() => navigation.navigate('PlusPaywall', { note: 'Track unlimited split groups with Dhan Plus' })} style={{ backgroundColor: colors.navy, borderRadius: radii.card, padding: spacing.s4, marginTop: spacing.s4 }}>
            <AppText weight="semibold" style={{ fontSize: 15, color: colors.fgOnDark }}>
              Upgrade to track unlimited friends
            </AppText>
            <AppText weight="medium" style={{ fontSize: 13, color: colors.goldSoft, marginTop: 4 }}>
              Try Dhan Plus free for 3 months
            </AppText>
          </Pressable>
        )}
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
