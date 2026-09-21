// On-device name matching between SMS-derived people and the phone's own
// contact list — nothing here ever leaves the device (see native/contacts.ts).
// Matching is deliberately conservative: exact-after-normalizing or a clean
// subset match only. Anything less certain is left unmatched rather than
// guessed, per the "if unsure, don't guess" instruction — a wrong auto-link
// would misattribute real payments to the wrong person, which is worse
// than just asking.
import { readContacts, type RawContact } from '../native/contacts';
import { normalizePersonKey } from './smsParser';

export interface ContactMatch {
  contactId: string;
  contactName: string;
}

let cachedContacts: RawContact[] | null = null;

export async function loadContacts(forceRefresh = false): Promise<RawContact[]> {
  if (cachedContacts && !forceRefresh) return cachedContacts;
  cachedContacts = await readContacts();
  return cachedContacts;
}

function tokens(normalized: string): string[] {
  return normalized.split(' ').filter(Boolean);
}

// True when every token of the shorter name appears, in order, as a
// contiguous run inside the longer name's tokens — handles "Rahul" (SMS)
// vs "Rahul Sharma" (contact) or the reverse, without matching on a
// single common word like a shared surname alone.
function isSubsetMatch(a: string[], b: string[]): boolean {
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  if (shorter.length === 0) return false;
  for (let start = 0; start <= longer.length - shorter.length; start++) {
    if (shorter.every((tok, i) => longer[start + i] === tok)) return true;
  }
  return false;
}

// Returns a match only when exactly one contact is a confident candidate —
// if two contacts both plausibly match (e.g. two "Sharma"s), that's
// ambiguous, not confident, and the caller should leave it for manual
// review instead.
export function matchPersonName(personDisplayName: string, contacts: RawContact[]): ContactMatch | null {
  const personKey = normalizePersonKey(personDisplayName);
  if (!personKey) return null;
  const personTokens = tokens(personKey);

  const candidates = contacts.filter(c => {
    const contactKey = normalizePersonKey(c.name);
    if (!contactKey) return false;
    if (contactKey === personKey) return true;
    return isSubsetMatch(personTokens, tokens(contactKey));
  });

  if (candidates.length !== 1) return null;
  return { contactId: candidates[0].id, contactName: candidates[0].name };
}
