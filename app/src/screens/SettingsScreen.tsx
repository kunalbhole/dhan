import { useEffect, useState, type ComponentType } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { XIcon } from 'phosphor-react-native/lib/module/icons/X';
import { ChartLineUpIcon } from 'phosphor-react-native/lib/module/icons/ChartLineUp';
import { TargetIcon } from 'phosphor-react-native/lib/module/icons/Target';
import { CurrencyCircleDollarIcon } from 'phosphor-react-native/lib/module/icons/CurrencyCircleDollar';
import { TranslateIcon } from 'phosphor-react-native/lib/module/icons/Translate';
import { GlobeIcon } from 'phosphor-react-native/lib/module/icons/Globe';
import { MoonIcon } from 'phosphor-react-native/lib/module/icons/Moon';
import { BellIcon } from 'phosphor-react-native/lib/module/icons/Bell';
import { ChatCenteredTextIcon } from 'phosphor-react-native/lib/module/icons/ChatCenteredText';
import { DownloadSimpleIcon } from 'phosphor-react-native/lib/module/icons/DownloadSimple';
import { CloudArrowUpIcon } from 'phosphor-react-native/lib/module/icons/CloudArrowUp';
import { LockKeyIcon } from 'phosphor-react-native/lib/module/icons/LockKey';
import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import { UserCircleIcon } from 'phosphor-react-native/lib/module/icons/UserCircle';
import { CreditCardIcon } from 'phosphor-react-native/lib/module/icons/CreditCard';
import { LifebuoyIcon } from 'phosphor-react-native/lib/module/icons/Lifebuoy';
import { SignOutIcon } from 'phosphor-react-native/lib/module/icons/SignOut';
import { InfoIcon } from 'phosphor-react-native/lib/module/icons/Info';
import { FileTextIcon } from 'phosphor-react-native/lib/module/icons/FileText';
import { ScrollIcon } from 'phosphor-react-native/lib/module/icons/Scroll';
import { TagIcon } from 'phosphor-react-native/lib/module/icons/Tag';
import { SparkleIcon } from 'phosphor-react-native/lib/module/icons/Sparkle';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import DetailRow from '../components/DetailRow';
import BottomSheet from '../components/BottomSheet';
import TabBar, { type TabId } from '../components/TabBar';
import DhanMark from '../assets/DhanMark';
import { colors, radii, spacing } from '../theme';
import { clearOnboarded, clearUserPrefs } from '../lib/account';
import { getProfile, subscribeToProfile } from '../lib/profileStore';
import { getAppLockSettings, subscribeToAppLock } from '../lib/appLockStore';
import { getAllTransactions, subscribeToTransactionsChanged } from '../lib/db';
import { getNotificationPrefs, subscribeToNotificationPrefs } from '../lib/notificationsStore';
import { getLanguage, subscribeToLanguage, type LanguageId } from '../lib/languageStore';
import { getIsPlus, setIsPlus, subscribeToPlan } from '../lib/planStore';
import { getActiveCurrencies, subscribeToCurrencyPrefs, type CurrencyCode } from '../lib/currencyPrefStore';
import { getAppearance, subscribeToAppearance } from '../lib/appearanceStore';
import { getLinkedAccounts, subscribeLinkedAccounts } from '../lib/linkedAccountsStore';
import type { PhosphorIconProps } from '../components/IconChip';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

// Reference-hardcoded defaults (screens-settings.jsx's `prefs = {}` fallback
// values) — this app has no preferences-storage layer yet, same status as
// HomeScreen's hardcoded balance/budget figures. App lock, SMS sources,
// Notifications and Language are the exceptions — their row values are
// computed live from their own stores below.
const LANGUAGE_LABELS: Record<LanguageId, string> = { en: 'English', hi: 'हिंदी', mr: 'मराठी', ta: 'தமிழ்' };
// No Arabic glyph for AED — see CurrencyScreen.tsx's own comment on why
// (Poppins has no Arabic coverage, so it'd render as broken letterforms).
const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { INR: '₹', USD: '$', AED: '', GBP: '£' };

