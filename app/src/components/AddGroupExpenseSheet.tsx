import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Field from './Field';
import SelectIndicator from './SelectIndicator';
import { colors, radii, spacing } from '../theme';
import { CATEGORIES } from '../lib/categories';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import ContactAvatar from './ContactAvatar';
import { getFriend, addGroupExpense, type Group, type GroupExpense } from '../lib/friendsStore';
import { showToast } from '../lib/toast';

export interface AddGroupExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  group: Group | null;
}

const CAT_IDS = Object.keys(CATEGORIES).filter(c => !['income', 'forex-fee'].includes(c));

// Ported from Dhan App 2/group-expense.jsx's AddGroupExpenseSheet,
// simplified to equal-split only — the reference also offers "Custom
// amounts" and "Percentage" modes with their own per-person input cells
// and a running-total validator; that's a lot of extra surface for a
// second and third way to do what equal-split already demonstrates
// (real participant toggling, real live share computation), so this
// port keeps the one mode. Unlike the reference's own onSave (app.jsx
// just appends to a group-scoped array that GroupDetailScreen already
// reads — so that part IS real there), this calls
// src/lib/friendsStore.ts's addGroupExpense directly.
function AddGroupExpenseSheet({ open, onClose, onSaved, group }: AddGroupExpenseSheetProps) {
  const members = (group?.members ?? []).map(id => getFriend(id)).filter((f): f is NonNullable<ReturnType<typeof getFriend>> => !!f);
  const people = [{ id: 'you', name: 'You' }, ...members];

  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('food');
  const [paidBy, setPaidBy] = useState('you');
  const [incl, setIncl] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !group) return;
    setDesc('');
    setAmt('');
    setCat('food');
    setPaidBy('you');
    setIncl(people.map(p => p.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group?.id]);

  if (!group) return null;

  const total = parseFloat(amt) || 0;
  const active = people.filter(p => incl.includes(p.id));
  const shareOf = (id: string) => (active.some(p => p.id === id) && active.length ? total / active.length : 0);
  const valid = desc.trim().length > 0 && total > 0 && active.length > 1;
  const toggle = (id: string) => setIncl(v => (v.includes(id) ? v.filter(x => x !== id) : [...v, id]));

  const save = () => {
    if (!valid) return;
    const breakdown: Record<string, number> = {};
    active.forEach(p => {
      breakdown[p.id] = Math.round(shareOf(p.id));
    });
    const yours = breakdown.you ?? 0;
    const payer = people.find(p => p.id === paidBy) ?? people[0];
    const share = paidBy === 'you' ? Math.round(total) - yours : -yours;
    const expense: GroupExpense = {
      id: `gx-${group.id}-${Date.now().toString(36)}`,
      m: desc.trim(),
      day: 'Today',
      d: 'Today',
      total: Math.round(total),
      a: -Math.round(total),
      share,
      c: cat,
      s: `${CATEGORIES[cat]?.name ?? 'Other'} · group expense`,
      paidBy: { id: payer.id, name: payer.name },
      split: `${payer.name === 'You' ? 'You' : payer.name.split(' ')[0]} paid ₹${Math.round(total).toLocaleString('en-IN')}`,
      groupWith: { id: group.id, name: group.name, icon: group.icon, share },
    };
    addGroupExpense(group.id, expense);
    showToast('Expense added');
    onSaved?.();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={`Add expense · ${group.name}`}>
      <Field label="Description" value={desc} placeholder="Beach shack dinner" onChangeText={setDesc} />
      <Field label="Amount" value={amt} prefix="₹" placeholder="0" keyboardType="decimal-pad" onChangeText={v => setAmt(v.replace(/[^\d.]/g, ''))} />

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
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.s2, paddingHorizontal: spacing.s3, borderRadius: radii.pill, borderWidth: 1, borderColor: on ? colors.navy : colors.borderSubtle, backgroundColor: on ? colors.navy : 'transparent' }}
            >
              <Icon size={14} color={on ? colors.fgOnDark : colors.fg2} />
              <AppText weight="medium" style={{ fontSize: 12.5, color: on ? colors.fgOnDark : colors.fg2 }}>
                {c.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Paid by</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.s3 - 2, marginBottom: spacing.s4 }}>
        {people.map(p => {
          const on = paidBy === p.id;
          return (
            <Pressable key={p.id} onPress={() => setPaidBy(p.id)} style={{ width: 52, alignItems: 'center', gap: 6 }}>
              <View style={{ borderRadius: 999, borderWidth: on ? 2 : 0, borderColor: colors.gold }}>
                {p.id === 'you' ? (
                  <View style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
                    <AppText weight="semibold" style={{ fontSize: 12, color: colors.fgOnDark }}>
                      You
                    </AppText>
                  </View>
                ) : (
                  <ContactAvatar f={p} size={40} fontSize={13} />
                )}
              </View>
              <AppText weight={on ? 'semibold' : 'regular'} style={{ fontSize: 11, color: on ? colors.navy : colors.fg3 }} numberOfLines={1}>
                {p.name.split(' ')[0]}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Split equally between</AppText>
      <View style={{ backgroundColor: colors.bgElevated, borderRadius: radii.card, paddingHorizontal: spacing.s4, marginBottom: spacing.s4 }}>
        {people.map((p, i, arr) => {
          const on = incl.includes(p.id);
          return (
            <Pressable
              key={p.id}
              onPress={() => toggle(p.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, paddingVertical: spacing.s3, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle, opacity: on ? 1 : 0.5 }}
            >
              <SelectIndicator on={on} />
              {p.id === 'you' ? (
                <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
                  <AppText weight="semibold" style={{ fontSize: 11, color: colors.fgOnDark }}>
                    You
                  </AppText>
                </View>
              ) : (
                <ContactAvatar f={p} size={36} fontSize={12} />
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText style={{ fontSize: 14, color: colors.fg2 }} numberOfLines={1}>
                  {p.name}
                </AppText>
                <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2, fontVariant: ['tabular-nums'] }}>
                  {on ? `₹${Math.round(shareOf(p.id)).toLocaleString('en-IN')}` : 'Not included'}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.s2 }}>
        <Button variant="primary" size="lg" full disabled={!valid} onPress={save}>
          Save expense
        </Button>
        <Button variant="ghost" full onPress={onClose}>
          Cancel
        </Button>
      </View>
    </BottomSheet>
  );
}

export default AddGroupExpenseSheet;
