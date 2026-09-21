// Real SQLite storage for SMS-detected transactions, using @op-engineering/op-sqlite.
import { open, DB } from '@op-engineering/op-sqlite';
import { normalizeSenderId, normalizeSmsText, type TxnType } from './smsParser';

export interface StoredTransaction {
  id: number;
  dedupKey: string;
  sender: string | null;
  merchant: string | null;
  subtitle: string;
  body: string;
  amount: number;
  category: string;
  isForeignTransaction: boolean;
  originalCurrency: string | null;
  originalAmount: number | null;
  inrAmount: number | null;
  categoryLocked: boolean;
  timestamp: number;
  createdAt: number;
  // Added for the real Split feature (people are grouped by personKey,
  // which is only set when counterpartyType === 'person' — see
  // smsParser.ts's classifyCounterparty).
  refNo: string | null;
  counterpartyType: 'person' | 'merchant' | null;
  personKey: string | null;
  // Added for the dedup/merge rework — see smsParser.ts's TxnType and
  // db.ts's findMergeCandidate/findTransferMatch.
  type: TxnType;
  smsId: number | null;
  payeeRaw: string | null;
  payeeKind: 'name' | 'upi_id' | null;
  cardLast4: string | null;
}

export type InsertResult =
  | { status: 'inserted'; transaction: StoredTransaction }
  | { status: 'duplicate'; transaction: StoredTransaction };

// A payment showing up in two SMS (bank + UPI app, or a pay-later
// confirmation + the bank debit for it) for the same real event counts as
// one duplicate only when they're genuinely close in time — this bounds
// both the merchant+amount fallback merge and the self-transfer pairing
// below, matching Stage 2 items 4 and 5's "within 10 minutes" rule.
const MERGE_WINDOW_MS = 10 * 60 * 1000;

let dbInstance: DB | null = null;

function columnExists(database: DB, table: string, column: string): boolean {
  const res = database.executeSync(`PRAGMA table_info(${table});`);
  if (!res.rows) return false;
  return res.rows.some((r: Record<string, unknown>) => String(r.name) === column);
}

export function getDatabase(): DB {
  if (!dbInstance) {
    dbInstance = open({ name: 'dhan.db' });
    dbInstance.executeSync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dedup_key TEXT UNIQUE NOT NULL,
        sender TEXT,
        merchant TEXT,
        subtitle TEXT NOT NULL,
        body TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        is_foreign INTEGER NOT NULL DEFAULT 0,
        original_currency TEXT,
        original_amount REAL,
        inr_amount REAL,
        category_locked INTEGER NOT NULL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Schema migration for people/Split — CREATE TABLE IF NOT EXISTS only
    // helps on a genuinely fresh install; anyone upgrading from before this
    // feature already has a `transactions` table without these columns, so
    // each one is added individually, guarded by a PRAGMA table_info check
    // (SQLite has no "ADD COLUMN IF NOT EXISTS").
    if (!columnExists(dbInstance, 'transactions', 'ref_no')) {
      dbInstance.executeSync('ALTER TABLE transactions ADD COLUMN ref_no TEXT;');
    }
    if (!columnExists(dbInstance, 'transactions', 'counterparty_type')) {
      dbInstance.executeSync('ALTER TABLE transactions ADD COLUMN counterparty_type TEXT;');
    }
    if (!columnExists(dbInstance, 'transactions', 'person_key')) {
      dbInstance.executeSync('ALTER TABLE transactions ADD COLUMN person_key TEXT;');
    }
    // Dedup/merge rework columns (Stage 2): a duplicate-safe id from the
    // Android SMS provider where available, the payment "type" (separate
    // from `category`, which stays untouched), and the raw Kotak UPI payee
    // field (extra rule F).
    if (!columnExists(dbInstance, 'transactions', 'sms_id')) {
      dbInstance.executeSync('ALTER TABLE transactions ADD COLUMN sms_id INTEGER;');
    }
    if (!columnExists(dbInstance, 'transactions', 'type')) {
      dbInstance.executeSync("ALTER TABLE transactions ADD COLUMN type TEXT NOT NULL DEFAULT 'expense';");
    }
    if (!columnExists(dbInstance, 'transactions', 'payee_raw')) {
      dbInstance.executeSync('ALTER TABLE transactions ADD COLUMN payee_raw TEXT;');
    }
    if (!columnExists(dbInstance, 'transactions', 'payee_kind')) {
      dbInstance.executeSync('ALTER TABLE transactions ADD COLUMN payee_kind TEXT;');
    }
    if (!columnExists(dbInstance, 'transactions', 'card_last4')) {
      dbInstance.executeSync('ALTER TABLE transactions ADD COLUMN card_last4 TEXT;');
    }
    dbInstance.executeSync(
      'CREATE INDEX IF NOT EXISTS idx_transactions_person_key ON transactions(person_key);',
    );
    dbInstance.executeSync(
      'CREATE INDEX IF NOT EXISTS idx_transactions_ref_no ON transactions(ref_no);',
    );
    dbInstance.executeSync(
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);',
    );

    // One row per distinct person_key — holds the contact-match / manual
    // "not a person" decision, so it's remembered instead of re-asked every
    // scan. Absence of a row (or is_person = NULL) means "not reviewed yet".
    dbInstance.executeSync(`
      CREATE TABLE IF NOT EXISTS people (
        person_key TEXT PRIMARY KEY,
        display_name TEXT,
        contact_id TEXT,
        contact_name TEXT,
        is_person INTEGER,
        match_status TEXT NOT NULL DEFAULT 'unmatched',
        updated_at INTEGER NOT NULL
      );
    `);

    // The real balance ledger. A person's net is just SUM(amount) over
    // their rows here — "split" entries come from SplitSheet (this app
    // fronted the expense, so positive = they owe you more), "settlement"
    // entries come from SettleUpSheet/Collect and simply bring the running
    // sum back to zero. Nothing here is ever inferred from raw payment
    // history — a row only exists because you explicitly split or settled.
    dbInstance.executeSync(`
      CREATE TABLE IF NOT EXISTS split_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_key TEXT NOT NULL,
        kind TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_id INTEGER,
        note TEXT,
        created_at INTEGER NOT NULL
      );
    `);
    dbInstance.executeSync(
      'CREATE INDEX IF NOT EXISTS idx_split_entries_person_key ON split_entries(person_key);',
    );
  }
  return dbInstance;
}

