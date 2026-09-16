// FNV-1a 32-bit — not cryptographic, just a fast, deterministic string hash
// for building a dedup key. Good enough to collapse the same SMS delivered
// twice (common with dual-SIM / carrier retries) into one row.
function hashString(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// sender + amount + timestamp rounded to the minute — two SMS for the same
// spend that land a few seconds apart (bank + UPI app both notifying) still
// collapse to one row; two genuinely different transactions a minute apart
// don't.
export function buildDedupKey(sender: string | null, amount: number, timestampMs: number): string {
  const minuteBucket = Math.floor(timestampMs / 60000);
  return hashString(`${sender ?? ''}|${amount}|${minuteBucket}`);
}
