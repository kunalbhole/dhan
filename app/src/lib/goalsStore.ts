// AsyncStorage-persisted goals store — same subscribe/notify + hydrate
// shape as billsStore.ts. Unlike bills, there's no detection step: goals
// start empty on a fresh install and only ever change via the user's own
// add/edit/delete actions in EditGoalSheet.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Goal } from './goals';

const STORAGE_KEY = 'dhan-goals';

let goals: Goal[] = [];
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          goals = JSON.parse(raw);
        } catch {
          goals = [];
        }
      }
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getGoals(): Goal[] {
  return goals;
}

export function subscribeToGoals(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addGoal(goal: Goal): void {
  goals = [goal, ...goals];
  notify();
  persist();
}

export function updateGoal(goal: Goal): void {
  goals = goals.map(g => (g.id === goal.id ? goal : g));
  notify();
  persist();
}

export function deleteGoal(id: string): void {
  goals = goals.filter(g => g.id !== id);
  notify();
  persist();
}