export interface ParsedForInsert {
  m: string | null;
  s: string;
  a: number;
  c: string;
  isForeignTransaction?: boolean;
  originalCurrency?: string | null;
  originalAmount?: number | null;
  inrAmount?: number | null;
  categoryLocked?: boolean;
  raw?: string;
  refNo?: string | null;
  counterpartyType?: 'person' | 'merchant' | null;
  personKey?: string | null;
  type?: TxnType;
  payeeRaw?: string | null;
  payeeKind?: 'name' | 'upi_id' | null;
  cardLast4?: string | null;
}

// Looks for an existing row that's really the same real-world payment
// arriving via a second SMS (bank confirmation + UPI app receipt, or a
// pay-later confirmation + the bank debit for it, are the common cases).
//
// Two signals only — "same amount, close in time" is deliberately NOT
// enough on its own (Stage 2 item 4: two unrelated same-amount payments
// minutes apart must not collapse into one):
//  1. A genuine 12-digit UPI reference number shared by both messages, and
//     only when both rows move money in the same direction (a refund
//     legitimately shares its original payment's ref number but is a
//     separate, opposite-direction event, so it must NOT match here).
//  2. Same amount AND same merchant name, within the merge window.
function findMergeCandidate(
  database: DB,
  refNo: string | null | undefined,
  merchant: string | null | undefined,
  amount: number,
  timestamp: number,
): Record<string, unknown> | null {
  if (refNo && /^\d{12}$/.test(refNo)) {
    const byRef = database.executeSync(
      'SELECT * FROM transactions WHERE ref_no = ?',
      [refNo],
    );
    const sameDirection = (byRef.rows ?? []).find(
      (r: Record<string, unknown>) => (Number(r.amount) < 0) === (amount < 0),
    );
    if (sameDirection) return sameDirection as Record<string, unknown>;
  }
  if (merchant) {
    const windowStart = timestamp - MERGE_WINDOW_MS;
    const windowEnd = timestamp + MERGE_WINDOW_MS;
    const byWindow = database.executeSync(
      `SELECT * FROM transactions
       WHERE amount = ? AND timestamp BETWEEN ? AND ? AND LOWER(TRIM(merchant)) = LOWER(TRIM(?))
       ORDER BY ABS(timestamp - ?) ASC LIMIT 1`,
      [amount, windowStart, windowEnd, merchant, timestamp],
    );
    if (byWindow.rows && byWindow.rows.length > 0) return byWindow.rows[0] as Record<string, unknown>;
  }
  return null;
}

