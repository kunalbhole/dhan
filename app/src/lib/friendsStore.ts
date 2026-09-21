// Real Split data — people and groups. Kept at this file path/API (Friend,
// Group, GroupExpense, getFriends/getFriend/settleFriend/adjustFriendNet/
// getGroups/etc.) so PeerRow, GroupRow, SplitSheet, SettleUpSheet,
// CreateGroupSheet, AddGroupExpenseSheet, FriendDetailScreen and
// GroupDetailScreen didn't need any import changes — only what's behind
// these functions changed, from a hardcoded sample array to real data
// derived from transactions.person_key (see db.ts) plus a real,
// AsyncStorage-persisted split ledger and group list.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPeopleCountSync,
  getPeoplePageSync,
  getPersonAggregateSync,
  getPersonNetSync,
  getPersonNetsSync,
  getSplitTotalsSync,
  insertSplitEntrySync,
  subscribeToPeopleChanged,
  type PersonAggregate,
} from './db';
import { formatRelativeTime } from './format';

export interface Friend {
  id: string;
  name: string;
  net: number;
  last: string;
  phone: string;
  hasPhoto?: boolean;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  members: string[];
}

export interface GroupExpense {
  id: string;
  m: string;
  day: string;
  d: string;
  total: number;
  share: number;
  c: string;
  s: string;
  a: number;
  paidBy: { id: string; name: string };
  split: string;
  groupWith: { id: string; name: string; icon: string; share: number };
}

function lastLabel(agg: PersonAggregate): string {
  const direction = agg.lastAmount >= 0 ? '+' : '−';
  return `₹${Math.abs(agg.lastAmount).toLocaleString('en-IN')} ${direction === '+' ? 'received' : 'paid'} · ${formatRelativeTime(agg.lastTimestamp)}`;
}

function toFriend(agg: PersonAggregate, net: number): Friend {
  return {
    id: agg.personKey,
    name: agg.displayName,
    net,
    last: lastLabel(agg),
    phone: '',
  };
}

// Bounded flat list for the member-picker UIs (SplitSheet "who's in",
// CreateGroupSheet "Add members") — those already scroll inside a
// fixed-height sheet, so a large-but-bounded fetch is the right shape
// there; the Split screen's own list uses getPeoplePage below instead,
// which is genuinely incremental.
const PICKER_LIMIT = 200;

export function getFriends(): Friend[] {
  const aggregates = getPeoplePageSync(PICKER_LIMIT, 0);
  const nets = getPersonNetsSync(aggregates.map(a => a.personKey));
  return aggregates.map(a => toFriend(a, nets[a.personKey] ?? 0));
}

export function getPeoplePage(page: number, pageSize: number): { people: Friend[]; total: number } {
  const aggregates = getPeoplePageSync(pageSize, page * pageSize);
  const nets = getPersonNetsSync(aggregates.map(a => a.personKey));
  return { people: aggregates.map(a => toFriend(a, nets[a.personKey] ?? 0)), total: getPeopleCountSync() };
}

export function getSplitTotals(): { get: number; pay: number } {
  return getSplitTotalsSync();
}

export function getFriend(id: string): Friend | undefined {
  const agg = getPersonAggregateSync(id);
  if (!agg) return undefined;
  return toFriend(agg, getPersonNetSync(id));
}

type Listener = () => void;
const friendListeners = new Set<Listener>();
export function subscribeToFriends(listener: Listener): () => void {
  friendListeners.add(listener);
  // db.ts's people/transactions change events are what actually drive
  // this data now — relayed straight through as a "friends changed" event.
  const unsub = subscribeToPeopleChanged(listener);
  return () => {
    friendListeners.delete(listener);
    unsub();
  };
}

// Both Settle (SettleUpSheet) and Collect use this — either direction, a
// settlement is just "bring the running balance to zero," recorded as a
// real entry rather than a mutated field (see db.ts's split_entries
// comment for why).
export function settleFriend(id: string): void {
  const net = getPersonNetSync(id);
  if (net === 0) return;
  insertSplitEntrySync({ personKey: id, kind: 'settlement', amount: -net, note: 'Settled up' });
}

