// Real SQLite storage for SMS-detected transactions, using @op-engineering/op-sqlite.
import { open, DB } from '@op-engineering/op-sqlite';

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
}

export type InsertResult =
  | { status: 'inserted'; transaction: StoredTransaction }
  | { status: 'duplicate'; transaction: StoredTransaction };

let dbInstance: DB | null = null;

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
  }
  return dbInstance;
}

export async function insertTransaction(
  parsed: {
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
  },
  sender: string | null,
  timestamp: number,
): Promise<InsertResult> {
  const database = getDatabase();
  const dedupKey = `${sender ?? ''}|${timestamp}|${parsed.a}|${parsed.m ?? ''}`;

  const existing = database.executeSync(
    'SELECT * FROM transactions WHERE dedup_key = ?',
    [dedupKey],
  );

  if (existing.rows && existing.rows.length > 0) {
    const row = existing.rows[0] as Record<string, unknown>;
    return { status: 'duplicate', transaction: mapRowToTransaction(row) };
  }

  const now = Date.now();
  const result = database.executeSync(
    `INSERT INTO transactions
     (dedup_key, sender, merchant, subtitle, body, amount, category, is_foreign, original_currency, original_amount, inr_amount, category_locked, timestamp, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  };

  notifyTransactionsChanged();
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
       (dedup_key, sender, merchant, subtitle, body, amount, category, is_foreign, original_currency, original_amount, inr_amount, category_locked, timestamp, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ],
    );
    if (res.rowsAffected) restored++;
  }
  if (restored) notifyTransactionsChanged();
  return restored;
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
