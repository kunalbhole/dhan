import { open, DB } from '@op-engineering/op-sqlite';
import { ParsedTxn } from './smsParser';
import { buildDedupKey } from './dedupKey';

export interface StoredTransaction {
  id: number;
  dedupKey: string;
  sender: string | null;
  merchant: string | null;
  // The parser's own descriptive line (e.g. "Auto-detected from SMS",
  // "USD 45 · international") — persisted as-is rather than reconstructed
  // later, since it already captures things (foreign-currency detail, the
  // forex-fee note) that aren't derivable from the other stored columns.
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

let dbPromise: Promise<DB> | null = null;

function getDb(): Promise<DB> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = open({ name: 'dhan.db' });
      await database.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dedup_key TEXT NOT NULL,
          sender TEXT,
          merchant TEXT,
          subtitle TEXT NOT NULL,
          body TEXT NOT NULL,
          amount REAL NOT NULL,
          category TEXT NOT NULL,
          is_foreign_transaction INTEGER NOT NULL DEFAULT 0,
          original_currency TEXT,
          original_amount REAL,
          inr_amount REAL,
          category_locked INTEGER NOT NULL DEFAULT 0,
          timestamp INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        );
      `);
      // Unique index (rather than an inline UNIQUE column constraint) so a
      // second SMS for the same sender/amount/minute is rejected at the
      // storage layer, not just filtered in JS.
      await database.execute(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_dedup_key ON transactions(dedup_key);`,
      );
      return database;
    })();
  }
  return dbPromise;
}

export type InsertResult =
  | { status: 'inserted'; transaction: StoredTransaction }
  | { status: 'duplicate'; dedupKey: string };

export async function insertTransaction(
  txn: ParsedTxn,
  sender: string | null,
  timestamp: number,
): Promise<InsertResult> {
  const database = await getDb();
  const dedupKey = buildDedupKey(sender, txn.a, timestamp);
  const createdAt = Date.now();

  const result = await database.execute(
    `INSERT OR IGNORE INTO transactions
       (dedup_key, sender, merchant, subtitle, body, amount, category,
        is_foreign_transaction, original_currency, original_amount, inr_amount,
        category_locked, timestamp, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      dedupKey,
      sender,
      txn.m,
      txn.s,
      txn.raw ?? '',
      txn.a,
      txn.c,
      txn.isForeignTransaction ? 1 : 0,
      txn.originalCurrency,
      txn.originalAmount,
      txn.inrAmount,
      txn.categoryLocked ? 1 : 0,
      timestamp,
      createdAt,
    ],
  );

  if (!result.rowsAffected) {
    return { status: 'duplicate', dedupKey };
  }

  const transaction: StoredTransaction = {
    id: result.insertId as number,
    dedupKey,
    sender,
    merchant: txn.m,
    subtitle: txn.s,
    body: txn.raw ?? '',
    amount: txn.a,
    category: txn.c,
    isForeignTransaction: txn.isForeignTransaction,
    originalCurrency: txn.originalCurrency,
    originalAmount: txn.originalAmount,
    inrAmount: txn.inrAmount,
    categoryLocked: !!txn.categoryLocked,
    timestamp,
    createdAt,
  };
  notifyTransactionsChanged();
  return { status: 'inserted', transaction };
}

export async function getTransactionCount(): Promise<number> {
  const database = await getDb();
  const result = await database.execute('SELECT COUNT(*) as count FROM transactions;');
  return result.rows[0].count as number;
}

function rowToTransaction(row: Record<string, unknown>): StoredTransaction {
  return {
    id: row.id as number,
    dedupKey: row.dedup_key as string,
    sender: row.sender as string | null,
    merchant: row.merchant as string | null,
    subtitle: row.subtitle as string,
    body: row.body as string,
    amount: row.amount as number,
    category: row.category as string,
    isForeignTransaction: !!row.is_foreign_transaction,
    originalCurrency: row.original_currency as string | null,
    originalAmount: row.original_amount as number | null,
    inrAmount: row.inr_amount as number | null,
    categoryLocked: !!row.category_locked,
    timestamp: row.timestamp as number,
    createdAt: row.created_at as number,
  };
}

export async function getRecentTransactions(limit = 20): Promise<StoredTransaction[]> {
  const database = await getDb();
  const result = await database.execute(
    'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?;',
    [limit],
  );
  return result.rows.map(rowToTransaction);
}

// Real transactions the parser couldn't confidently categorise — guessCategory()
// falls back to 'other' for these (see smsParser.ts). Locked categories
// (e.g. forex-fee) are deliberate, not "uncategorised", so they're excluded.
export async function getUncategorisedTransactions(limit = 20): Promise<StoredTransaction[]> {
  const database = await getDb();
  const result = await database.execute(
    "SELECT * FROM transactions WHERE category = 'other' AND category_locked = 0 ORDER BY timestamp DESC LIMIT ?;",
    [limit],
  );
  return result.rows.map(rowToTransaction);
}

export async function deleteTransaction(id: number): Promise<void> {
  const database = await getDb();
  await database.execute('DELETE FROM transactions WHERE id = ?;', [id]);
  notifyTransactionsChanged();
}

// Unbounded — for backup export only (src/lib/backupService.ts). Every
// other reader deliberately takes a `limit` since screens only ever need a
// bounded slice; a full dump is this function's one job.
export async function getAllTransactions(): Promise<StoredTransaction[]> {
  const database = await getDb();
  const result = await database.execute('SELECT * FROM transactions ORDER BY timestamp DESC;');
  return result.rows.map(rowToTransaction);
}

// For restore only (src/lib/backupService.ts), against a freshly onboarded,
// empty local DB — never against a live user's existing data (see
// RestorePromptScreen, gated on hasAccount() === false). `INSERT OR IGNORE`
// keyed on dedup_key, same as insertTransaction, makes this idempotent
// rather than because any real conflict is expected. Wrapped in one
// transaction so a large backup restores as a single atomic write.
export async function restoreTransactions(rows: StoredTransaction[]): Promise<number> {
  const database = await getDb();
  let inserted = 0;
  await database.transaction(async tx => {
    for (const row of rows) {
      const result = await tx.execute(
        `INSERT OR IGNORE INTO transactions
           (dedup_key, sender, merchant, subtitle, body, amount, category,
            is_foreign_transaction, original_currency, original_amount, inr_amount,
            category_locked, timestamp, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          row.dedupKey,
          row.sender,
          row.merchant,
          row.subtitle,
          row.body,
          row.amount,
          row.category,
          row.isForeignTransaction ? 1 : 0,
          row.originalCurrency,
          row.originalAmount,
          row.inrAmount,
          row.categoryLocked ? 1 : 0,
          row.timestamp,
          row.createdAt,
        ],
      );
      if (result.rowsAffected) inserted += 1;
    }
  });
  if (inserted) notifyTransactionsChanged();
  return inserted;
}

// Lets any mounted screen react to a new transaction being stored (SMS
// parsing happens at the app root in App.tsx, decoupled from whichever
// screen is on top) without polling or a focus-based refetch.
type TransactionsChangeListener = () => void;
const changeListeners = new Set<TransactionsChangeListener>();

export function subscribeToTransactionsChanged(listener: TransactionsChangeListener): () => void {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

function notifyTransactionsChanged() {
  changeListeners.forEach(listener => listener());
}