interface SettingsItem {
  icon: ComponentType<PhosphorIconProps>;
  label: string;
  value?: string;
  go?: string;
  danger?: boolean;
  action?: 'signout' | 'backup';
  static?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const SECTIONS: SettingsSection[] = [
  {
    title: 'Explore',
    items: [
      { icon: ChartLineUpIcon, label: 'Insights', go: 'insights' },
      { icon: TargetIcon, label: 'Savings goals', go: 'goals' },
      { icon: CurrencyCircleDollarIcon, label: 'Currency converter', go: 'converter' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: TranslateIcon, label: 'Language', go: 'language' },
      { icon: GlobeIcon, label: 'Currency', go: 'currency' },
      { icon: MoonIcon, label: 'Appearance', go: 'appearance' },
      { icon: BellIcon, label: 'Notifications', go: 'notif-settings' },
    ],
  },
  {
    title: 'Data & privacy',
    items: [
      { icon: ChatCenteredTextIcon, label: 'SMS sources', go: 'sms-sources' },
      { icon: CloudArrowUpIcon, label: 'Backup & restore', action: 'backup' },
      { icon: DownloadSimpleIcon, label: 'Export data', go: 'export' },
      { icon: LockKeyIcon, label: 'Privacy settings', go: 'privacy-settings' },
      { icon: ShieldCheckIcon, label: 'App lock', go: 'app-lock' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: UserCircleIcon, label: 'Profile', go: 'profile' },
      { icon: CreditCardIcon, label: 'Linked accounts', value: '3 linked', go: 'linked' },
      { icon: LifebuoyIcon, label: 'Help & support', go: 'help' },
      { icon: SignOutIcon, label: 'Sign out', danger: true, action: 'signout' },
    ],
  },
  {
    title: 'App info',
    items: [
      { icon: InfoIcon, label: 'About Dhan', go: 'about' },
      { icon: FileTextIcon, label: 'Terms of service', go: 'terms' },
      { icon: ScrollIcon, label: 'Privacy policy', go: 'privacy-policy' },
      { icon: TagIcon, label: 'Version', value: '2.4.1', static: true },
    ],
  },
];

// Everything below is a real screen the reference links to but this app
// hasn't built yet (Insights, Goals, the settings sub-pages, Profile,
// Paywall, legal docs, ...) — stubbed the same way HomeScreen's `stubNav`
// stubs its own not-yet-built destinations, so this screen is visually and
// interactively complete without crashing on a route that doesn't exist.
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[SettingsScreen] nav ->', dest);
};

