import { NativeModules } from 'react-native';

export interface RawContact {
  id: string;
  name: string;
}

const { ContactsModule } = NativeModules;

export const hasContactsPermission = (): Promise<boolean> =>
  ContactsModule && ContactsModule.hasPermission ? ContactsModule.hasPermission() : Promise.resolve(false);

// Requesting the permission itself is handled by PermissionsAndroid in
// PermissionsScreen.tsx (a standard runtime permission, unlike SMS — see
// that screen's requestContactsPermission). This module only ever reads,
// once permission is already granted.
export const readContacts = (): Promise<RawContact[]> =>
  ContactsModule && ContactsModule.readContacts ? ContactsModule.readContacts() : Promise.resolve([]);

export default ContactsModule;
