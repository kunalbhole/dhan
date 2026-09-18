import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BellIcon } from 'phosphor-react-native/lib/module/icons/Bell';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Chip from './Chip';
import Field from './Field';
import IconChip from './IconChip';
import Toggle from './Toggle';
import { colors, spacing } from '../theme';
import { addBill } from '../lib/billsStore';
import { showToast } from '../lib/toast';
import { parseShortDate } from '../lib/dateRange';
import type { Bill } from '../lib/bills';

export interface AddBillSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const REPEATS = ['Monthly', 'Quarterly', 'Yearly', 'One-off'];

// Ported from Dhan App 2/screens-sheets.jsx's AddBillSheet. The reference's
// own onSave just closes the sheet and shows a toast — it never actually
// stores the bill (billsState never changes). This app has a real,
// persisted bills store (src/lib/billsStore.ts), so Add bill really
// inserts it. "Next due date" is still free text (matching the reference,
// which doesn't collect a structured date either), best-effort parsed via
// parseShortDate; anything that doesn't match "26 Apr 2026" falls back to
// 7 days out, same as this form's previous hardcoded `dueIn: 7`. Category
// isn't collected by this form either, so a manually-added bill defaults
// to "other" — matching the generic receipt icon it showed before.
function AddBillSheet({ open, onClose, onSaved }: AddBillSheetProps) {
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [due, setDue] = useState('');
  const [repeat, setRepeat] = useState('Monthly');
  const [remind, setRemind] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName('');
    setAmt('');
    setDue('');
    setRepeat('Monthly');
    setRemind(true);
  }, [open]);

  const parsedAmt = parseFloat(amt);
  const valid = name.trim().length > 0 && parsedAmt > 0 && due.trim().length > 0;

  const save = () => {
    if (!valid) return;
    const bill: Bill = {
      id: `bill-${Date.now()}`,
      name: name.trim(),
      amt: parsedAmt,
      dueDate: parseShortDate(due) ?? Date.now() + 7 * 86400000,
      category: 'other',
      status: 'upcoming',
      source: 'manual',
    };
    addBill(bill);
    showToast('Bill added');
    onSaved?.();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add bill or subscription">
      <Field label="Name" value={name} placeholder="Airtel Fiber" onChangeText={setName} />
      <Field label="Amount" value={amt} prefix="₹" placeholder="0" keyboardType="decimal-pad" onChangeText={v => setAmt(v.replace(/[^\d.]/g, ''))} />
      <Field label="Next due date" value={due} placeholder="26 Apr 2026" onChangeText={setDue} />

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Repeats</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 }}>
        {REPEATS.map(r => (
          <Chip key={r} active={repeat === r} onPress={() => setRepeat(r)}>
            {r}
          </Chip>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.s4,
          paddingVertical: spacing.s4,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.borderSubtle,
          marginBottom: spacing.s4,
        }}
      >
        <IconChip icon={BellIcon} />
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 14, color: colors.fg2 }}>Remind me</AppText>
          <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>3 days before it&apos;s due</AppText>
        </View>
        <Toggle on={remind} onToggle={() => setRemind(v => !v)} />
      </View>

      <View style={{ gap: spacing.s2 }}>
        <Button variant="primary" size="lg" full disabled={!valid} onPress={save}>
          Add bill
        </Button>
        <Button variant="ghost" full onPress={onClose}>
          Cancel
        </Button>
      </View>
    </BottomSheet>
  );
}

export default AddBillSheet;
