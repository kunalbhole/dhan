import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-plan-details-v2';

export interface PlanDetails {
  isPlus: boolean;
  trialActivatedAt: number | null;
  trialExpiresAt: number | null;
  mandateActive: boolean;
  mandateBank: string | null;
  planType: 'monthly' | 'annual';
  monthlyAmount: number;
}

const DEFAULT_PLAN: PlanDetails = {
  isPlus: true, // Default active for testing as requested
  trialActivatedAt: Date.now(),
  trialExpiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 3 months
  mandateActive: true,
  mandateBank: 'HDFC Bank (UPI Auto-Mandate)',
  planType: 'monthly',
  monthlyAmount: 199,
};

let currentPlan: PlanDetails = { ...DEFAULT_PLAN };
let hydrated = false;
let hydrating: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentPlan));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          currentPlan = { ...DEFAULT_PLAN, ...JSON.parse(raw) };
        } catch {
          currentPlan = { ...DEFAULT_PLAN };
        }
      }
      hydrated = true;
      notify();
    });
  }
  return hydrating;
}
hydrate();

export function getPlanDetails(): PlanDetails {
  return currentPlan;
}

export function getIsPlus(): boolean {
  return currentPlan.isPlus;
}

export function subscribeToPlan(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setIsPlus(value: boolean): void {
  currentPlan = { ...currentPlan, isPlus: value };
  notify();
  persist();
}

export function activateTrial(
  bankName: string,
  planType: 'monthly' | 'annual' = 'monthly',
): PlanDetails {
  const now = Date.now();
  const threeMonths = 90 * 24 * 60 * 60 * 1000;
  currentPlan = {
    isPlus: true,
    trialActivatedAt: now,
    trialExpiresAt: now + threeMonths,
    mandateActive: true,
    mandateBank: bankName,
    planType,
    monthlyAmount: planType === 'monthly' ? 199 : 150,
  };
  notify();
  persist();
  return currentPlan;
}

export function cancelSubscription(): void {
  currentPlan = {
    ...currentPlan,
    isPlus: false,
    mandateActive: false,
  };
  notify();
  persist();
}
