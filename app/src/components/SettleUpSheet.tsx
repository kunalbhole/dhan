import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { QrCodeIcon } from 'phosphor-react-native/lib/module/icons/QrCode';
import { MoneyIcon } from 'phosphor-react-native/lib/module/icons/Money';
import { PaperPlaneTiltIcon } from 'phosphor-react-native/lib/module/icons/PaperPlaneTilt';
import { HandshakeIcon } from 'phosphor-react-native/lib/module/icons/Handshake';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import Button from './Button';
import { colors, radii, spacing } from '../theme';
import { initials } from './ContactAvatar';
import { settleFriend, type Friend } from '../lib/friendsStore';
import { showToast } from '../lib/toast';

export interface SettleUpSheetProps {
  open: boolean;
  onClose: () => void;
  friend: Friend | null;
  onConfirmed?: () => void;
}

const METHODS = [
  { id: 'upi', icon: QrCodeIcon, title: 'UPI', sub: 'Instant' },
  { id: 'cash', icon: MoneyIcon, title: 'Cash', sub: 'Mark manually' },
];

// Ported from Dhan App 2/screens-detail.jsx's SettleUpSheet. The
// reference's own onConfirm only shows a toast (app.jsx's SettleUpSheet
// wiring never touches FRIENDS) — this one really zeros the balance via
// src/lib/friendsStore.ts's settleFriend, since unlike a group's derived
// ledger a friend's net is a plain stored field.
function SettleUpSheet({ open, onClose, friend, onConfirmed }: SettleUpSheetProps) {
  const [method, setMethod] = useState('upi');

  useEffect(() => {
    if (open) setMethod('upi');
  }, [open]);

  if (!friend) return null;
  const owesYou = friend.net > 0;
  const amt = Math.abs(friend.net);

  const confirm = () => {
    settleFriend(friend.id);
    // Reference's own toast text is a static "Settled up via UPI" for this
    // sheet's one onConfirm wiring, regardless of which method (UPI/Cash)
    // is selected above — kept literal rather than invented.
    showToast('Settled up via UPI');
    onConfirmed?.();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={owesYou ? 'Request settlement' : 'Settle up'}>
      <View style={{ alignItems: 'center', paddingVertical: spacing.s3 + 2 }}>
        <View style={{ width: 56, height: 56, borderRadius: 999, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.s3 }}>
          <AppText weight="bold" style={{ fontSize: 20, color: colors.fgOnDark }}>
            {initials(friend.name)}
          </AppText>
        </View>
        <AppText weight="semibold" style={{ fontSize: 12, color: colors.fg3, letterSpacing: 0.1 }}>
          {owesYou ? `${friend.name} owes you` : `You owe ${friend.name}`}
        </AppText>
        <AppText weight="bold" style={{ fontSize: 34, marginTop: 4, letterSpacing: -0.68, color: owesYou ? colors.income : colors.expense, fontVariant: ['tabular-nums'] }}>
          ₹{amt.toLocaleString('en-IN')}
        </AppText>
      </View>

      <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginBottom: spacing.s2 }}>
        How
      </AppText>
      <View style={{ flexDirection: 'row', gap: spacing.s2, marginBottom: spacing.s4 + 2 }}>
        {METHODS.map(m => {
          const on = method === m.id;
          const Icon = m.icon;
          return (
            <Pressable
              key={m.id}
              onPress={() => setMethod(m.id)}
              style={{ flex: 1, backgroundColor: colors.bgElevated, borderWidth: 1.5, borderColor: on ? colors.navy : colors.borderDefault, borderRadius: radii.cardSm, padding: spacing.s3, gap: 6 }}
            >
              <View style={{ width: 32, height: 32, borderRadius: radii.input, backgroundColor: on ? colors.navy : colors.bgSurface, alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={on ? colors.fgOnDark : colors.navy} />
              </View>
              <AppText weight="semibold" style={{ fontSize: 13 }}>
                {m.title}
              </AppText>
              <AppText style={{ fontSize: 11, color: colors.fg3 }}>{m.sub}</AppText>
            </Pressable>
          );
        })}
      </View>

      <Button variant="primary" full size="lg" icon={owesYou ? PaperPlaneTiltIcon : HandshakeIcon} onPress={confirm}>
        {owesYou ? 'Send request' : 'Mark as settled'}
      </Button>
      <AppText style={{ fontSize: 11, color: colors.fg3, textAlign: 'center', marginTop: spacing.s3 - 2, lineHeight: 15 }}>
        Dhan records the settlement — it never moves money itself.
      </AppText>
    </BottomSheet>
  );
}

export default SettleUpSheet;
