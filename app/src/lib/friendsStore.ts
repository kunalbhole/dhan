// A lightweight in-memory store for friends/groups, mirroring
// src/lib/billsStore.ts's subscribe/notify pattern. This app has no real
// contacts integration or peer-to-peer ledger backend — FRIENDS and
// DEFAULT_GROUPS are the reference's own hardcoded sample data
// (screens-split.jsx), same status as SAMPLE_TXNS/UPCOMING_BILLS
// elsewhere. Session-only: nothing here is persisted.

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

let friends: Friend[] = [
  { id: 'rahul', name: 'Rahul Sharma', net: 2000, last: 'Goa trip · Apr 12', phone: '+91 98765 43210', hasPhoto: true },
  { id: 'priya', name: 'Priya Kapoor', net: 1450, last: 'Dinner at Indigo · Apr 18', phone: '+91 99870 12245', hasPhoto: true },
  { id: 'akash', name: 'Akash Mehta', net: -1200, last: 'Concert tickets · Apr 2', phone: '+91 98200 77431' },
  { id: 'sneha', name: 'Sneha Joshi', net: -850, last: 'Grocery run · Apr 10', phone: '+91 90045 66120', hasPhoto: true },
  { id: 'dev', name: 'Dev Anand', net: 0, last: 'Settled up · Apr 20', phone: '+91 98111 20934' },
];

let groups: Group[] = [{ id: 'goa', name: 'Goa trip', icon: 'airplane-takeoff', members: ['rahul', 'priya', 'akash', 'sneha'] }];

// groupId -> expenses added via AddGroupExpenseSheet during this session.
const addedExpenses: Record<string, GroupExpense[]> = {};

type Listener = () => void;
const friendListeners = new Set<Listener>();
const groupListeners = new Set<Listener>();

function notifyFriends() {
  friendListeners.forEach(l => l());
}
function notifyGroups() {
  groupListeners.forEach(l => l());
}

export function getFriends(): Friend[] {
  return friends;
}
export function subscribeToFriends(listener: Listener): () => void {
  friendListeners.add(listener);
  return () => friendListeners.delete(listener);
}
export function getFriend(id: string): Friend | undefined {
  return friends.find(f => f.id === id);
}

// SettleUpSheet's confirm — a plain stored field, so (unlike group
// balances, which are derived from an expense list) zeroing it out is a
// real, simple, correct action. Matches the reference's own semantics
// (Settle marks the balance closed) rather than its no-op wiring
// (app.jsx's onConfirm only shows a toast — this actually clears it).
export function settleFriend(id: string): void {
  friends = friends.map(f => (f.id === id ? { ...f, net: 0, last: 'Settled up · Today' } : f));
  notifyFriends();
}

// SplitSheet's real save — you fronted the expense, so each selected
// friend's net moves further in your favour by their share. The
// reference's own SplitSheet.onSave (app.jsx) only closes the sheet and
// shows a toast; this actually updates the balance, same pattern as
// AddTxnSheet/AddBillSheet elsewhere in this app.
export function adjustFriendNet(id: string, delta: number): void {
  friends = friends.map(f => (f.id === id ? { ...f, net: f.net + delta, last: `Split · Today` } : f));
  notifyFriends();
}

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
}
export function updateGroup(updated: Group): void {
  groups = groups.map(g => (g.id === updated.id ? updated : g));
  notifyGroups();
}
export function removeGroup(id: string): void {
  groups = groups.filter(g => g.id !== id);
  notifyGroups();
}

// Ported verbatim from screens-group.jsx's groupExpenses — 4 deterministic
// sample rows per group, payer rotated across "You" and the group's own
// members so every group's history looks populated.
export function baseGroupExpenses(group: Group): GroupExpense[] {
  const members = group.members.map(id => getFriend(id)).filter((f): f is Friend => !!f);
  const payer = (i: number): { id: string; name: string } => (i % 3 === 0 ? { id: 'you', name: 'You' } : members[i % members.length] || { id: 'you', name: 'You' });
  const rows = [
    { key: 1, m: 'Beach shack dinner', day: 'Sat · Apr 18', d: 'Apr 18', total: 4800, share: -1200, c: 'food', s: 'Dinner · UPI · 9:20 PM' },
    { key: 2, m: 'Scooter rental', day: 'Fri · Apr 17', d: 'Apr 17', total: 2400, share: -600, c: 'transport', s: 'Rental · UPI · 11:05 AM' },
    { key: 3, m: 'Villa booking', day: 'Thu · Apr 16', d: 'Apr 16', total: 12000, share: 3000, c: 'travel', s: 'Stay · HDFC ••4521' },
    { key: 4, m: 'Groceries run', day: 'Thu · Apr 16', d: 'Apr 16', total: 1800, share: -450, c: 'groceries', s: 'Groceries · UPI · 6:40 PM' },
  ];
  return rows.map((r, i) => {
    const by = payer(i);
    const share = by.name === 'You' ? Math.abs(r.share) : -Math.abs(r.share);
    return {
      ...r,
      id: `gx-${group.id}-${r.key}`,
      a: -r.total,
      share,
      paidBy: by,
      split: `${by.name === 'You' ? 'You' : by.name.split(' ')[0]} paid ₹${r.total.toLocaleString('en-IN')}`,
      groupWith: { id: group.id, name: group.name, icon: group.icon, share },
    };
  });
}

export function getGroupExpenses(group: Group): GroupExpense[] {
  return [...(addedExpenses[group.id] ?? []), ...baseGroupExpenses(group)];
}

export function addGroupExpense(groupId: string, expense: GroupExpense): void {
  addedExpenses[groupId] = [expense, ...(addedExpenses[groupId] ?? [])];
  notifyGroups();
}

export interface LedgerMember extends Friend {
  net: number;
}

// Ported verbatim from screens-group.jsx's groupLedger — per-member net
// derived from the group's expenses so the summary, per-member balances
// and history always reconcile with each other.
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
