// op-sqlite is JSI-backed and throws at import time when no native module is
// linked (Jest, unit tests). This manual mock keeps db.ts importable in that
// environment — Jest picks it up automatically for any test that pulls in
// @op-engineering/op-sqlite, no per-test jest.mock() call needed.
//
// executeSync is backed by Node's built-in node:sqlite (DatabaseSync) rather
// than a hand-stubbed fake, so tests that exercise db.ts's SQL (dedup key
// lookups, findMergeCandidate, etc.) run against a real embedded SQLite
// engine and prove the actual queries work, not a pretend version of them.
import { DatabaseSync } from 'node:sqlite';

interface QueryResult {
  insertId?: number;
  rowsAffected: number;
  rows: Record<string, unknown>[];
}

function isRowReturning(query: string): boolean {
  const head = query.trim().slice(0, 10).toUpperCase();
  return head.startsWith('SELECT') || head.startsWith('PRAGMA') || head.startsWith('WITH');
}

function runQuery(sqlite: DatabaseSync, query: string, params: unknown[] = []): QueryResult {
  const stmt = sqlite.prepare(query);
  if (isRowReturning(query)) {
    const rows = stmt.all(...(params as never[])) as Record<string, unknown>[];
    return { rows, rowsAffected: 0 };
  }
  const info = stmt.run(...(params as never[]));
  return {
    rows: [],
    rowsAffected: Number(info.changes ?? 0),
    insertId: info.lastInsertRowid !== undefined ? Number(info.lastInsertRowid) : undefined,
  };
}

export const open = jest.fn(() => {
  const sqlite = new DatabaseSync(':memory:');
  return {
    executeSync: (query: string, params: unknown[] = []) => runQuery(sqlite, query, params),
    execute: async (query: string, params: unknown[] = []) => runQuery(sqlite, query, params),
    close: jest.fn(() => sqlite.close()),
    closeAsync: jest.fn(async () => sqlite.close()),
  };
});
