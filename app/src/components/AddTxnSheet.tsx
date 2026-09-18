import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Chip from './Chip';
import Field from './Field';
import { colors, radii, spacing } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { insertTransaction } from '../lib/db';
import { showToast } from '../lib/toast';

export interface AddTxnInitial {
  kind?: 'expense' | 'income';
  cat?: string;
}

export interface AddTxnSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initial?: AddTxnInitial;
}

// Ported from Dhan App 2/screens-sheets.jsx's AddTxnSheet. The reference's
// own onSave only closes the sheet and shows a toast — it never actually
// stores the transaction anywhere (SAMPLE_TXNS never changes). This app
// has a real SQLite store (src/lib/db.ts), so "Add expense"/"Add income"
// really inserts a row here instead of just miming the action.
const CAT_IDS = Object.keys(CATEGORIES).filter(c => !['income', 'forex-fee'].includes(c));

function AddTxnSheet({ open, onClose, onSaved, initial = {} }: AddTxnSheetProps) {
  const [kind, setKind] = useState<'expense' | 'income'>('expense');
  const [amt, setAmt] = useState('');
  const [merchant, setMerchant] = useState('');
  const [cat, setCat] = useState('food');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKind(initial.kind || 'expense');
    setAmt('');
    setMerchant('');
    setNote('');
    setCat(initial.cat || (initial.kind === 'income' ? 'income' : 'food'));
    // Only `open` should re-run this — `initial` is a fresh object every
    // render, so including it would reset the form on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const parsedAmt = parseFloat(amt);
  const valid = parsedAmt > 0 && merchant.trim().length > 0;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    const category = kind === 'income' ? 'income' : cat;
    await insertTransaction(
      {
        id: null,
        m: merchant.trim(),
        s: note.trim() || (kind === 'income' ? 'Income · Manual entry' : 'Manual entry'),
        a: kind === 'income' ? parsedAmt : -parsedAmt,
        c: category,
        isForeignTransaction: false,
        originalCurrency: null,
        originalAmount: null,
        inrAmount: null,
        categoryLocked: false,
      },
      null,
      Date.now(),
    );
    setSaving(false);
    showToast(kind === 'income' ? 'Income added' : 'Expense added');
    onSaved?.();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add transaction">
      <View style={{ flexDirection: 'row', gap: spacing.s2, marginBottom: spacing.s4 }}>
        {(['expense', 'income'] as const).map(k => (
          <View key={k} style={{ flex: 1 }}>
            <Chip
              active={kind === k}
              onPress={() => {
                setKind(k);
                setCat(k === 'income' ? 'income' : 'food');
              }}
            >
              {k === 'expense' ? 'Expense' : 'Income'}
            </Chip>
          </View>
        ))}
      </View>

      <Field label="Amount" value={amt} prefix="₹" placeholder="0" keyboardType="decimal-pad" onChangeText={v => setAmt(v.replace(/[^\d.]/g, ''))} />
      <Field label={kind === 'income' ? 'Source' : 'Merchant'} value={merchant} placeholder={kind === 'income' ? 'Acme Co' : 'Swiggy'} onChangeText={setMerchant} />

      {kind === 'expense' ? (
        <>
          <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Category</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 }}>
            {CAT_IDS.map(id => {
              const c = CATEGORIES[id];
              const Icon = CATEGORY_ICONS[id];
              const on = cat === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setCat(id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: spacing.s2,
                    paddingHorizontal: spacing.s3,
                    borderRadius: radii.pill,
                    borderWidth: 1,
                    borderColor: on ? colors.navy : colors.borderSubtle,
                    backgroundColor: on ? colors.navy : 'transparent',
                  }}
                >
                  <Icon size={14} color={on ? colors.fgOnDark : colors.fg2} />
                  <AppText weight="medium" style={{ fontSize: 12.5, color: on ? colors.fgOnDark : colors.fg2 }}>
                    {c.name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <Field label="Note (optional)" value={note} placeholder="What was this for?" onChangeText={setNote} />

      <View style={{ gap: spacing.s2, marginTop: spacing.s2 }}>
        <Button variant="primary" size="lg" full disabled={!valid || saving} onPress={save}>
          {kind === 'income' ? 'Add income' : 'Add expense'}
        </Button>
        <Button variant="ghost" full onPress={onClose}>
          Cancel
        </Button>
      </View>
    </BottomSheet>
  );
}

export default AddTxnSheet;
