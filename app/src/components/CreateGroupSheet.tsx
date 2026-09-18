import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import Button from './Button';
import ContactAvatar from './ContactAvatar';
import Field from './Field';
import SelectIndicator from './SelectIndicator';
import { colors, radii, spacing } from '../theme';
import { GROUP_ICON_IDS, GROUP_ICONS } from '../lib/groupIcons';
import { getFriends, addGroup, type Group } from '../lib/friendsStore';
import { showToast } from '../lib/toast';

export interface CreateGroupSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (group: Group) => void;
}

// Ported from Dhan App 2/screens-split.jsx's CreateGroupSheet. Unlike
// several other sheets in this app, the reference's own onCreate is
// already wired all the way through (app.jsx really appends to its
// `groups` state) — ported the same way, against src/lib/friendsStore.ts.
function CreateGroupSheet({ open, onClose, onCreated }: CreateGroupSheetProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(GROUP_ICON_IDS[0]);
  const [members, setMembers] = useState<string[]>([]);
  const friends = getFriends();

  useEffect(() => {
    if (!open) return;
    setName('');
    setIcon(GROUP_ICON_IDS[0]);
    setMembers([]);
  }, [open]);

  const toggle = (id: string) => setMembers(m => (m.includes(id) ? m.filter(x => x !== id) : [...m, id]));

  const create = () => {
    if (!name.trim() || !members.length) return;
    const group: Group = { id: `g${Date.now().toString(36)}`, name: name.trim(), icon, members };
    addGroup(group);
    showToast('Group created');
    // Close the sheet's own Modal before navigating into the new group —
    // matching app.jsx's own ordering (closeSheet() before setView("group")),
    // and avoiding a navigate() firing while this Modal is still visible.
    onClose();
    onCreated?.(group);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="New group">
      <Field label="Group name" value={name} placeholder="Goa trip" onChangeText={setName} />

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>Icon</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 }}>
        {GROUP_ICON_IDS.map(id => {
          const Icon = GROUP_ICONS[id];
          const on = icon === id;
          return (
            <Pressable
              key={id}
              onPress={() => setIcon(id)}
              style={{ width: 44, height: 44, borderRadius: radii.input, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: on ? colors.navy : colors.borderSubtle, backgroundColor: on ? colors.navy : 'transparent' }}
            >
              <Icon size={18} color={on ? colors.fgOnDark : colors.fg2} />
            </Pressable>
          );
        })}
      </View>

      <AppText style={{ fontSize: 12, color: colors.fg3, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        Add members{members.length ? ` · ${members.length} selected` : ''}
      </AppText>
      <ScrollView style={{ maxHeight: 220, marginBottom: spacing.s4 }}>
        {friends.map((f, i, arr) => (
          <Pressable
            key={f.id}
            onPress={() => toggle(f.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3, paddingVertical: spacing.s3, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}
          >
            <SelectIndicator on={members.includes(f.id)} />
            <ContactAvatar f={f} size={32} fontSize={12} />
            <AppText style={{ fontSize: 14, color: colors.fg2, flex: 1 }} numberOfLines={1}>
              {f.name}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ gap: spacing.s2 }}>
        <Button variant="primary" size="lg" full disabled={!name.trim() || !members.length} onPress={create}>
          Create group
        </Button>
        <Button variant="ghost" full onPress={onClose}>
          Cancel
        </Button>
      </View>
    </BottomSheet>
  );
}

export default CreateGroupSheet;
