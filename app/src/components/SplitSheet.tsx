import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { LockSimpleIcon } from 'phosphor-react-native/lib/module/icons/LockSimple';
import { UserPlusIcon } from 'phosphor-react-native/lib/module/icons/UserPlus';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import Button from './Button';
import CategoryIcon from './CategoryIcon';
import Field from './Field';
import { colors, radii, spacing, typography } from '../theme';
import { initials } from './ContactAvatar';
import { getFriends, adjustFriendNet } from '../lib/friendsStore';
import { showToast } from '../lib/toast';

export interface SplitTxn {
  id?: number;
  merchant: string;
  amount: number;
  category: string;
  day: string;
}

export interface SplitSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  txn?: SplitTxn | null;
}

// Ported from Dhan App 2/screens-split.jsx's SplitSheet, minus the
// "Add contact" sub-flow (contacts picker / manual entry): that's
// Plus-gated in the reference (`PlusLock locked`), and this app's Plus
// state is always false (no subscription exists yet), so a free-tier
// user never sees more than the locked button anyway — same UI, less
// dead code. Unlike the reference's own onSave (closes + toasts only),
// saving here really moves each selected friend's balance via
// src/lib/friendsStore.ts's adjustFriendNet.
function SplitSheet({ open, onClose, onSaved, txn }: SplitSheetProps) {
  const [mode, setMode] = useState<'equal' | 'exact'>('equal');
  const [sel, setSel] = useState<string[]>([]);
  const [amt, setAmt] = useState('');
  const [shares, setShares] = useState<Record<string, string>>({});
  const friends = getFriends();

  useEffect(() => {
    if (!open) return;
    setMode('equal');
    setSel([]);
    setShares({});
    setAmt(txn ? String(Math.round(txn.amount)) : '');
  }, [open, txn]);

  const total = parseInt(amt || '0', 10) || 0;
  const heads = sel.length + 1;
  const equalShare = Math.round(total / heads);
  const toggle = (id: string) => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  const shareOf = (id: string) => (mode === 'equal' ? equalShare : parseInt(shares[id] || '0', 10) || 0);
  const assigned = sel.reduce((s, id) => s + shareOf(id), 0);
  const yours = Math.max(0, total - assigned);

  const save = () => {
    if (!total || sel.length === 0) return;
    sel.forEach(id => adjustFriendNet(id, shareOf(id), txn?.id ?? null));
    showToast(`Split with ${sel.length} ${sel.length === 1 ? 'person' : 'people'}`);
    onSaved?.();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={txn ? 'Split this expense' : 'New split'}>
      {txn ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, marginBottom: spacing.s6 }}>
          <CategoryIcon cat={txn.category} size={40} tint />
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText weight="semibold" style={{ fontSize: 15 }} numberOfLines={1}>
              {txn.merchant}
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.fg3, marginTop: 2 }}>{txn.day}</AppText>
          </View>
          <AppText weight="semibold" style={{ fontSize: 18, fontVariant: ['tabular-nums'] }}>
            ₹{total.toLocaleString('en-IN')}
          </AppText>
        </View>
      ) : (
        <Field label="Total amount" value={amt} prefix="₹" keyboardType="number-pad" onChangeText={v => setAmt(v.replace(/[^\d]/g, ''))} />
      )}

      <View style={{ flexDirection: 'row', gap: spacing.s2, backgroundColor: colors.bgSurface, borderRadius: radii.control, padding: spacing.s2, marginBottom: spacing.s6 }}>
        {([
          ['equal', 'Split equally'],
          ['exact', 'Exact amounts'],
        ] as const).map(([id, label]) => (
          <Pressable
            key={id}
            onPress={() => setMode(id)}
            style={[{ flex: 1, height: 36, borderRadius: radii.input, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === id ? colors.bgElevated : 'transparent' }, mode === id ? shadowCard : null]}
          >
            <AppText weight="semibold" style={{ fontSize: 13, color: mode === id ? colors.navy : colors.fg3 }}>
              {label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <AppText weight="medium" style={{ fontSize: 13, color: colors.fg3, marginBottom: spacing.s2 }}>
        Who&apos;s in
      </AppText>
      <View style={{ gap: spacing.s2, marginBottom: spacing.s4 }}>
        {friends.map(f => {
          const on = sel.includes(f.id);
          return (
            <Pressable
              key={f.id}
              onPress={() => toggle(f.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s4, padding: spacing.s2, borderRadius: radii.control, borderWidth: 1, borderColor: on ? colors.navy : colors.borderDefault, backgroundColor: colors.bgElevated }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: on ? colors.navy : colors.bgSurface, alignItems: 'center', justifyContent: 'center' }}>
                <AppText weight="semibold" style={{ fontSize: 13, color: on ? colors.fgOnDark : colors.fg2 }}>
                  {initials(f.name)}
                </AppText>
              </View>
              <AppText weight="semibold" style={{ fontSize: 14, flex: 1 }} numberOfLines={1}>
                {f.name}
              </AppText>
              {on ? (
                mode === 'equal' ? (
                  <AppText weight="semibold" style={{ fontSize: 14, fontVariant: ['tabular-nums'] }}>
                    ₹{equalShare.toLocaleString('en-IN')}
                  </AppText>
                ) : (
                  <TextInput
                    value={shares[f.id] ?? ''}
                    onChangeText={v => setShares(s => ({ ...s, [f.id]: v.replace(/[^\d]/g, '') }))}
                    placeholder="0"
                    placeholderTextColor={colors.fg4}
                    keyboardType="number-pad"
                    style={{ width: 96, height: 36, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radii.input, paddingHorizontal: spacing.s2, fontFamily: typography.family.semibold, fontSize: 14, textAlign: 'right', color: colors.navy }}
                  />
                )
              ) : (
                <AppText style={{ fontSize: 13, color: colors.fg4 }}>Add</AppText>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => {}}
        style={{
          alignSelf: 'flex-start',
          opacity: 0.6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderWidth: 1,
          borderColor: colors.gold,
          borderRadius: radii.input,
          paddingVertical: spacing.s2,
          paddingHorizontal: spacing.s4,
          backgroundColor: 'rgba(201,168,76,.14)',
          marginBottom: spacing.s4,
        }}
      >
        <UserPlusIcon size={14} color={colors.gold} />
        <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.gold }}>
          Add contact
        </AppText>
        <LockSimpleIcon size={13} color={colors.gold} />
      </Pressable>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgSurface, borderRadius: radii.control, padding: spacing.s4, marginBottom: spacing.s4 }}>
        <AppText style={{ fontSize: 13, color: colors.fg2 }}>{sel.length === 0 ? 'Pick who shared this' : `You keep · ${sel.length} owe you`}</AppText>
        <AppText weight="semibold" style={{ fontSize: 16, fontVariant: ['tabular-nums'] }}>
          ₹{yours.toLocaleString('en-IN')}
        </AppText>
      </View>

      <Button variant="primary" full size="lg" disabled={!total || sel.length === 0} onPress={save}>
        Save split
      </Button>
    </BottomSheet>
  );
}

const shadowCard = { shadowColor: colors.navy, shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 };

export default SplitSheet;
