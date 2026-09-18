import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Field from './Field';
import { colors, radii, spacing } from '../theme';
import { GOAL_COLORS, GOAL_ICON_IDS, type Goal } from '../lib/goals';
import { GOAL_ICONS } from '../lib/goalIcons';

export interface EditGoalSheetProps {
  open: boolean;
  goal: Goal | null; // null = creating a new goal
  onClose: () => void;
  onSave: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

function blankGoal(): Goal {
  return { id: `goal-${Date.now()}`, name: '', icon: 'target', color: GOAL_COLORS[0], saved: 0, target: 0, eta: '', contrib: 0 };
}

// Ported from screens-extra-detail.jsx's EditGoalSheet — reused for both
// creating and editing, same as the reference, except the reference never
// actually wires up "create" (its own header "+" and "+ New savings goal"
// buttons have no onClick). Since this app has a real persisted goals
// store instead of 4 hardcoded sample goals, creating a goal for real is
// necessary here — see GoalsScreen's onPress handlers.
function EditGoalSheet({ open, goal, onClose, onSave, onDelete }: EditGoalSheetProps) {
  const [draft, setDraft] = useState<Goal>(() => goal ?? blankGoal());
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(goal ?? blankGoal());
    setConfirmDelete(false);
  }, [open, goal]);

  const set = <K extends keyof Goal>(key: K, value: Goal[K]) => setDraft(d => ({ ...d, [key]: value }));
  const toInt = (text: string) => parseInt(text.replace(/[^\d]/g, '') || '0', 10);

  const valid = draft.name.trim().length > 0 && draft.target > 0;

  return (
    <BottomSheet open={open} onClose={onClose} title={goal ? 'Edit goal' : 'New savings goal'}>
      <Field label="Goal name" value={draft.name} placeholder="Emergency fund" onChangeText={v => set('name', v)} />

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Icon</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 }}>
        {GOAL_ICON_IDS.map(id => {
          const Icon = GOAL_ICONS[id];
          const active = draft.icon === id;
          return (
            <Pressable
              key={id}
              accessibilityLabel={id}
              onPress={() => set('icon', id)}
              style={{
                width: 40,
                height: 40,
                borderRadius: radii.input,
                backgroundColor: active ? `${draft.color}1A` : colors.bgSurface,
                borderWidth: 1,
                borderColor: active ? draft.color : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={18} color={active ? draft.color : colors.fg3} weight="fill" />
            </Pressable>
          );
        })}
      </View>

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Colour</AppText>
      <View style={{ flexDirection: 'row', gap: spacing.s2, marginBottom: spacing.s5 }}>
        {GOAL_COLORS.map(c => (
          <Pressable
            key={c}
            accessibilityLabel={`Colour ${c}`}
            onPress={() => set('color', c)}
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.pill,
              backgroundColor: c,
              borderWidth: 2,
              borderColor: draft.color === c ? colors.navy : 'transparent',
            }}
          />
        ))}
      </View>

      <Field label="Target amount" prefix="₹" value={String(draft.target || '')} placeholder="0" keyboardType="number-pad" onChangeText={v => set('target', toInt(v))} />
      <Field
        label="Monthly contribution"
        prefix="₹"
        value={String(draft.contrib || '')}
        placeholder="0"
        keyboardType="number-pad"
        onChangeText={v => set('contrib', toInt(v))}
        right={
          <AppText weight="semibold" style={{ color: colors.fg2 }}>
            /mo
          </AppText>
        }
      />
      <Field label="Target date (ETA)" value={draft.eta} placeholder="Sep 2026" onChangeText={v => set('eta', v)} />

      <View style={{ gap: spacing.s2, marginTop: spacing.s2 }}>
        <Button variant="primary" size="lg" full disabled={!valid} onPress={() => onSave(draft)}>
          {goal ? 'Save changes' : 'Create goal'}
        </Button>
        {goal ? (
          confirmDelete ? (
            <View style={{ backgroundColor: colors.expenseBg, borderRadius: radii.control, padding: spacing.s4 }}>
              <AppText style={{ fontSize: 13, color: colors.navy, marginBottom: spacing.s3 }}>
                Delete “{draft.name}”? Saved progress stays in your account, but the goal is removed.
              </AppText>
              <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
                <View style={{ flex: 1 }}>
                  <Button variant="outline" full onPress={() => setConfirmDelete(false)}>
                    Keep goal
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button variant="destructive" full onPress={() => onDelete(draft.id)}>
                    Delete goal
                  </Button>
                </View>
              </View>
            </View>
          ) : (
            <Button variant="destructive" full icon={TrashIcon} onPress={() => setConfirmDelete(true)}>
              Delete goal
            </Button>
          )
        ) : (
          <Button variant="ghost" full onPress={onClose}>
            Cancel
          </Button>
        )}
      </View>
    </BottomSheet>
  );
}

export default EditGoalSheet;