function SettingsScreen({ navigation }: Props) {
  const [isPlus, setIsPlusState] = useState(getIsPlus());
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [profile, setProfile] = useState(getProfile());
  const [appLock, setAppLock] = useState(getAppLockSettings());
  const [senderCount, setSenderCount] = useState(0);
  const [notifPrefs, setNotifPrefs] = useState(getNotificationPrefs());
  const [language, setLanguageState] = useState(getLanguage());
  const [activeCurrencies, setActiveCurrencies] = useState(getActiveCurrencies());
  const [appearance, setAppearanceState] = useState(getAppearance());
  const [linkedAccounts, setLinkedAccountsState] = useState(getLinkedAccounts());

  useEffect(() => subscribeToProfile(() => setProfile(getProfile())), []);
  useEffect(() => subscribeToAppLock(() => setAppLock({ ...getAppLockSettings() })), []);
  useEffect(() => subscribeToPlan(() => setIsPlusState(getIsPlus())), []);
  useEffect(() => subscribeToCurrencyPrefs(() => setActiveCurrencies(new Set(getActiveCurrencies()))), []);
  useEffect(() => subscribeToAppearance(() => setAppearanceState(getAppearance())), []);
  useEffect(() => subscribeToNotificationPrefs(() => setNotifPrefs({ ...getNotificationPrefs() })), []);
  useEffect(() => subscribeToLanguage(() => setLanguageState(getLanguage())), []);
  useEffect(() => subscribeLinkedAccounts(() => setLinkedAccountsState([...getLinkedAccounts()])), []);

  useEffect(() => {
    const load = () => {
      getAllTransactions().then(txns => {
        setSenderCount(new Set(txns.filter(t => t.sender).map(t => t.sender)).size);
      });
    };
    load();
    return subscribeToTransactionsChanged(load);
  }, []);

  const appLockValue = appLock.enabled ? (appLock.method === 'faceid' ? 'Face ID' : 'PIN') : 'None';
  const smsSourcesValue = senderCount === 0 ? 'None yet' : `${senderCount} source${senderCount === 1 ? '' : 's'}`;
  const notifOnCount = Object.values(notifPrefs).filter(Boolean).length;
  const notifValue = `${notifOnCount} on`;
  const languageValue = LANGUAGE_LABELS[language];
  const currencyList = [...activeCurrencies];
  const currencyValue = currencyList.length > 1 ? `${currencyList.length} active` : `${CURRENCY_SYMBOLS[currencyList[0]]} ${currencyList[0]}`.trim();

  const handleSignOut = async () => {
    setSignOutOpen(false);
    await clearOnboarded();
    await clearUserPrefs();
    navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
  };

  // Settings/More sits in the same root stack as every other tab's screen
  // (see RootNavigator.tsx) — there's no separate tab navigator to escape,
  // so each id just needs its own real destination the way BillsScreen's/
  // TransactionsScreen's own handleTab already does. This previously only
  // handled 'home' and stubbed the rest, which is why Txns/Budget/Bills/
  // Split did nothing when tapped from here.
  const handleTab = (id: TabId) => {
    if (id === 'home') navigation.navigate('Home');
    else if (id === 'txn') navigation.navigate('Transactions');
    else if (id === 'budget') navigation.navigate('Budget');
    else if (id === 'bills') navigation.navigate('Bills');
    else if (id === 'split') navigation.navigate('Splits');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingTop: spacing.s4, paddingBottom: spacing.s6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.s4 }}>
          <DhanMark size={32} />
          <Pressable
            accessibilityLabel="Close"
            onPress={() => navigation.navigate('Home')}
            style={{ width: 40, height: 40, borderRadius: radii.control, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}
          >
            <XIcon size={20} color={colors.fg1} />
          </Pressable>
        </View>

        {/* Identity — real name from profileStore.ts (set at sign-up,
            editable on ProfileScreen) rather than a hardcoded "Priya
            Sharma"; falls back to a generic placeholder until it's set. */}
        <Card onPress={() => navigation.navigate('Profile')} style={{ padding: spacing.s4, marginBottom: spacing.s4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            {profile.avatarUri ? (
              <Image
                source={{ uri: profile.avatarUri }}
                style={{ width: 48, height: 48, borderRadius: radii.pill }}
              />
            ) : (
              <View style={{ width: 48, height: 48, borderRadius: radii.pill, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
                <AppText weight="bold" style={{ fontSize: 18, color: colors.navy }}>
                  {profile.name.trim()[0]?.toUpperCase() ?? '?'}
                </AppText>
              </View>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText weight="semibold" style={{ fontSize: 15, color: colors.navy }}>
                {profile.name || 'Add your name'}
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{isPlus ? 'Dhan Plus member' : 'Free plan'}</AppText>
            </View>
            <CaretRightIcon size={14} color={colors.fg4} />
          </View>
        </Card>

        {/* Plus */}
        <Pressable onPress={() => (isPlus ? setIsPlus(false) : stubNav('paywall'))}>
          <View
            style={{
              backgroundColor: colors.navy,
              borderRadius: radii.card,
              padding: spacing.s4,
              marginBottom: spacing.s4,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: radii.input, backgroundColor: 'rgba(201,168,76,.18)', alignItems: 'center', justifyContent: 'center' }}>
              <SparkleIcon size={18} color={colors.gold} weight="fill" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText weight="semibold" style={{ fontSize: 14, color: colors.fgOnDark }}>
                {isPlus ? 'Dhan Plus is active' : 'Upgrade to Dhan Plus'}
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.goldSoft, marginTop: 2 }}>
                {isPlus ? 'Tap to switch back to Free' : 'Splits, AI insights, multi-currency'}
              </AppText>
            </View>
            <CaretRightIcon size={14} color="rgba(255,255,255,.6)" />
          </View>
        </Pressable>

        {SECTIONS.map(section => (
          <View key={section.title} style={{ marginBottom: spacing.s4 }}>
            <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.11, marginHorizontal: 4, marginBottom: spacing.s2 }}>
              {section.title}
            </AppText>
            <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
              {section.items.map((item, i, arr) => (
                <DetailRow
                  key={item.label}
                  icon={item.icon}
                  iconColor={item.danger ? colors.expense : colors.navy}
                  iconBg={item.danger ? colors.expenseBg : colors.bgSurface}
                  label={item.label}
                  labelColor={item.danger ? colors.expense : colors.fg2}
                  last={i === arr.length - 1}
                  chevron={!item.static}
                  onPress={
                    item.static
                      ? undefined
                      : () => {
                          if (item.action === 'signout') setSignOutOpen(true);
                          else if (item.action === 'backup') navigation.navigate('BackupSettings');
                          else if (item.go === 'goals') navigation.navigate('Goals');
                          else if (item.go === 'insights') navigation.navigate('Insights');
                          else if (item.go === 'profile') navigation.navigate('Profile');
                          else if (item.go === 'app-lock') navigation.navigate('AppLock');
                          else if (item.go === 'sms-sources') navigation.navigate('SmsSources');
                          else if (item.go === 'notif-settings') navigation.navigate('NotifSettings');
                          else if (item.go === 'converter') navigation.navigate('CurrencyConverter');
                          else if (item.go === 'language') navigation.navigate('Language');
                          else if (item.go === 'currency') navigation.navigate('Currency');
                          else if (item.go === 'appearance') navigation.navigate('Appearance');
                          else if (item.go === 'export') navigation.navigate('ExportData');
                          else if (item.go === 'privacy-settings') navigation.navigate('PrivacySettings');
                          else if (item.go === 'linked') navigation.navigate('LinkedAccounts');
                          else if (item.go === 'help') navigation.navigate('HelpSupport');
                          else if (item.go === 'about') navigation.navigate('AboutDhan');
                          else if (item.go === 'terms') navigation.navigate('TermsOfService');
                          else if (item.go === 'privacy-policy') navigation.navigate('PrivacyPolicy');
                          else stubNav(item.go ?? '');
                        }
                  }
                >
                  {item.go === 'app-lock'
                    ? appLockValue
                    : item.go === 'sms-sources'
                      ? smsSourcesValue
                      : item.go === 'notif-settings'
                        ? notifValue
                        : item.go === 'language'
                          ? languageValue
                          : item.go === 'currency'
                            ? currencyValue
                            : item.go === 'appearance'
                              ? appearance
                              : item.go === 'linked'
                                ? `${linkedAccounts.length} linked`
                                : (item.value ?? '')}
                </DetailRow>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>

      <TabBar active={null} onChange={handleTab} />

      <BottomSheet open={signOutOpen} onClose={() => setSignOutOpen(false)} title="Sign out of Dhan?">
        <AppText style={{ fontSize: 13, color: colors.fg2, lineHeight: 20, marginBottom: spacing.s4 }}>
          Your data stays encrypted on this device. You&apos;ll need your PIN or Face ID to sign back in.
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.s2 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" full onPress={() => setSignOutOpen(false)}>
              Stay
            </Button>
          </View>
          <Pressable
            onPress={handleSignOut}
            style={{ flex: 1, height: 48, borderRadius: radii.control, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.expense }}
          >
            <AppText weight="semibold" style={{ fontSize: 14, color: colors.fgOnDark }}>
              Sign out
            </AppText>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

export default SettingsScreen;
