import { open, DB } from '@op-engineering/op-sqlite';
import { ParsedTxn } from './smsParser';
import { buildDedupKey } from './dedupKey';

export interface StoredTransaction {
  id: number;
  dedupKey: string;
  sender: string | null;
  merchant: string | null;
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
       (dedup_key, sender, merchant, body, amount, category,
        is_foreign_transaction, original_currency, original_amount, inr_amount,
        category_locked, timestamp, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      dedupKey,
      sender,
      txn.m,
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

  return {
    status: 'inserted',
    transaction: {
      id: result.insertId as number,
      dedupKey,
      sender,
      merchant: txn.m,
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
    },
  };
}

export async function getTransactionCount(): Promise<number> {
  const database = await getDb();
  const result = await database.execute('SELECT COUNT(*) as count FROM transactions;');
  return result.rows[0].count as number;
}

export async function getRecentTransactions(limit = 20): Promise<StoredTransaction[]> {
  const database = await getDb();
  const result = await database.execute(
    'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?;',
    [limit],
  );
  return result.rows.map((row) => ({
    id: row.id as number,
    dedupKey: row.dedup_key as string,
    sender: row.sender as string | null,
    merchant: row.merchant as string | null,
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
  }));
}
