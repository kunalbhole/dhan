import { RawSms } from '../native/sms';
import { parseSms } from './smsParser';
import { insertTransaction, InsertResult } from './db';

// Every onSmsReceived event runs through here: parse, then store whatever
// parsed successfully. An SMS the parser can't make sense of (no amount
// found) is silently dropped — nothing to store.
export async function processIncomingSms(raw: RawSms): Promise<InsertResult[]> {
  const parsed = parseSms(raw.body);
  const results: InsertResult[] = [];
  for (const txn of parsed) {
    results.push(await insertTransaction(txn, raw.sender, raw.timestamp));
  }
  return results;
}
