import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PlusIcon } from 'phosphor-react-native/lib/module/icons/Plus';
import { PlusCircleIcon } from 'phosphor-react-native/lib/module/icons/PlusCircle';
import { PencilSimpleIcon } from 'phosphor-react-native/lib/module/icons/PencilSimple';
import { TargetIcon } from 'phosphor-react-native/lib/module/icons/Target';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import AppText from '../components/AppText';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import EditGoalSheet from '../components/EditGoalSheet';
import { colors, radii, shadows, spacing } from '../theme';
import { GOAL_ICONS } from '../lib/goalIcons';
import type { Goal, GoalIconId } from '../lib/goals';
import { addGoal, deleteGoal, getGoals, subscribeToGoals, updateGoal } from '../lib/goalsStore';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Goals'>;

function GoalsScreen({ navigation }: Props) {
  const [goals, setGoals] = useState<Goal[]>(getGoals());
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const [editing, setEditing] = useState<Goal | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => subscribeToGoals(() => setGoals([...getGoals()])), []);

  const activeGoals = goals.filter(g => g.saved < g.target);
  const completedGoals = goals.filter(g => g.saved >= g.target);

  const displayed = tab === 'active' ? activeGoals : completedGoals;

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
        title="Savings & Goals"
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
        {/* Total Summary Header */}
        <View style={{ backgroundColor: colors.navy, borderRadius: radii.cardLg, padding: spacing.s5, marginBottom: spacing.s4, overflow: 'hidden' }}>
          <AppText weight="bold" style={{ fontSize: 11, color: colors.fgOnDark, opacity: 0.7, letterSpacing: 0.1 }}>
            Saved across all goals &amp; policies
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

        {/* Tab Toggle: Active vs Completed */}
        <View style={{ flexDirection: 'row', gap: spacing.s2, backgroundColor: colors.bgSurface, borderRadius: radii.control, padding: 4, marginBottom: spacing.s4 }}>
          <Pressable
            onPress={() => setTab('active')}
            style={[
              { flex: 1, height: 36, borderRadius: radii.input, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === 'active' ? colors.bgElevated : 'transparent' },
              tab === 'active' ? shadows.card : null,
            ]}
          >
            <AppText weight="semibold" style={{ fontSize: 13, color: tab === 'active' ? colors.navy : colors.fg3 }}>
              Active ({activeGoals.length})
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setTab('completed')}
            style={[
              { flex: 1, height: 36, borderRadius: radii.input, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === 'completed' ? colors.bgElevated : 'transparent' },
              tab === 'completed' ? shadows.card : null,
            ]}
          >
            <AppText weight="semibold" style={{ fontSize: 13, color: tab === 'completed' ? colors.navy : colors.fg3 }}>
              Achieved ({completedGoals.length})
            </AppText>
          </Pressable>
        </View>

        {displayed.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            {tab === 'active' ? <TargetIcon size={40} color={colors.fg3} /> : <CheckCircleIcon size={40} color={colors.income} />}
            <AppText weight="medium" style={{ fontSize: 15, color: colors.fg2, marginTop: spacing.s3, textAlign: 'center' }}>
              {tab === 'active' ? 'No active goals' : 'No completed goals yet'}
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.fg3, marginTop: 6, textAlign: 'center', lineHeight: 19, paddingHorizontal: spacing.s5 }}>
              {tab === 'active'
                ? 'Set a target for an emergency fund, insurance premium, or travel fund.'
                : 'Achieved goals and fully paid policies will appear here.'}
            </AppText>
          </View>
        ) : (
          displayed.map(g => {
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
            New savings goal or policy
          </AppText>
        </Pressable>
      </ScrollView>

      <EditGoalSheet open={sheetOpen} goal={editing} onClose={() => setSheetOpen(false)} onSave={handleSave} onDelete={handleDelete} />
    </SafeAreaView>
  );
}

export default GoalsScreen;
