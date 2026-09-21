import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, PermissionsAndroid, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddressBookIcon } from 'phosphor-react-native/lib/module/icons/AddressBook';
import { ChatCenteredTextIcon } from 'phosphor-react-native/lib/module/icons/ChatCenteredText';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import AppHeader from '../components/AppHeader';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import GoldButton from '../components/GoldButton';
import GroupRow from '../components/GroupRow';
import PeerRow from '../components/PeerRow';
import TabBar, { type TabId } from '../components/TabBar';
import CreateGroupSheet from '../components/CreateGroupSheet';
import SettleUpSheet from '../components/SettleUpSheet';
import { colors, radii, spacing } from '../theme';
import {
  getGroups,
  getPeoplePage,
  getSplitTotals,
  subscribeToFriends,
  subscribeToGroups,
  type Friend,
} from '../lib/friendsStore';
import { getReviewQueue } from '../lib/peopleReview';
import { hasSmsPermission, requestSmsPermission } from '../native/sms';
import { hasContactsPermission } from '../native/contacts';
import { startHistoryScan, getScanProgress, subscribeToScanProgress, type ScanProgress } from '../lib/historyScanner';
import { runAutoContactMatch } from '../lib/peopleReview';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splits'>;

const PAGE_SIZE = 30;

async function requestContactsPermissionNow(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
      title: 'Contacts Permission',
      message: 'Dhan uses your contacts to match payments to people you know for Split.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

function SplitsScreen({ navigation }: Props) {
  const [smsGranted, setSmsGranted] = useState<boolean | null>(null);
  const [contactsGranted, setContactsGranted] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState(false);

  const [people, setPeople] = useState<Friend[]>([]);
  const [peopleTotal, setPeopleTotal] = useState(0);
  const [loadedPages, setLoadedPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [peopleLoaded, setPeopleLoaded] = useState(false);

  const [reviewCount, setReviewCount] = useState(0);
  const [groups, setGroups] = useState(getGroups());
  const [totals, setTotals] = useState(getSplitTotals());
  const [scanProgress, setScanProgress] = useState<ScanProgress>(getScanProgress());
  const [createOpen, setCreateOpen] = useState(false);
  const [settleFriendTarget, setSettleFriendTarget] = useState<Friend | null>(null);

  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFirstPage = useCallback(() => {
    const { people: page, total } = getPeoplePage(0, PAGE_SIZE);
    setPeople(page);
    setPeopleTotal(total);
    setLoadedPages(1);
    setPeopleLoaded(true);
    setReviewCount(getReviewQueue(500).length);
    setGroups([...getGroups()]);
    setTotals(getSplitTotals());
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || people.length >= peopleTotal) return;
    setLoadingMore(true);
    const { people: page } = getPeoplePage(loadedPages, PAGE_SIZE);
    setPeople(prev => [...prev, ...page]);
    setLoadedPages(p => p + 1);
    setLoadingMore(false);
  }, [loadingMore, people.length, peopleTotal, loadedPages]);

  // Permission checks re-run every time this screen gains focus, since the
  // user can flip either permission from Android's own Settings while away.
  useEffect(() => {
    const check = async () => {
      const [sms, contacts] = await Promise.all([hasSmsPermission(), hasContactsPermission()]);
      setSmsGranted(sms);
      setContactsGranted(contacts);
      if (sms) loadFirstPage();
    };
    check();
    const unsubscribe = navigation.addListener('focus', check);
    return unsubscribe;
  }, [navigation, loadFirstPage]);

  // People/groups changes (a split, a settle, a scan inserting new
  // transactions) coalesce into one reload rather than one per event —
  // a full history scan can fire this dozens of times a second.
  useEffect(() => {
    const scheduleReload = () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(loadFirstPage, 500);
    };
    const unsubFriends = subscribeToFriends(scheduleReload);
    const unsubGroups = subscribeToGroups(() => setGroups([...getGroups()]));
    return () => {
      unsubFriends();
      unsubGroups();
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
    };
  }, [loadFirstPage]);

  useEffect(() => subscribeToScanProgress(setScanProgress), []);

  const enableSms = async () => {
    setRequesting(true);
    try {
      const granted = await requestSmsPermission();
      setSmsGranted(granted);
      if (granted) {
        loadFirstPage();
        startHistoryScan().catch(() => {});
      }
    } finally {
      setRequesting(false);
    }
  };

  const enableContacts = async () => {
    setRequesting(true);
    try {
      const granted = await requestContactsPermissionNow();
      setContactsGranted(granted);
      if (granted) runAutoContactMatch().catch(() => {});
    } finally {
      setRequesting(false);
    }
  };

  const handleTab = (id: TabId) => {
    if (id === 'split') return;
    if (id === 'home') navigation.navigate('Home');
    else if (id === 'txn') navigation.navigate('Transactions');
    else if (id === 'budget') navigation.navigate('Budget');
    else if (id === 'bills') navigation.navigate('Bills');
  };

  const header = (
    <View>
      <AppText weight="medium" style={{ fontSize: 20, color: colors.navy, letterSpacing: -0.4, marginBottom: spacing.s4 }}>
        Splits &amp; Dues
      </AppText>

      <View style={{ flexDirection: 'row', gap: spacing.s4, marginBottom: spacing.s4 }}>
        <View style={{ flex: 1, backgroundColor: colors.incomeBg, borderRadius: radii.card, padding: spacing.s4 }}>
          <AppText weight="medium" style={{ fontSize: 13, color: colors.income }}>
            You&apos;ll get
          </AppText>
          <AppText weight="semibold" style={{ fontSize: 24, color: colors.income, marginTop: spacing.s2, letterSpacing: -0.4, fontVariant: ['tabular-nums'] }}>
            ₹{totals.get.toLocaleString('en-IN')}
          </AppText>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.expenseBg, borderRadius: radii.card, padding: spacing.s4 }}>
          <AppText weight="medium" style={{ fontSize: 13, color: colors.navy, opacity: 0.7 }}>
            You&apos;ll pay
          </AppText>
          <AppText weight="semibold" style={{ fontSize: 24, color: colors.navy, marginTop: spacing.s2, letterSpacing: -0.4, fontVariant: ['tabular-nums'] }}>
            ₹{totals.pay.toLocaleString('en-IN')}
          </AppText>
        </View>
      </View>

      {contactsGranted === false ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radii.control, padding: spacing.s3, marginBottom: spacing.s4 }}>
          <AddressBookIcon size={18} color={colors.gold} />
          <AppText style={{ flex: 1, fontSize: 12, color: colors.fg2 }}>Turn on Contacts to match names to people you know.</AppText>
          <Button variant="outline" size="sm" disabled={requesting} onPress={enableContacts}>
            Allow
          </Button>
        </View>
      ) : null}

      {scanProgress.status === 'scanning' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, backgroundColor: colors.bgSurface, borderRadius: radii.control, padding: spacing.s3, marginBottom: spacing.s4 }}>
          <ActivityIndicator size="small" color={colors.navy} />
          <AppText style={{ flex: 1, fontSize: 12, color: colors.fg2 }}>
            Reading your messages... {scanProgress.percent}%
          </AppText>
        </View>
      ) : null}

      {reviewCount > 0 ? (
        <Card
          onPress={() => navigation.navigate('MatchPeople')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, padding: spacing.s3 + 2, marginBottom: spacing.s4 }}
        >
          <UsersThreeIcon size={18} color={colors.gold} weight="fill" />
          <AppText style={{ flex: 1, fontSize: 13, color: colors.fg2 }}>
            <AppText weight="semibold" style={{ color: colors.fg1 }}>
              {reviewCount} {reviewCount === 1 ? 'person needs' : 'people need'} review
            </AppText>{' '}
            — match them to your contacts
          </AppText>
          <CaretRightIcon size={16} color={colors.fg3} />
        </Card>
      ) : null}

      <AppText weight="medium" style={{ fontSize: 16, marginBottom: spacing.s4 }}>
        With your people
      </AppText>
    </View>
  );

  const footer = (
    <View>
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
      <View style={{ height: spacing.s6 }} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <AppHeader
        onMenu={() => navigation.navigate('Settings')}
        onSearch={() => navigation.navigate('Search')}
        onNotify={() => navigation.navigate('Notifications')}
      />

      {smsGranted === false ? (
        <View style={{ flex: 1, paddingHorizontal: spacing.s4, paddingTop: spacing.s2 }}>
          {header}
          <View style={{ alignItems: 'center', paddingVertical: spacing.s7, gap: spacing.s3 }}>
            <ChatCenteredTextIcon size={40} color={colors.fg3} />
            <AppText weight="semibold" style={{ fontSize: 15, textAlign: 'center' }}>
              Turn on SMS access to see your payments
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.fg3, textAlign: 'center', lineHeight: 19, marginBottom: spacing.s2 }}>
              Dhan reads bank &amp; UPI SMS on this device to find people you&apos;ve paid, so it can show them here.
            </AppText>
            <Button variant="primary" size="lg" disabled={requesting} onPress={enableSms}>
              {requesting ? 'Requesting…' : 'Allow SMS access'}
            </Button>
          </View>
        </View>
      ) : (
        <FlatList
          data={people}
          keyExtractor={f => f.id}
          contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingTop: spacing.s2, paddingBottom: spacing.s6 }}
          ListHeaderComponent={header}
          ListFooterComponent={peopleLoaded ? footer : undefined}
          renderItem={({ item }) => (
            <PeerRow f={item} onPress={() => navigation.navigate('FriendDetail', { friendId: item.id })} onAction={fr => setSettleFriendTarget(fr)} />
          )}
          ListEmptyComponent={
            peopleLoaded ? (
              <View style={{ alignItems: 'center', paddingVertical: spacing.s6, gap: spacing.s2 }}>
                <UsersThreeIcon size={36} color={colors.fg3} />
                <AppText weight="semibold" style={{ fontSize: 14 }}>
                  No payments found yet
                </AppText>
                <AppText style={{ fontSize: 12.5, color: colors.fg3, textAlign: 'center', lineHeight: 18 }}>
                  {scanProgress.status === 'scanning'
                    ? 'Still reading your message history — people will show up here as they’re found.'
                    : 'Once Dhan spots a payment to someone, they’ll show up here.'}
                </AppText>
              </View>
            ) : undefined
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponentStyle={undefined}
          removeClippedSubviews={false}
        />
      )}

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
