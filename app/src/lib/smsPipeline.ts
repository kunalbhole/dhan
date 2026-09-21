import { RawSms, RawSmsWithId, readExistingSms } from '../native/sms';
import { parseSms } from './smsParser';
import { insertTransaction, InsertResult } from './db';
import { isSenderEnabled } from './smsSourcesStore';
import { getProfile } from './profileStore';

export async function processIncomingSms(raw: RawSms | RawSmsWithId): Promise<InsertResult[]> {
  if (!isSenderEnabled(raw.sender)) return [];
  const selfName = getProfile().name || null;
  const parsed = parseSms(raw.body, selfName);
  const smsId = 'id' in raw ? raw.id : null;
  const results: InsertResult[] = [];
  for (const txn of parsed) {
    results.push(await insertTransaction(txn, raw.sender, raw.timestamp, smsId));
  }
  return results;
}

export async function scanAndProcessInbox(limit = 500): Promise<number> {
  try {
    const rawList = await readExistingSms(limit);
    let insertedCount = 0;
    for (const raw of rawList) {
      const res = await processIncomingSms(raw);
      if (res.some(r => r.status === 'inserted')) {
        insertedCount++;
      }
    }
    return insertedCount;
  } catch {
    return 0;
  }
}
