import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth } from '@react-native-firebase/auth';
import { CameraIcon } from 'phosphor-react-native/lib/module/icons/Camera';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { KeyIcon } from 'phosphor-react-native/lib/module/icons/Key';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import AppText from '../components/AppText';
import Card from '../components/Card';
import DetailRow from '../components/DetailRow';
import Field from '../components/Field';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radii, spacing } from '../theme';
import { getProfile, setProfileField, subscribeToProfile } from '../lib/profileStore';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// Photo upload/"use Google account photo" (screens-extra-detail.jsx's own
// BottomSheet flows) need a real image-picker dependency this app doesn't
// have yet — kept as a visual affordance that's honest about not doing
// anything yet, rather than faking a picker.
const stubPhoto = () => showToast('Photo upload isn’t available yet');

// Not a real feature yet (App lock is its own upcoming screen; PIN/2FA
// aren't built at all) — same stub-destination convention used elsewhere
// in Settings for screens this pass doesn't cover.
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[ProfileScreen] nav ->', dest);
};

function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState(getProfile());
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [dob, setDob] = useState(profile.dob);
  const [city, setCity] = useState(profile.city);

  useEffect(
    () =>
      subscribeToProfile(() => {
        const p = getProfile();
        setProfile(p);
        setName(p.name);
        setEmail(p.email);
        setDob(p.dob);
        setCity(p.city);
      }),
    [],
  );

  // Real, verified number from the phone-auth sign-in this app's own
  // onboarding does (SignUpScreen.tsx) — Firebase persists the session
  // natively, so it's available here without this app storing it itself.
  const phoneNumber = getAuth().currentUser?.phoneNumber;

  const commit = (field: 'name' | 'email' | 'dob' | 'city', value: string) => {
    if (profile[field] === value) return;
    setProfileField(field, value);
    showToast('Changes saved');
  };

  const initial = name.trim()[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgBase }} edges={['top', 'bottom']}>
      <ScreenHeader title="Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s5, paddingBottom: spacing.s6 }}>
        <View style={{ alignItems: 'center', paddingVertical: spacing.s3 + 2 }}>
          <View style={{ width: 92, height: 92 }}>
            <View style={{ width: 92, height: 92, borderRadius: radii.pill, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
              <AppText weight="bold" style={{ fontSize: 36, color: colors.navy }}>
                {initial}
              </AppText>
            </View>
            <Pressable
              accessibilityLabel="Change photo"
              onPress={stubPhoto}
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 32,
                height: 32,
                borderRadius: radii.pill,
                backgroundColor: colors.navy,
                borderWidth: 3,
                borderColor: colors.bgBase,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CameraIcon size={14} color={colors.fgOnDark} />
            </Pressable>
          </View>
          <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: spacing.s2 + 2 }}>Tap to change photo</AppText>
        </View>

        <Field label="Full name" value={name} placeholder="Your name" onChangeText={setName} onBlur={() => commit('name', name)} />
        <Field label="Email" value={email} placeholder="you@email.com" keyboardType="email-address" onChangeText={setEmail} onBlur={() => commit('email', email)} />
        <Field
          label="Mobile"
          value={phoneNumber ?? 'Not verified'}
          onChangeText={() => {}}
          editable={false}
          right={phoneNumber ? <CheckCircleIcon size={16} color={colors.income} weight="fill" /> : undefined}
        />
        <Field label="Date of birth" value={dob} placeholder="12 Aug 1996" onChangeText={setDob} onBlur={() => commit('dob', dob)} />
        <Field label="City" value={city} placeholder="Bengaluru, KA" onChangeText={setCity} onBlur={() => commit('city', city)} />

        <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginTop: spacing.s2, marginBottom: spacing.s2 }}>
          Account
        </AppText>
        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
          <DetailRow icon={KeyIcon} label="Change PIN" chevron onPress={() => stubNav('change-pin')} />
          <DetailRow icon={ShieldCheckIcon} label="Two-factor auth" chevron onPress={() => stubNav('two-factor')}>
            Off
          </DetailRow>
          <DetailRow icon={TrashIcon} iconColor={colors.expense} iconBg={colors.expenseBg} label="Delete account" labelColor={colors.expense} last chevron onPress={() => stubNav('delete-account')} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;
