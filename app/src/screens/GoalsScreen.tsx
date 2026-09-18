import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PlusIcon } from 'phosphor-react-native/lib/module/icons/Plus';
import { PlusCircleIcon } from 'phosphor-react-native/lib/module/icons/PlusCircle';
import { PencilSimpleIcon } from 'phosphor-react-native/lib/module/icons/PencilSimple';
import { TargetIcon } from 'phosphor-react-native/lib/module/icons/Target';
import AppText from '../components/AppText';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import EditGoalSheet from '../components/EditGoalSheet';
import { colors, radii, spacing } from '../theme';
import { GOAL_ICONS } from '../lib/goalIcons';
import type { Goal, GoalIconId } from '../lib/goals';
import { addGoal, deleteGoal, getGoals, subscribeToGoals, updateGoal } from '../lib/goalsStore';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Goals'>;

function GoalsScreen({ navigation }: Props) {
  const [goals, setGoals] = useState<Goal[]>(getGoals());
  const [editing, setEditing] = useState<Goal | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => subscribeToGoals(() => setGoals([...getGoals()])), []);

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (g: Goal) => {
    setEditing(g);
    setSheetOpen(true);
  };

  const handleSave = (g: Goal) => {
    if (editing) {
      updateGoal(g);
      showToast('Goal updated');
    } else {
      addGoal(g);
      showToast('Goal created');
    }
    setSheetOpen(false);
  };
  const handleDelete = (id: string) => {
    deleteGoal(id);
    setSheetOpen(false);
    showToast('Goal deleted');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Savings goals"
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            accessibilityLabel="New goal"
            onPress={openCreate}
            style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}
          >
            <PlusIcon size={18} color={colors.fgOnDark} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        <View style={{ backgroundColor: colors.navy, borderRadius: radii.cardLg, padding: spacing.s5, marginBottom: spacing.s4, overflow: 'hidden' }}>
          <AppText weight="bold" style={{ fontSize: 11, color: colors.fgOnDark, opacity: 0.7, letterSpacing: 0.1 }}>
            Saved across all goals
          </AppText>
          <AppText weight="bold" style={{ fontSize: 30, color: colors.fgOnDark, marginTop: 4, fontVariant: ['tabular-nums'] }}>
            ₹{totalSaved.toLocaleString('en-IN')}
          </AppText>
          <AppText style={{ fontSize: 12, color: colors.fgOnDark, opacity: 0.7, marginTop: 4 }}>
            of ₹{totalTarget.toLocaleString('en-IN')} target · {totalPct}% there
          </AppText>
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,.18)', borderRadius: radii.pill, marginTop: spacing.s3 + 2, overflow: 'hidden' }}>
            <View style={{ width: `${Math.min(100, totalPct)}%`, height: '100%', backgroundColor: colors.gold, borderRadius: radii.pill }} />
          </View>
        </View>

        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
          Active · {goals.length}
        </AppText>

        {goals.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <TargetIcon size={40} color={colors.fg3} />
            <AppText weight="medium" style={{ fontSize: 15, color: colors.fg2, marginTop: spacing.s3, textAlign: 'center' }}>
              No goals yet
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.fg3, marginTop: 6, textAlign: 'center', lineHeight: 19, paddingHorizontal: spacing.s5 }}>
              Set a target for something you're saving toward — an emergency fund, a trip, anything.
            </AppText>
          </View>
        ) : (
          goals.map(g => {
            const Icon = GOAL_ICONS[g.icon as GoalIconId] ?? GOAL_ICONS.target;
            const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
            return (
              <Card key={g.id} style={{ padding: spacing.s3 + 2, marginBottom: spacing.s3 - 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, marginBottom: spacing.s3 - 2 }}>
                  <View style={{ width: 44, height: 44, borderRadius: radii.control, backgroundColor: `${g.color}1A`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color={g.color} weight="fill" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText weight="semibold" style={{ fontSize: 14 }}>
                      {g.name}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: 2 }}>
                      ETA {g.eta || '—'} · ₹{g.contrib.toLocaleString('en-IN')}/mo
                    </AppText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s2 }}>
                    <AppText weight="semibold" style={{ fontSize: 13, fontVariant: ['tabular-nums'] }}>
                      {Math.round(pct)}%
                    </AppText>
                    <Pressable
                      accessibilityLabel={`Edit ${g.name}`}
                      onPress={() => openEdit(g)}
                      style={{ width: 28, height: 28, borderRadius: radii.input, backgroundColor: colors.bgSurface, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <PencilSimpleIcon size={14} color={colors.navy} />
                    </Pressable>
                  </View>
                </View>
                <View style={{ height: 8, backgroundColor: colors.bgSurface, borderRadius: radii.pill, overflow: 'hidden', marginBottom: spacing.s2 }}>
                  <View style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: g.color, borderRadius: radii.pill }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText weight="semibold" style={{ fontSize: 11, color: colors.fg2, fontVariant: ['tabular-nums'] }}>
                    ₹{g.saved.toLocaleString('en-IN')}
                  </AppText>
                  <AppText weight="semibold" style={{ fontSize: 11, color: colors.fg3, fontVariant: ['tabular-nums'] }}>
                    of ₹{g.target.toLocaleString('en-IN')}
                  </AppText>
                </View>
              </Card>
            );
          })
        )}

        <Pressable
          onPress={openCreate}
          style={{
            width: '100%',
            marginTop: spacing.s2,
            paddingVertical: spacing.s4,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.borderStrong,
            borderRadius: radii.cardSm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <PlusCircleIcon size={18} color={colors.fg2} />
          <AppText weight="semibold" style={{ fontSize: 13, color: colors.fg2 }}>
            New savings goal
          </AppText>
        </Pressable>
      </ScrollView>

      <EditGoalSheet open={sheetOpen} goal={editing} onClose={() => setSheetOpen(false)} onSave={handleSave} onDelete={handleDelete} />
    </SafeAreaView>
  );
}

export default GoalsScreen;
