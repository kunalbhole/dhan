import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UserMinusIcon } from 'phosphor-react-native/lib/module/icons/UserMinus';
import AppText from '../components/AppText';
import BottomSheet from '../components/BottomSheet';
import Card from '../components/Card';
import ContactAvatar from '../components/ContactAvatar';
import Field from '../components/Field';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, radii, spacing } from '../theme';
import { getReviewQueue, confirmContact, markNotAPerson, skipPerson, type PersonAggregate } from '../lib/peopleReview';
import { loadContacts } from '../lib/contactMatcher';
import type { RawContact } from '../native/contacts';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchPeople'>;

function MatchPeopleScreen({ navigation }: Props) {
  const [queue, setQueue] = useState<PersonAggregate[]>(() => getReviewQueue());
  const [contacts, setContacts] = useState<RawContact[]>([]);
  const [pickerFor, setPickerFor] = useState<PersonAggregate | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadContacts().then(setContacts);
  }, []);

  const refresh = () => setQueue(getReviewQueue());

  const handleNotAPerson = (person: PersonAggregate) => {
    markNotAPerson(person.personKey);
    showToast(`Marked "${person.displayName}" as not a person`);
    refresh();
  };

  const handleSkip = (person: PersonAggregate) => {
    skipPerson(person.personKey);
    refresh();
  };

  const handlePickContact = (contact: RawContact) => {
    if (!pickerFor) return;
    confirmContact(pickerFor.personKey, contact.id, contact.name);
    showToast(`Matched to ${contact.name}`);
    setPickerFor(null);
    setQuery('');
    refresh();
  };

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <SettingsSubScreen
      title="Match people"
      onBack={() => navigation.goBack()}
      note="Matching a name to a contact only happens on this device — Dhan never sends your contacts or messages anywhere."
    >
      {queue.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: spacing.s7, gap: spacing.s2 }}>
          <AppText weight="semibold" style={{ fontSize: 15 }}>
            All caught up
          </AppText>
          <AppText style={{ fontSize: 13, color: colors.fg3, textAlign: 'center' }}>
            Every payment has a decision — new ones will show up here as they come in.
          </AppText>
        </View>
      ) : (
        <>
          <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s3 }}>
            Sorted by most payments first
          </AppText>
          {queue.map(person => (
            <Card key={person.personKey} style={{ padding: spacing.s4, marginBottom: spacing.s3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, marginBottom: spacing.s3 }}>
                <ContactAvatar f={{ name: person.displayName }} size={44} fontSize={15} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText weight="semibold" style={{ fontSize: 14 }} numberOfLines={1}>
                    {person.displayName}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
                    {person.txnCount} payment{person.txnCount === 1 ? '' : 's'} · last ₹{Math.abs(person.lastAmount).toLocaleString('en-IN')}
                  </AppText>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
                <Pressable
                  onPress={() => setPickerFor(person)}
                  style={{ flex: 1, height: 36, borderRadius: radii.input, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}
                >
                  <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.fgOnDark }}>
                    Pick contact
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() => handleNotAPerson(person)}
                  style={{ flex: 1, height: 36, borderRadius: radii.input, borderWidth: 1, borderColor: colors.borderDefault, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <UserMinusIcon size={13} color={colors.fg2} />
                  <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.fg2 }}>
                    Not a person
                  </AppText>
                </Pressable>
                <Pressable onPress={() => handleSkip(person)} style={{ height: 36, paddingHorizontal: spacing.s3, alignItems: 'center', justifyContent: 'center' }}>
                  <AppText weight="medium" style={{ fontSize: 12.5, color: colors.fg3 }}>
                    Skip
                  </AppText>
                </Pressable>
              </View>
            </Card>
          ))}
        </>
      )}

      <BottomSheet
        open={!!pickerFor}
        onClose={() => {
          setPickerFor(null);
          setQuery('');
        }}
        title={pickerFor ? `Match "${pickerFor.displayName}"` : undefined}
      >
        <Field placeholder="Search contacts…" value={query} onChangeText={setQuery} />
        <ScrollView style={{ maxHeight: 320, marginTop: spacing.s3 }}>
          {filteredContacts.length === 0 ? (
            <AppText style={{ fontSize: 13, color: colors.fg3, textAlign: 'center', paddingVertical: spacing.s5 }}>
              {contacts.length === 0 ? 'No contacts available.' : 'No matching contacts.'}
            </AppText>
          ) : (
            filteredContacts.map((c, i, arr) => (
              <Pressable
                key={c.id}
                onPress={() => handlePickContact(c)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, paddingVertical: spacing.s3, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}
              >
                <ContactAvatar f={{ name: c.name }} size={32} fontSize={12} />
                <AppText style={{ fontSize: 14, color: colors.fg2, flex: 1 }} numberOfLines={1}>
                  {c.name}
                </AppText>
              </Pressable>
            ))
          )}
        </ScrollView>
      </BottomSheet>
    </SettingsSubScreen>
  );
}

export default MatchPeopleScreen;
