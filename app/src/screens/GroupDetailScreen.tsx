import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DotsThreeIcon } from 'phosphor-react-native/lib/module/icons/DotsThree';
import { HandshakeIcon } from 'phosphor-react-native/lib/module/icons/Handshake';
import { PlusIcon } from 'phosphor-react-native/lib/module/icons/Plus';
import { PencilSimpleIcon } from 'phosphor-react-native/lib/module/icons/PencilSimple';
import { UserPlusIcon } from 'phosphor-react-native/lib/module/icons/UserPlus';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import { SignOutIcon } from 'phosphor-react-native/lib/module/icons/SignOut';
import { ArrowDownLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowDownLeft';
import { ArrowUpRightIcon } from 'phosphor-react-native/lib/module/icons/ArrowUpRight';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import ContactAvatar from '../components/ContactAvatar';
import DetailRow from '../components/DetailRow';
import FAB from '../components/FAB';
import Field from '../components/Field';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import BottomSheet from '../components/BottomSheet';
import SelectIndicator from '../components/SelectIndicator';
import AddGroupExpenseSheet from '../components/AddGroupExpenseSheet';
import { colors, radii, spacing } from '../theme';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { GROUP_ICON_IDS, GROUP_ICONS } from '../lib/groupIcons';
import { getFriends, getGroup, getGroupExpenses, groupLedger, removeGroup, subscribeToGroups, updateGroup, type LedgerMember } from '../lib/friendsStore';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

const money = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN')}`;

function GroupDetailScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const [group, setGroup] = useState(() => getGroup(groupId));
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMember, setOpenMember] = useState<string | null>(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [pickMembers, setPickMembers] = useState<string[]>([]);

  useEffect(() => subscribeToGroups(() => setGroup(getGroup(groupId))), [groupId]);

  if (!group) return null;
  const expenses = getGroupExpenses(group);
  const ledger: LedgerMember[] = groupLedger(group, expenses);
  const net = ledger.reduce((s, m) => s + m.net, 0);
  const label = net > 0 ? "You're owed" : net < 0 ? 'You owe' : 'All settled';
  const netColor = net > 0 ? colors.income : net < 0 ? colors.expense : colors.fg1;
  const owedTo = ledger.filter(m => m.net < 0);
  const owedBy = ledger.filter(m => m.net > 0);
  const canDelete = net === 0;

  const openEdit = () => {
    setEditName(group.name);
    setEditOpen(true);
    setMenuOpen(false);
  };
  const openMembers = () => {
    setPickMembers(group.members);
    setMembersOpen(true);
    setMenuOpen(false);
  };
  const toggleMember = (id: string) => setPickMembers(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader
        title={group.name}
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            accessibilityLabel="Group actions"
            onPress={() => setMenuOpen(true)}
            style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}
          >
            <DotsThreeIcon size={20} color={colors.fg1} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: 100 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.s3, paddingVertical: 4 }}>
          {ledger.map(m => {
            const on = openMember === m.id;
            return (
              <Pressable key={m.id} onPress={() => setOpenMember(on ? null : m.id)} style={{ width: 56, alignItems: 'center', gap: 6 }}>
                <View style={{ borderRadius: 999, borderWidth: on ? 2 : 0, borderColor: colors.gold }}>
                  <ContactAvatar f={m} size={44} fontSize={15} />
                </View>
                <AppText style={{ fontSize: 11, color: colors.fg3 }} numberOfLines={1}>
                  {m.name.split(' ')[0]}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {openMember
          ? (() => {
              const m = ledger.find(x => x.id === openMember);
              if (!m) return null;
              return (
                <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginTop: spacing.s2 }}>
                  <DetailRow
                    icon={m.net > 0 ? ArrowDownLeftIcon : m.net < 0 ? ArrowUpRightIcon : CheckCircleIcon}
                    label={m.net > 0 ? `${m.name.split(' ')[0]} owes you` : m.net < 0 ? `You owe ${m.name.split(' ')[0]}` : `Settled with ${m.name.split(' ')[0]}`}
                    sub={`In ${group.name}`}
                    last
                  >
                    <AppText weight="semibold" style={{ fontSize: 14, color: m.net > 0 ? colors.income : m.net < 0 ? colors.expense : colors.fg3, fontVariant: ['tabular-nums'] }}>
                      {m.net === 0 ? '—' : money(m.net)}
                    </AppText>
                  </DetailRow>
                </Card>
              );
            })()
          : null}

        <View style={{ alignItems: 'center', paddingVertical: spacing.s5 }}>
          <AppText weight="semibold" style={{ fontSize: 12, color: colors.fg3 }}>
            {label}
          </AppText>
          {net !== 0 ? (
            <AppText weight="bold" style={{ fontSize: 32, marginTop: 4, color: netColor, fontVariant: ['tabular-nums'] }}>
              {money(net)}
            </AppText>
          ) : null}
        </View>

        <View style={{ gap: spacing.s2 }}>
          <Button variant="primary" full size="lg" icon={HandshakeIcon} disabled={net === 0} onPress={() => setSettleOpen(true)}>
            {net === 0 ? 'All settled' : 'Settle up'}
          </Button>
          <Button variant="outline" full icon={PlusIcon} onPress={() => setAddExpenseOpen(true)}>
            Add expense
          </Button>
        </View>

        <View style={{ height: 20 }} />
        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          History
        </AppText>
        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
          {expenses.map((x, i, arr) => {
            const Icon = CATEGORY_ICONS[x.c] ?? CATEGORY_ICONS.other;
            return (
              <View key={x.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
                <IconChip icon={Icon} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText weight="medium" style={{ fontSize: 14, color: colors.fg2 }} numberOfLines={1}>
                    {x.m}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }} numberOfLines={1}>
                    {x.d} · {x.split}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText weight="semibold" style={{ fontSize: 14, color: x.share > 0 ? colors.income : colors.fg1, fontVariant: ['tabular-nums'] }}>
                    {x.share > 0 ? '+' : '−'}
                    {money(x.share)}
                  </AppText>
                  <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: 2 }}>of {money(x.total)}</AppText>
                </View>
              </View>
            );
          })}
          {expenses.length === 0 ? (
            <AppText style={{ fontSize: 13, color: colors.fg3, textAlign: 'center', paddingVertical: spacing.s5 }}>No group expenses yet.</AppText>
          ) : null}
        </Card>
      </ScrollView>

      <FAB onPress={() => setAddExpenseOpen(true)} />

      {/* Group actions */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title={group.name}>
        {[
          { Icon: PencilSimpleIcon, label: 'Edit group', sub: 'Rename or change the icon', go: openEdit, danger: false, disabled: false },
          { Icon: UserPlusIcon, label: 'Add or remove members', sub: `${group.members.length} members`, go: openMembers, danger: false, disabled: false },
          canDelete
            ? { Icon: TrashIcon, label: 'Delete group', sub: 'All balances are settled', go: () => { setMenuOpen(false); removeGroup(group.id); showToast('Group deleted'); navigation.goBack(); }, danger: true, disabled: false }
            : { Icon: TrashIcon, label: 'Delete group', sub: 'Settle all balances before deleting', go: () => {}, danger: false, disabled: true },
          { Icon: SignOutIcon, label: 'Leave group', sub: "You'll stop seeing new expenses", go: () => { setMenuOpen(false); removeGroup(group.id); showToast('You left the group'); navigation.goBack(); }, danger: true, disabled: false },
        ].map((a, i, arr) => (
          <Pressable key={a.label} onPress={a.disabled ? undefined : a.go} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s4, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle, opacity: a.disabled ? 0.45 : 1 }}>
            <IconChip icon={a.Icon} color={a.danger ? colors.expense : colors.navy} bg={a.danger ? colors.expenseBg : colors.bgSurface} />
            <View>
              <AppText weight="medium" style={{ fontSize: 14, color: a.danger ? colors.expense : colors.navy }}>
                {a.label}
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{a.sub}</AppText>
            </View>
          </Pressable>
        ))}
      </BottomSheet>

      {/* Settle-up breakdown — recorded as a note only, same as the
          reference: its own "Record settlement" handler just closes the
          sheet and shows a toast, with no real ledger mutation. Actually
          recomputing a derived, multi-member ledger to zero is a lot of
          surface for a no-op the source itself doesn't attempt either —
          this stays a toast-only action to match. */}
      <BottomSheet open={settleOpen} onClose={() => setSettleOpen(false)} title="Settle up">
        <AppText style={{ fontSize: 12.5, color: colors.fg2, lineHeight: 18, marginBottom: spacing.s3 }}>
          Simplified so everyone makes the fewest payments possible.
        </AppText>
        {owedTo.length ? (
          <>
            <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>
              You pay
            </AppText>
            <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s3 }}>
              {owedTo.map((m, i, arr) => (
                <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s3 + 2, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
                  <ContactAvatar f={m} size={40} fontSize={13} />
                  <AppText style={{ fontSize: 14, color: colors.fg2, flex: 1 }} numberOfLines={1}>
                    {m.name}
                  </AppText>
                  <AppText weight="semibold" style={{ fontSize: 14, color: colors.expense, fontVariant: ['tabular-nums'] }}>
                    {money(m.net)}
                  </AppText>
                </View>
              ))}
            </Card>
          </>
        ) : null}
        {owedBy.length ? (
          <>
            <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>
              You collect
            </AppText>
            <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s3 }}>
              {owedBy.map((m, i, arr) => (
                <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, paddingVertical: spacing.s3 + 2, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
                  <ContactAvatar f={m} size={40} fontSize={13} />
                  <AppText style={{ fontSize: 14, color: colors.fg2, flex: 1 }} numberOfLines={1}>
                    {m.name}
                  </AppText>
                  <AppText weight="semibold" style={{ fontSize: 14, color: colors.income, fontVariant: ['tabular-nums'] }}>
                    {money(m.net)}
                  </AppText>
                </View>
              ))}
            </Card>
          </>
        ) : null}
        <Button
          variant="primary"
          full
          size="lg"
          onPress={() => {
            setSettleOpen(false);
            showToast('Settlement recorded');
          }}
        >
          Record settlement
        </Button>
        <AppText style={{ fontSize: 11, color: colors.fg3, textAlign: 'center', marginTop: spacing.s3 - 2, lineHeight: 15 }}>
          Dhan records the settlement — it never moves money itself.
        </AppText>
      </BottomSheet>

      {/* Edit group */}
      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit group">
        <Field label="Group name" value={editName} onChangeText={setEditName} />
        <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Icon</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 }}>
          {GROUP_ICON_IDS.map(id => {
            const Icon = GROUP_ICONS[id];
            const on = group.icon === id;
            return (
              <Pressable
                key={id}
                onPress={() => updateGroup({ ...group, icon: id })}
                style={{ width: 44, height: 44, borderRadius: radii.input, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: on ? colors.navy : colors.borderSubtle, backgroundColor: on ? colors.navy : 'transparent' }}
              >
                <Icon size={18} color={on ? colors.fgOnDark : colors.fg2} />
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" full onPress={() => setEditOpen(false)}>
              Cancel
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              variant="primary"
              full
              disabled={!editName.trim()}
              onPress={() => {
                updateGroup({ ...group, name: editName.trim() });
                setEditOpen(false);
              }}
            >
              Save
            </Button>
          </View>
        </View>
      </BottomSheet>

      {/* Members */}
      <BottomSheet open={membersOpen} onClose={() => setMembersOpen(false)} title="Group members">
        <ScrollView style={{ maxHeight: 260, marginBottom: spacing.s4 }}>
          {getFriends().map((f, i, arr) => (
            <Pressable
              key={f.id}
              onPress={() => toggleMember(f.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, paddingVertical: spacing.s3, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}
            >
              <SelectIndicator on={pickMembers.includes(f.id)} />
              <ContactAvatar f={f} size={32} fontSize={12} />
              <AppText style={{ fontSize: 14, color: colors.fg2, flex: 1 }} numberOfLines={1}>
                {f.name}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" full onPress={() => setMembersOpen(false)}>
              Cancel
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              variant="primary"
              full
              disabled={!pickMembers.length}
              onPress={() => {
                updateGroup({ ...group, members: pickMembers });
                setMembersOpen(false);
              }}
            >
              Save members
            </Button>
          </View>
        </View>
      </BottomSheet>

      <AddGroupExpenseSheet open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} group={group} />
    </SafeAreaView>
  );
}

export default GroupDetailScreen;
