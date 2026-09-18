import { RawSms } from '../native/sms';
import { parseSms } from './smsParser';
import { insertTransaction, InsertResult } from './db';
import { isSenderEnabled } from './smsSourcesStore';

// Every onSmsReceived event runs through here: parse, then store whatever
// parsed successfully. An SMS the parser can't make sense of (no amount
// found) is silently dropped — nothing to store. A sender the user has
// disabled on the SMS sources screen is dropped before parsing even runs.
export async function processIncomingSms(raw: RawSms): Promise<InsertResult[]> {
  if (!isSenderEnabled(raw.sender)) return [];
  const parsed = parseSms(raw.body);
  const results: InsertResult[] = [];
  for (const txn of parsed) {
    results.push(await insertTransaction(txn, raw.sender, raw.timestamp));
  }
  return results;
}
