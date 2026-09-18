import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LinkedAccount {
  id: string;
  name: string;
  short: string;
  color: string;
  mask: string;
  type: string;
  last: string;
  balance: number;
  primary?: boolean;
}

const STORAGE_KEY = 'dhan_linked_accounts_v1';

const DEFAULT_ACCOUNTS: LinkedAccount[] = [
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    short: 'HD',
    color: '#004C8F',
    mask: '••4521',
    type: 'Savings',
    last: '2 min ago',
    balance: 124500,
    primary: true,
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    short: 'IC',
    color: '#F37920',
    mask: '••8843',
    type: 'Salary',
    last: '10 min ago',
    balance: 8920,
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    short: 'AX',
    color: '#97144D',
    mask: '••2117',
    type: 'Credit card',
    last: '1 hr ago',
    balance: -32180,
  },
];

type Listener = () => void;
let accounts: LinkedAccount[] = DEFAULT_ACCOUNTS;
let loaded = false;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

export function subscribeLinkedAccounts(l: Listener) {
  listeners.add(l);
  if (!loaded) {
    loadLinkedAccounts();
  }
  return () => {
    listeners.delete(l);
  };
}

export async function loadLinkedAccounts(): Promise<LinkedAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      accounts = JSON.parse(raw);
    }
  } catch {
    // Keep defaults on failure
  } finally {
    loaded = true;
    notify();
  }
  return accounts;
}

export function getLinkedAccounts(): LinkedAccount[] {
  return accounts;
}

export async function togglePrimaryAccount(id: string) {
  accounts = accounts.map(a => ({
    ...a,
    primary: a.id === id,
  }));
  await saveAccounts();
}

export async function removeLinkedAccount(id: string) {
  accounts = accounts.filter(a => a.id !== id);
  if (accounts.length && !accounts.some(a => a.primary)) {
    accounts[0].primary = true;
  }
  await saveAccounts();
}

export async function addLinkedAccount(account: LinkedAccount) {
  accounts = [...accounts, account];
  await saveAccounts();
}

async function saveAccounts() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Save error ignored
  }
  notify();
}