// The other half of a self-transfer: a bank credit with no name on it
// (e.g. DBS "account credited with INR 3000.00") that matches an already
// self-transfer typed row of the opposite sign, within the merge window —
// Stage 2 item 5's second bullet. Only ever matched by amount+time because
// there's no name/reference to check instead; that's acceptable here
// specifically because it's scoped to rows already typed 'transfer'.
function findOppositeSignTransferMatch(
  database: DB,
  types: TxnType[],
  wantNameless: boolean,
  amount: number,
  timestamp: number,
): Record<string, unknown> | null {
  const windowStart = timestamp - MERGE_WINDOW_MS;
  const windowEnd = timestamp + MERGE_WINDOW_MS;
  const placeholders = types.map(() => '?').join(',');
  const namelessClause = wantNameless ? 'AND person_key IS NULL AND counterparty_type IS NULL' : '';
  const res = database.executeSync(
    `SELECT * FROM transactions
     WHERE type IN (${placeholders}) ${namelessClause} AND amount = ? AND timestamp BETWEEN ? AND ?
     ORDER BY ABS(timestamp - ?) ASC LIMIT 1`,
    [...types, amount, windowStart, windowEnd, timestamp],
  );
  if (res.rows && res.rows.length > 0) return res.rows[0] as Record<string, unknown>;
  return null;
}

