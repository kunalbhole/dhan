import { useEffect, useState } from 'react';
import { Image, NativeModules, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth } from '@react-native-firebase/auth';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CameraIcon } from 'phosphor-react-native/lib/module/icons/Camera';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { GoogleLogoIcon } from 'phosphor-react-native/lib/module/icons/GoogleLogo';
import { ImageIcon } from 'phosphor-react-native/lib/module/icons/Image';
import { KeyIcon } from 'phosphor-react-native/lib/module/icons/Key';
import { LinkIcon } from 'phosphor-react-native/lib/module/icons/Link';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import AppText from '../components/AppText';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import DetailRow from '../components/DetailRow';
import Field from '../components/Field';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radii, spacing } from '../theme';
import { getProfile, setAvatarUri, setProfileField, subscribeToProfile } from '../lib/profileStore';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const DEFAULT_GOOGLE_AVATAR = 'https://lh3.googleusercontent.com/a/default-user=s120-p';

const SAMPLE_PHOTOS = [
  { name: 'Portrait 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { name: 'Portrait 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { name: 'Portrait 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
];

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

  const [photoSheet, setPhotoSheet] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [preview, setPreview] = useState<{ src: string; source: string } | null>(null);

  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);
  const [googlePhotoUrl, setGooglePhotoUrl] = useState<string>(DEFAULT_GOOGLE_AVATAR);

  useEffect(() => {
    try {
      const user = getAuth().currentUser;
      setPhoneNumber(user?.phoneNumber ?? undefined);
      if (user?.photoURL) {
        setGooglePhotoUrl(user.photoURL);
      }
    } catch {
      // Firebase auth optional
    }
  }, []);

  useEffect(() => {
    return subscribeToProfile(() => {
      const p = getProfile();
      setProfile(p);
      setName(p.name);
      setEmail(p.email);
      setDob(p.dob);
      setCity(p.city);
    });
  }, []);

  const commit = (field: 'name' | 'email' | 'dob' | 'city', value: string) => {
    if (profile[field] === value) return;
    setProfileField(field, value);
    showToast('Changes saved');
  };

  const initial = name.trim()[0]?.toUpperCase() ?? '?';

  const hasNativeImagePicker = Boolean(
    NativeModules.ImagePickerManager || NativeModules.RNImagePicker,
  );

  const handlePickFromLibrary = () => {
    if (hasNativeImagePicker) {
      setPhotoSheet(false);
      try {
        launchImageLibrary(
          {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 600,
            maxHeight: 600,
          },
          res => {
            if (res.didCancel || res.errorCode) return;
            const uri = res.assets?.[0]?.uri;
            if (uri) {
              setPreview({ src: uri, source: 'Photo Library' });
            }
          },
        );
      } catch {
        setShowUrlInput(true);
        showToast('Please enter photo link or choose below');
      }
    } else {
      setShowUrlInput(true);
      showToast('Select or enter photo link below');
    }
  };

  const handleTakePhoto = () => {
    if (hasNativeImagePicker) {
      setPhotoSheet(false);
      try {
        launchCamera(
          {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 600,
            maxHeight: 600,
          },
          res => {
            if (res.didCancel || res.errorCode) return;
            const uri = res.assets?.[0]?.uri;
            if (uri) {
              setPreview({ src: uri, source: 'Camera' });
            }
          },
        );
      } catch {
        setShowUrlInput(true);
        showToast('Please enter photo link or choose below');
      }
    } else {
      setShowUrlInput(true);
      showToast('Select or enter photo link below');
    }
  };

  const handleUseGooglePhoto = () => {
    setPhotoSheet(false);
    setPreview({ src: googlePhotoUrl, source: 'Google account' });
  };

  const handleApplyCustomUrl = (urlToUse?: string) => {
    const target = urlToUse || customUrl.trim();
    if (!target) return;
    setPhotoSheet(false);
    setShowUrlInput(false);
    setPreview({ src: target, source: 'Image Link' });
  };

  const handleRemovePhoto = () => {
    setPhotoSheet(false);
    setAvatarUri(null);
    showToast('Photo removed');
  };

  const handleConfirmPhoto = () => {
    if (preview?.src) {
      setAvatarUri(preview.src);
      showToast('Profile photo updated');
    }
    setPreview(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgBase }} edges={['top', 'bottom']}>
      <ScreenHeader title="Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s5, paddingBottom: spacing.s6 }}>
        {/* Profile Avatar Section */}
        <View style={{ alignItems: 'center', paddingVertical: spacing.s3 + 2 }}>
          <Pressable onPress={() => setPhotoSheet(true)} style={{ width: 92, height: 92 }}>
            {profile.avatarUri ? (
              <Image
                source={{ uri: profile.avatarUri }}
                style={{ width: 92, height: 92, borderRadius: radii.pill }}
              />
            ) : (
              <View style={{ width: 92, height: 92, borderRadius: radii.pill, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
                <AppText weight="bold" style={{ fontSize: 36, color: colors.navy }}>
                  {initial}
                </AppText>
              </View>
            )}
            <View
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
            </View>
          </Pressable>
          <Pressable onPress={() => setPhotoSheet(true)}>
            <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: spacing.s2 + 2 }}>
              Tap to change photo
            </AppText>
          </Pressable>
        </View>

        {/* Profile Fields */}
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

      {/* Photo Option Sheet */}
      <BottomSheet open={photoSheet} onClose={() => setPhotoSheet(false)} title="Profile photo">
        <View style={{ gap: spacing.s2 }}>
          {/* Option 1: Upload from library */}
          <Pressable
            onPress={handlePickFromLibrary}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.s4,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderSubtle,
            }}
          >
            <IconChip icon={ImageIcon} color={colors.navy} bg={colors.bgSurface} />
            <View style={{ flex: 1 }}>
              <AppText weight="semibold" style={{ fontSize: 14, color: colors.fg1 }}>
                Choose from photo library
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
                Upload a picture from your device
              </AppText>
            </View>
            <CaretRightIcon size={14} color={colors.fg4} />
          </Pressable>

          {/* Option 2: Take photo with camera */}
          <Pressable
            onPress={handleTakePhoto}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.s4,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderSubtle,
            }}
          >
            <IconChip icon={CameraIcon} color={colors.navy} bg={colors.bgSurface} />
            <View style={{ flex: 1 }}>
              <AppText weight="semibold" style={{ fontSize: 14, color: colors.fg1 }}>
                Take a photo
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
                Use your device camera
              </AppText>
            </View>
            <CaretRightIcon size={14} color={colors.fg4} />
          </Pressable>

          {/* Option 3: Google Account Photo */}
          <Pressable
            onPress={handleUseGooglePhoto}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.s4,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderSubtle,
            }}
          >
            <IconChip icon={GoogleLogoIcon} color={colors.navy} bg={colors.bgSurface} />
            <View style={{ flex: 1 }}>
              <AppText weight="semibold" style={{ fontSize: 14, color: colors.fg1 }}>
                Use Google account photo
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
                {email || 'Sync from account'}
              </AppText>
            </View>
            <CaretRightIcon size={14} color={colors.fg4} />
          </Pressable>

          {/* Option 4: Paste / select photo link */}
          <Pressable
            onPress={() => setShowUrlInput(!showUrlInput)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.s4,
              paddingVertical: 14,
              borderBottomWidth: profile.avatarUri ? 1 : 0,
              borderBottomColor: colors.borderSubtle,
            }}
          >
            <IconChip icon={LinkIcon} color={colors.navy} bg={colors.bgSurface} />
            <View style={{ flex: 1 }}>
              <AppText weight="semibold" style={{ fontSize: 14, color: colors.fg1 }}>
                Paste photo URL
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
                Link to any online profile picture
              </AppText>
            </View>
            <CaretRightIcon size={14} color={colors.fg4} />
          </Pressable>

          {showUrlInput ? (
            <View style={{ gap: spacing.s2, marginTop: spacing.s2, paddingBottom: spacing.s2 }}>
              <Field
                placeholder="https://example.com/photo.jpg"
                value={customUrl}
                onChangeText={setCustomUrl}
              />
              <Button variant="primary" size="md" onPress={() => handleApplyCustomUrl()}>
                Preview link
              </Button>

              <AppText style={{ fontSize: 11, color: colors.fg3, marginTop: spacing.s2 }}>
                Or select a sample photo:
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.s2 }}>
                {SAMPLE_PHOTOS.map((p, idx) => (
                  <Pressable key={idx} onPress={() => handleApplyCustomUrl(p.url)}>
                    <Image source={{ uri: p.url }} style={{ width: 48, height: 48, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.borderDefault }} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Option 5: Remove Photo */}
          {profile.avatarUri ? (
            <Pressable
              onPress={handleRemovePhoto}
              style={{
                marginTop: spacing.s3,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                borderRadius: radii.control,
                alignItems: 'center',
              }}
            >
              <AppText weight="semibold" style={{ color: colors.expense, fontSize: 14 }}>
                Remove current photo
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </BottomSheet>

      {/* Preview / Confirm Sheet */}
      <BottomSheet open={!!preview} onClose={() => setPreview(null)} title="Use this photo?">
        <View style={{ alignItems: 'center', gap: spacing.s3, paddingVertical: spacing.s2 }}>
          {preview?.src ? (
            <Image
              source={{ uri: preview.src }}
              style={{ width: 120, height: 120, borderRadius: radii.pill, borderWidth: 3, borderColor: colors.borderDefault }}
            />
          ) : null}
          <AppText style={{ fontSize: 12, color: colors.fg3 }}>From {preview?.source}</AppText>
          <View style={{ flexDirection: 'row', gap: spacing.s3, width: '100%', marginTop: spacing.s2 }}>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" full onPress={() => setPreview(null)}>
                Cancel
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="primary" full onPress={handleConfirmPhoto}>
                Use photo
              </Button>
            </View>
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

export default ProfileScreen;
