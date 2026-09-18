import { RawSms, readExistingSms } from '../native/sms';
import { parseSms } from './smsParser';
import { insertTransaction, InsertResult } from './db';
import { isSenderEnabled } from './smsSourcesStore';

export async function processIncomingSms(raw: RawSms): Promise<InsertResult[]> {
  if (!isSenderEnabled(raw.sender)) return [];
  const parsed = parseSms(raw.body);
  const results: InsertResult[] = [];
  for (const txn of parsed) {
    results.push(await insertTransaction(txn, raw.sender, raw.timestamp));
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