export async function insertTransaction(
  parsed: ParsedForInsert,
  sender: string | null,
  timestamp: number,
  smsId?: number | null,
): Promise<InsertResult> {
  const database = getDatabase();
  const type: TxnType = parsed.type ?? 'expense';

  // The fingerprint for "is this the exact same SMS I've already saved"
  // (Stage 2 item 1). Deliberately excludes timestamp — the live receiver
  // and the history scan can see two slightly different times for the
  // same message, but never different text, so sender+text is the only
  // fingerprint that's stable across both paths.
  const dedupKey = `${normalizeSenderId(sender)}|${normalizeSmsText(parsed.raw)}`;

  const existing = database.executeSync(
    'SELECT * FROM transactions WHERE dedup_key = ?',
    [dedupKey],
  );
  if (existing.rows && existing.rows.length > 0) {
    return { status: 'duplicate', transaction: mapRowToTransaction(existing.rows[0] as Record<string, unknown>) };
  }

  const merged = findMergeCandidate(database, parsed.refNo, parsed.m, parsed.a, timestamp);
  if (merged) {
    // Same real payment, second SMS about it — fill in a ref number we
    // didn't have yet, but otherwise keep the first-seen row as-is rather
    // than inserting a second one.
    if (parsed.refNo && !merged.ref_no) {
      database.executeSync('UPDATE transactions SET ref_no = ? WHERE id = ?', [parsed.refNo, Number(merged.id)]);
      merged.ref_no = parsed.refNo;
    }
    return { status: 'duplicate', transaction: mapRowToTransaction(merged) };
  }

  // A nameless bank credit that's really just the receiving side of a
  // self-transfer we already recorded (Stage 2 item 5, second bullet) —
  // don't add a second row for the same movement of money.
  if (type === 'income' && !parsed.counterpartyType) {
    const transferMatch = findOppositeSignTransferMatch(database, ['transfer'], false, -parsed.a, timestamp);
    if (transferMatch) {
      return { status: 'duplicate', transaction: mapRowToTransaction(transferMatch) };
    }
  }

  // The reverse ordering: a nameless credit arrived first (before the
  // named debit that identifies it as a self-transfer), so it's sitting
  // as a stray 'income' row. Fold it into this transfer instead of
  // leaving two rows for one real movement.
  if (type === 'transfer') {
    const strayCredit = findOppositeSignTransferMatch(database, ['income'], true, -parsed.a, timestamp);
    if (strayCredit) {
      database.executeSync('DELETE FROM transactions WHERE id = ?', [Number(strayCredit.id)]);
    }
  }

  const now = Date.now();
  const result = database.executeSync(
    `INSERT INTO transactions
     (dedup_key, sender, merchant, subtitle, body, amount, category, is_foreign, original_currency, original_amount, inr_amount, category_locked, timestamp, created_at, ref_no, counterparty_type, person_key, sms_id, type, payee_raw, payee_kind, card_last4)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dedupKey,
      sender,
      parsed.m,
      parsed.s,
      parsed.raw ?? '',
      parsed.a,
      parsed.c,
      parsed.isForeignTransaction ? 1 : 0,
      parsed.originalCurrency ?? null,
      parsed.originalAmount ?? null,
      parsed.inrAmount ?? null,
      parsed.categoryLocked ? 1 : 0,
      timestamp,
      now,
      parsed.refNo ?? null,
      parsed.counterpartyType ?? null,
      parsed.personKey ?? null,
      smsId ?? null,
      type,
      parsed.payeeRaw ?? null,
      parsed.payeeKind ?? null,
      parsed.cardLast4 ?? null,
    ],
  );

  const newId = result.insertId ?? now;
  const stored: StoredTransaction = {
    id: newId,
    dedupKey,
    sender,
    merchant: parsed.m,
    subtitle: parsed.s,
    body: parsed.raw ?? '',
    amount: parsed.a,
    category: parsed.c,
    isForeignTransaction: !!parsed.isForeignTransaction,
    originalCurrency: parsed.originalCurrency ?? null,
    originalAmount: parsed.originalAmount ?? null,
    inrAmount: parsed.inrAmount ?? null,
    categoryLocked: !!parsed.categoryLocked,
    timestamp,
    createdAt: now,
    refNo: parsed.refNo ?? null,
    counterpartyType: parsed.counterpartyType ?? null,
    personKey: parsed.personKey ?? null,
    type,
    smsId: smsId ?? null,
    payeeRaw: parsed.payeeRaw ?? null,
    payeeKind: parsed.payeeKind ?? null,
    cardLast4: parsed.cardLast4 ?? null,
  };

  notifyTransactionsChanged();
  if (stored.personKey) notifyPeopleChanged();
  return { status: 'inserted', transaction: stored };
}

function mapRowToTransaction(row: Record<string, unknown>): StoredTransaction {
  return {
    id: Number(row.id),
    dedupKey: String(row.dedup_key),
    sender: row.sender ? String(row.sender) : null,
    merchant: row.merchant ? String(row.merchant) : null,
    subtitle: String(row.subtitle),
    body: String(row.body),
    amount: Number(row.amount),
    category: row.category as string,
    isForeignTransaction: Number(row.is_foreign) === 1,
    originalCurrency: row.original_currency ? String(row.original_currency) : null,
    originalAmount: row.original_amount !== null ? Number(row.original_amount) : null,
    inrAmount: row.inr_amount !== null ? Number(row.inr_amount) : null,
    categoryLocked: !!row.category_locked,
    timestamp: Number(row.timestamp),
    createdAt: Number(row.created_at),
    refNo: row.ref_no ? String(row.ref_no) : null,
    counterpartyType: (row.counterparty_type as 'person' | 'merchant' | null) ?? null,
    personKey: row.person_key ? String(row.person_key) : null,
    type: ((row.type as TxnType) || 'expense'),
    smsId: row.sms_id !== null && row.sms_id !== undefined ? Number(row.sms_id) : null,
    payeeRaw: row.payee_raw ? String(row.payee_raw) : null,
    payeeKind: (row.payee_kind as 'name' | 'upi_id' | null) ?? null,
    cardLast4: row.card_last4 ? String(row.card_last4) : null,
  };
}

export async function getAllTransactions(): Promise<StoredTransaction[]> {
  const database = getDatabase();
  const res = database.executeSync(
    'SELECT * FROM transactions ORDER BY timestamp DESC',
  );
  if (!res.rows) return [];
  return res.rows.map((r: Record<string, unknown>) => mapRowToTransaction(r));
}

// executeSync really is synchronous (op-sqlite, not a Promise-wrapped
// native call) — exposed directly so a screen can seed its initial state
// with real data on first render instead of starting from [] and waiting
// a microtask for getRecentTransactions' .then() to land, which is what
// produced the empty-state flash on TransactionsScreen's first mount.
export function getRecentTransactionsSync(limit = 100): StoredTransaction[] {
  const database = getDatabase();
  const res = database.executeSync(
    'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?',
    [limit],
  );
  if (!res.rows) return [];
  return res.rows.map((r: Record<string, unknown>) => mapRowToTransaction(r));
}

export async function getRecentTransactions(limit = 100): Promise<StoredTransaction[]> {
  return getRecentTransactionsSync(limit);
}

export async function getUncategorisedTransactions(limit = 100): Promise<StoredTransaction[]> {
  const database = getDatabase();
  const res = database.executeSync(
    "SELECT * FROM transactions WHERE category = 'other' AND category_locked = 0 ORDER BY timestamp DESC LIMIT ?",
    [limit],
  );
  if (!res.rows) return [];
  return res.rows.map((r: Record<string, unknown>) => mapRowToTransaction(r));
}

export async function updateTransactionCategory(id: number, category: string): Promise<void> {
  const database = getDatabase();
  database.executeSync(
    'UPDATE transactions SET category = ?, category_locked = 1 WHERE id = ?',
    [category, id],
  );
  notifyTransactionsChanged();
}

export async function deleteTransaction(id: number): Promise<void> {
  const database = getDatabase();
  database.executeSync('DELETE FROM transactions WHERE id = ?', [id]);
  notifyTransactionsChanged();
}

export async function restoreTransactions(list: StoredTransaction[]): Promise<number> {
  const database = getDatabase();
  let restored = 0;
  for (const t of list) {
    const res = database.executeSync(
      `INSERT OR IGNORE INTO transactions
       (dedup_key, sender, merchant, subtitle, body, amount, category, is_foreign, original_currency, original_amount, inr_amount, category_locked, timestamp, created_at, ref_no, counterparty_type, person_key, sms_id, type, payee_raw, payee_kind, card_last4)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.dedupKey,
        t.sender,
        t.merchant,
        t.subtitle,
        t.body,
        t.amount,
        t.category,
        t.isForeignTransaction ? 1 : 0,
        t.originalCurrency,
        t.originalAmount,
        t.inrAmount,
        t.categoryLocked ? 1 : 0,
        t.timestamp,
        t.createdAt || Date.now(),
        t.refNo ?? null,
        t.counterpartyType ?? null,
        t.personKey ?? null,
        t.smsId ?? null,
        t.type ?? 'expense',
        t.payeeRaw ?? null,
        t.payeeKind ?? null,
        t.cardLast4 ?? null,
      ],
    );
    if (res.rowsAffected) restored++;
  }
  if (restored) {
    notifyTransactionsChanged();
    notifyPeopleChanged();
  }
  return restored;
}