// SplitSheet's real save — you fronted the expense, so each selected
// person's net moves further in your favour by their share.
export function adjustFriendNet(id: string, delta: number, transactionId?: number | null): void {
  insertSplitEntrySync({ personKey: id, kind: 'split', amount: delta, transactionId: transactionId ?? null });
}

// ---------------------------------------------------------------------
// Groups — manually created (never inferred from SMS), so a simple
// AsyncStorage JSON blob is the right amount of persistence for them,
// same pattern as billsStore.ts. Starts empty: no seeded "Goa trip".
// ---------------------------------------------------------------------

const GROUPS_KEY = 'dhan-groups';
const EXPENSES_KEY = 'dhan-group-expenses';

let groups: Group[] = [];
let addedExpenses: Record<string, GroupExpense[]> = {};
let hydrated = false;
let hydrating: Promise<void> | null = null;

const groupListeners = new Set<Listener>();
function notifyGroups() {
  groupListeners.forEach(l => l());
}

async function persistGroups(): Promise<void> {
  await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}
async function persistExpenses(): Promise<void> {
  await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(addedExpenses));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = Promise.all([AsyncStorage.getItem(GROUPS_KEY), AsyncStorage.getItem(EXPENSES_KEY)]).then(
      ([rawGroups, rawExpenses]) => {
        if (rawGroups) {
          try {
            groups = JSON.parse(rawGroups);
          } catch {
            groups = [];
          }
        }
        if (rawExpenses) {
          try {
            addedExpenses = JSON.parse(rawExpenses);
          } catch {
            addedExpenses = {};
          }
        }
        hydrated = true;
        notifyGroups();
      },
    );
  }
  return hydrating;
}
hydrate();

export function getGroups(): Group[] {
  return groups;
}
export function subscribeToGroups(listener: Listener): () => void {
  groupListeners.add(listener);
  return () => groupListeners.delete(listener);
}
export function getGroup(id: string): Group | undefined {
  return groups.find(g => g.id === id);
}

export function addGroup(group: Group): void {
  groups = [...groups, group];
  notifyGroups();
  persistGroups();
}
export function updateGroup(updated: Group): void {
  groups = groups.map(g => (g.id === updated.id ? updated : g));
  notifyGroups();
  persistGroups();
}
export function removeGroup(id: string): void {
  groups = groups.filter(g => g.id !== id);
  delete addedExpenses[id];
  notifyGroups();
  persistGroups();
  persistExpenses();
}

// No synthetic sample rows anymore — a new group's history is genuinely
// empty until you add a real expense to it.
export function baseGroupExpenses(_group: Group): GroupExpense[] {
  return [];
}

export function getGroupExpenses(group: Group): GroupExpense[] {
  return [...(addedExpenses[group.id] ?? []), ...baseGroupExpenses(group)];
}

export function addGroupExpense(groupId: string, expense: GroupExpense): void {
  addedExpenses[groupId] = [expense, ...(addedExpenses[groupId] ?? [])];
  notifyGroups();
  persistExpenses();
}

export interface LedgerMember extends Friend {
  net: number;
}

export function groupLedger(group: Group, expenses?: GroupExpense[]): LedgerMember[] {
  const members = group.members.map(id => getFriend(id)).filter((f): f is Friend => !!f);
  if (!members.length) return [];
  const rows = expenses ?? getGroupExpenses(group);
  const nets: Record<string, number> = {};
  members.forEach(m => {
    nets[m.id] = 0;
  });
  rows.forEach(x => {
    if (x.share > 0) {
      const each = x.share / members.length;
      members.forEach(m => {
        nets[m.id] += each;
      });
    } else if (x.share < 0) {
      const payerId = nets[x.paidBy.id] !== undefined ? x.paidBy.id : members[0].id;
      nets[payerId] += x.share;
    }
  });
  const out = members.map(m => ({ ...m, net: Math.round(nets[m.id]) }));
  const exact = Math.round(rows.reduce((s, x) => s + x.share, 0));
  const drift = exact - out.reduce((s, m) => s + m.net, 0);
  if (drift && out.length) out[0].net += drift;
  return out;
}
