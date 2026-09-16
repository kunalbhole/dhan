// op-sqlite is JSI-backed and throws at import time when no native module is
// linked (Jest, unit tests). This manual mock keeps db.ts importable in that
// environment — Jest picks it up automatically for any test that pulls in
// @op-engineering/op-sqlite, no per-test jest.mock() call needed.
export const open = jest.fn(() => ({
  execute: jest.fn(async () => ({ rowsAffected: 0, rows: [] as Record<string, unknown>[] })),
  close: jest.fn(),
  closeAsync: jest.fn(async () => {}),
}));