// One-time clean-up (Stage 2 item 8): copies every existing transaction
// into a backup table inside this same on-device database file, then
// clears the live table so it can be rebuilt from SMS history under the
// new dedup/type rules. `people` and `split_entries` are untouched —
// person_key is derived the same way from the same SMS text, so Split
// balances line up again once the rebuild finishes; nothing here decides
// or changes what Split shows.
export function backupAndClearTransactionsSync(): { backedUp: number } {
  const database = getDatabase();
  database.executeSync(
    'CREATE TABLE IF NOT EXISTS transactions_backup_pre_v2 AS SELECT * FROM transactions;',
  );
  const countRes = database.executeSync('SELECT COUNT(*) AS n FROM transactions_backup_pre_v2;');
  const backedUp = countRes.rows && countRes.rows.length ? Number((countRes.rows[0] as Record<string, unknown>).n ?? 0) : 0;
  database.executeSync('DELETE FROM transactions;');
  notifyTransactionsChanged();
  notifyPeopleChanged();
  return { backedUp };
}

type TransactionsChangeListener = () => void;
const changeListeners = new Set<TransactionsChangeListener>();

export function subscribeToTransactionsChanged(listener: TransactionsChangeListener): () => void {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

function notifyTransactionsChanged() {
  changeListeners.forEach(listener => listener());
}

// ---------------------------------------------------------------------
// People — real Split data, derived from transactions.person_key plus
// the manual overrides/contact links stored in the `people` table.
// ---------------------------------------------------------------------

export interface PersonAggregate {
  personKey: string;
  displayName: string;
  lastAmount: number;
  lastTimestamp: number;
  txnCount: number;
  contactName: string | null;
  matchStatus: string;
}

export interface PersonRecord {
  personKey: string;
  displayName: string | null;
  contactId: string | null;
  contactName: string | null;
  isPerson: boolean | null;
  matchStatus: string;
  updatedAt: number;
}

const peopleListeners = new Set<() => void>();
export function subscribeToPeopleChanged(listener: () => void): () => void {
  peopleListeners.add(listener);
  return () => peopleListeners.delete(listener);
}
function notifyPeopleChanged() {
  peopleListeners.forEach(l => l());
}

// Not-a-person is the only override that excludes someone from this list —
// unmatched/auto/manual all still show up, since being unmatched doesn't
// mean "not a person," just "no contact linked yet."
const PEOPLE_FILTER = `
  t.person_key IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM people p WHERE p.person_key = t.person_key AND p.is_person = 0)
`;

export function getPeoplePageSync(limit: number, offset: number): PersonAggregate[] {
  const database = getDatabase();
  const res = database.executeSync(
    `SELECT
       t.person_key AS person_key,
       (SELECT t2.merchant FROM transactions t2 WHERE t2.person_key = t.person_key ORDER BY t2.timestamp DESC LIMIT 1) AS display_name,
       (SELECT t2.amount FROM transactions t2 WHERE t2.person_key = t.person_key ORDER BY t2.timestamp DESC LIMIT 1) AS last_amount,
       MAX(t.timestamp) AS last_timestamp,
       COUNT(*) AS txn_count,
       (SELECT p.contact_name FROM people p WHERE p.person_key = t.person_key) AS contact_name,
       COALESCE((SELECT p.match_status FROM people p WHERE p.person_key = t.person_key), 'unmatched') AS match_status
     FROM transactions t
     WHERE ${PEOPLE_FILTER}
     GROUP BY t.person_key
     ORDER BY last_timestamp DESC
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  if (!res.rows) return [];
  return res.rows.map((r: Record<string, unknown>) => ({
    personKey: String(r.person_key),
    displayName: (r.contact_name ? String(r.contact_name) : null) || String(r.display_name ?? 'Unknown'),
    lastAmount: Number(r.last_amount ?? 0),
    lastTimestamp: Number(r.last_timestamp),
    txnCount: Number(r.txn_count),
    contactName: r.contact_name ? String(r.contact_name) : null,
    matchStatus: String(r.match_status),
  }));
}

export function getPeopleCountSync(): number {
  const database = getDatabase();
  const res = database.executeSync(
    `SELECT COUNT(DISTINCT t.person_key) AS n FROM transactions t WHERE ${PEOPLE_FILTER}`,
  );
  if (!res.rows || !res.rows.length) return 0;
  return Number((res.rows[0] as Record<string, unknown>).n ?? 0);
}

export function getPersonAggregateSync(personKey: string): PersonAggregate | null {
  const database = getDatabase();
  const res = database.executeSync(
    `SELECT
       t.person_key AS person_key,
       (SELECT t2.merchant FROM transactions t2 WHERE t2.person_key = t.person_key ORDER BY t2.timestamp DESC LIMIT 1) AS display_name,
       (SELECT t2.amount FROM transactions t2 WHERE t2.person_key = t.person_key ORDER BY t2.timestamp DESC LIMIT 1) AS last_amount,
       MAX(t.timestamp) AS last_timestamp,
       COUNT(*) AS txn_count,
       (SELECT p.contact_name FROM people p WHERE p.person_key = t.person_key) AS contact_name,
       COALESCE((SELECT p.match_status FROM people p WHERE p.person_key = t.person_key), 'unmatched') AS match_status
     FROM transactions t
     WHERE t.person_key = ?
     GROUP BY t.person_key`,
    [personKey],
  );
  if (!res.rows || !res.rows.length) return null;
  const r = res.rows[0] as Record<string, unknown>;
  return {
    personKey: String(r.person_key),
    displayName: (r.contact_name ? String(r.contact_name) : null) || String(r.display_name ?? 'Unknown'),
    lastAmount: Number(r.last_amount ?? 0),
    lastTimestamp: Number(r.last_timestamp),
    txnCount: Number(r.txn_count),
    contactName: r.contact_name ? String(r.contact_name) : null,
    matchStatus: String(r.match_status),
  };
}

export function getPersonTransactionsSync(personKey: string, limit = 200): StoredTransaction[] {
  const database = getDatabase();
  const res = database.executeSync(
    'SELECT * FROM transactions WHERE person_key = ? ORDER BY timestamp DESC LIMIT ?',
    [personKey, limit],
  );
  if (!res.rows) return [];
  return res.rows.map((r: Record<string, unknown>) => mapRowToTransaction(r));
}

// Sorted by how many payments are waiting on a decision, most first — so
// reviewing "Match people" clears the biggest chunks of your history soonest.
export function getUnmatchedPeopleSync(limit = 100): PersonAggregate[] {
  const database = getDatabase();
  const res = database.executeSync(
    `SELECT
       t.person_key AS person_key,
       (SELECT t2.merchant FROM transactions t2 WHERE t2.person_key = t.person_key ORDER BY t2.timestamp DESC LIMIT 1) AS display_name,
       (SELECT t2.amount FROM transactions t2 WHERE t2.person_key = t.person_key ORDER BY t2.timestamp DESC LIMIT 1) AS last_amount,
       MAX(t.timestamp) AS last_timestamp,
       COUNT(*) AS txn_count,
       NULL AS contact_name,
       COALESCE((SELECT p.match_status FROM people p WHERE p.person_key = t.person_key), 'unmatched') AS match_status
     FROM transactions t
     WHERE ${PEOPLE_FILTER}
       AND COALESCE((SELECT p.match_status FROM people p WHERE p.person_key = t.person_key), 'unmatched') = 'unmatched'
     GROUP BY t.person_key
     ORDER BY txn_count DESC
     LIMIT ?`,
    [limit],
  );
  if (!res.rows) return [];
  return res.rows.map((r: Record<string, unknown>) => ({
    personKey: String(r.person_key),
    displayName: String(r.display_name ?? 'Unknown'),
    lastAmount: Number(r.last_amount ?? 0),
    lastTimestamp: Number(r.last_timestamp),
    txnCount: Number(r.txn_count),
    contactName: null,
    matchStatus: String(r.match_status),
  }));
}

export function getPersonSync(personKey: string): PersonRecord | null {
  const database = getDatabase();
  const res = database.executeSync('SELECT * FROM people WHERE person_key = ?', [personKey]);
  if (!res.rows || !res.rows.length) return null;
  const r = res.rows[0] as Record<string, unknown>;
  return {
    personKey: String(r.person_key),
    displayName: r.display_name ? String(r.display_name) : null,
    contactId: r.contact_id ? String(r.contact_id) : null,
    contactName: r.contact_name ? String(r.contact_name) : null,
    isPerson: r.is_person === null || r.is_person === undefined ? null : Number(r.is_person) === 1,
    matchStatus: String(r.match_status ?? 'unmatched'),
    updatedAt: Number(r.updated_at ?? 0),
  };
}

export function upsertPersonSync(
  personKey: string,
  fields: Partial<Pick<PersonRecord, 'displayName' | 'contactId' | 'contactName' | 'isPerson' | 'matchStatus'>>,
): void {
  const database = getDatabase();
  const existing = getPersonSync(personKey);
  const now = Date.now();
  const merged = {
    displayName: fields.displayName ?? existing?.displayName ?? null,
    contactId: fields.contactId !== undefined ? fields.contactId : existing?.contactId ?? null,
    contactName: fields.contactName !== undefined ? fields.contactName : existing?.contactName ?? null,
    isPerson: fields.isPerson !== undefined ? fields.isPerson : existing?.isPerson ?? null,
    matchStatus: fields.matchStatus ?? existing?.matchStatus ?? 'unmatched',
  };
  database.executeSync(
    `INSERT INTO people (person_key, display_name, contact_id, contact_name, is_person, match_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(person_key) DO UPDATE SET
       display_name = excluded.display_name,
       contact_id = excluded.contact_id,
       contact_name = excluded.contact_name,
       is_person = excluded.is_person,
       match_status = excluded.match_status,
       updated_at = excluded.updated_at`,
    [
      personKey,
      merged.displayName,
      merged.contactId,
      merged.contactName,
      merged.isPerson === null ? null : merged.isPerson ? 1 : 0,
      merged.matchStatus,
      now,
    ],
  );
  notifyPeopleChanged();
}

// ---------------------------------------------------------------------
// Split ledger — real balances. See the `split_entries` table comment
// above for why net is always just SUM(amount), never a stored/mutated
// field.
// ---------------------------------------------------------------------

export interface SplitEntryInput {
  personKey: string;
  kind: 'split' | 'settlement';
  amount: number;
  transactionId?: number | null;
  note?: string | null;
}

export function insertSplitEntrySync(entry: SplitEntryInput): void {
  const database = getDatabase();
  database.executeSync(
    'INSERT INTO split_entries (person_key, kind, amount, transaction_id, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [entry.personKey, entry.kind, entry.amount, entry.transactionId ?? null, entry.note ?? null, Date.now()],
  );
  notifyPeopleChanged();
}

export function getPersonNetSync(personKey: string): number {
  const database = getDatabase();
  const res = database.executeSync(
    'SELECT COALESCE(SUM(amount), 0) AS net FROM split_entries WHERE person_key = ?',
    [personKey],
  );
  if (!res.rows || !res.rows.length) return 0;
  return Number((res.rows[0] as Record<string, unknown>).net ?? 0);
}

// One query for the whole visible page's balances, rather than N queries —
// matters once "hundreds of people" is real.
export function getPersonNetsSync(personKeys: string[]): Record<string, number> {
  if (!personKeys.length) return {};
  const database = getDatabase();
  const placeholders = personKeys.map(() => '?').join(',');
  const res = database.executeSync(
    `SELECT person_key, COALESCE(SUM(amount), 0) AS net FROM split_entries WHERE person_key IN (${placeholders}) GROUP BY person_key`,
    personKeys,
  );
  const out: Record<string, number> = {};
  personKeys.forEach(k => {
    out[k] = 0;
  });
  if (res.rows) {
    res.rows.forEach((r: Record<string, unknown>) => {
      out[String(r.person_key)] = Number(r.net ?? 0);
    });
  }
  return out;
}

// All transactions currently classified as a person — input to
// personClassifier.ts's recurring-pattern pass (a "person" whose payments
// repeat like a subscription gets moved to merchant).
export function getPersonTaggedTransactionsSync(): StoredTransaction[] {
  const database = getDatabase();
  const res = database.executeSync(
    "SELECT * FROM transactions WHERE counterparty_type = 'person' AND person_key IS NOT NULL",
  );
  if (!res.rows) return [];
  return res.rows.map((r: Record<string, unknown>) => mapRowToTransaction(r));
}

export function reclassifyPersonAsMerchantSync(personKey: string): void {
  const database = getDatabase();
  database.executeSync(
    "UPDATE transactions SET counterparty_type = 'merchant', person_key = NULL WHERE person_key = ?",
    [personKey],
  );
  database.executeSync('DELETE FROM people WHERE person_key = ?', [personKey]);
  notifyTransactionsChanged();
  notifyPeopleChanged();
}

// Split screen's "You'll get" / "You'll pay" — real totals across every
// person's ledger, independent of how many pages of the people list have
// actually loaded.
export function getSplitTotalsSync(): { get: number; pay: number } {
  const database = getDatabase();
  const res = database.executeSync(
    `SELECT
       COALESCE(SUM(CASE WHEN net > 0 THEN net ELSE 0 END), 0) AS get_total,
       COALESCE(SUM(CASE WHEN net < 0 THEN -net ELSE 0 END), 0) AS pay_total
     FROM (SELECT person_key, SUM(amount) AS net FROM split_entries GROUP BY person_key)`,
  );
  if (!res.rows || !res.rows.length) return { get: 0, pay: 0 };
  const r = res.rows[0] as Record<string, unknown>;
  return { get: Number(r.get_total ?? 0), pay: Number(r.pay_total ?? 0) };
}

export function getPersonSplitEntriesSync(personKey: string): { id: number; kind: string; amount: number; transactionId: number | null; note: string | null; createdAt: number }[] {
  const database = getDatabase();
  const res = database.executeSync(
    'SELECT * FROM split_entries WHERE person_key = ? ORDER BY created_at DESC',
    [personKey],
  );
  if (!res.rows) return [];
  return res.rows.map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    kind: String(r.kind),
    amount: Number(r.amount),
    transactionId: r.transaction_id === null || r.transaction_id === undefined ? null : Number(r.transaction_id),
    note: r.note ? String(r.note) : null,
    createdAt: Number(r.created_at),
  }));
}
