// Backs the "Match people" screen: which SMS-derived people still need a
// decision, and recording that decision (link a contact, mark "not a
// person", or skip) so it's never asked again for that same name.
import { getUnmatchedPeopleSync, upsertPersonSync, type PersonAggregate } from './db';
import { hasContactsPermission } from '../native/contacts';
import { loadContacts, matchPersonName } from './contactMatcher';

export type { PersonAggregate };

export function getReviewQueue(limit = 200): PersonAggregate[] {
  return getUnmatchedPeopleSync(limit);
}

export function confirmContact(personKey: string, contactId: string, contactName: string): void {
  upsertPersonSync(personKey, { contactId, contactName, isPerson: true, matchStatus: 'manual' });
}

export function markNotAPerson(personKey: string): void {
  upsertPersonSync(personKey, { isPerson: false, matchStatus: 'manual' });
}

export function skipPerson(personKey: string): void {
  upsertPersonSync(personKey, { matchStatus: 'skipped' });
}

// Confident, automatic contact links — run once after a scan finishes.
// Anything not confidently matched is simply left alone for the "Match
// people" screen; this never guesses or writes a low-confidence link.
export async function runAutoContactMatch(): Promise<number> {
  const granted = await hasContactsPermission();
  if (!granted) return 0;

  const contacts = await loadContacts();
  if (!contacts.length) return 0;

  const queue = getUnmatchedPeopleSync(500);
  let linked = 0;
  for (const person of queue) {
    const match = matchPersonName(person.displayName, contacts);
    if (match) {
      upsertPersonSync(person.personKey, {
        contactId: match.contactId,
        contactName: match.contactName,
        isPerson: true,
        matchStatus: 'auto',
      });
      linked++;
    }
  }
  return linked;
}
