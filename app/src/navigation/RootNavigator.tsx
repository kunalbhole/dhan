import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TxnDetailScreen from '../screens/TxnDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import BillsScreen from '../screens/BillsScreen';
import BillDetailScreen from '../screens/BillDetailScreen';
import BackupSettingsScreen from '../screens/BackupSettingsScreen';
import SplitsScreen from '../screens/SplitsScreen';
import FriendDetailScreen from '../screens/FriendDetailScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import GoalsScreen from '../screens/GoalsScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AppLockScreen from '../screens/AppLockScreen';
import SmsSourcesScreen from '../screens/SmsSourcesScreen';
import NotifSettingsScreen from '../screens/NotifSettingsScreen';
import CurrencyConverterScreen from '../screens/CurrencyConverterScreen';
import LanguageScreen from '../screens/LanguageScreen';
import CurrencyScreen from '../screens/CurrencyScreen';
import AppearanceScreen from '../screens/AppearanceScreen';
import ExportDataScreen from '../screens/ExportDataScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import LinkedAccountsScreen from '../screens/LinkedAccountsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutDhanScreen from '../screens/AboutDhanScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import type { Bill } from '../lib/bills';
import SplashScreen from '../screens/onboarding/SplashScreen';
import RestorePromptScreen from '../screens/onboarding/RestorePromptScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import SignUpScreen from '../screens/onboarding/SignUpScreen';
import PermissionsScreen from '../screens/onboarding/PermissionsScreen';
import LinkBankScreen from '../screens/onboarding/LinkBankScreen';
import IncomeSetupScreen from '../screens/onboarding/IncomeSetupScreen';
import FrameworkScreen from '../screens/onboarding/FrameworkScreen';
import type { StoredTransaction } from '../lib/db';

// Mirrors app.jsx's FLOW chain: splash -> onboarding -> signup -> permissions
// -> linkbank -> income -> framework -> home. Framework is the last
// onboarding step; every screen now routes to a real next screen.
export type RootStackParamList = {
  Splash: undefined;
  // Fresh install / new device only (Splash routes here instead of
  // Onboarding when !hasAccount()) — "Restore from Google Drive" vs
  // "Start fresh". See src/lib/backupService.ts.
  Restore: undefined;
  Onboarding: undefined;
  SignUp: undefined;
  Permissions: undefined;
  LinkBank: undefined;
  IncomeSetup: undefined;
  Framework: undefined;
  Home: undefined;
  // Carries the tapped row's full record rather than just an id — every
  // caller (Home's recent list today, Transactions/Uncategorised/Bills
  // later) already has the StoredTransaction in hand, so this avoids an
  // extra db round-trip on every open.
  TxnDetail: { transaction: StoredTransaction };
  // Reached via AppHeader's D-logo ("Menu") button — confirmed against
  // screens-main.jsx's `onMenu={() => nav?.("more")}` and app.jsx's
  // `nav("more")` -> `setView("settings")`.
  Settings: undefined;
  // Reached via AppHeader's search icon (`onSearch`) — confirmed against
  // screens-main.jsx's `onSearch={() => nav?.("search")}`.
  Search: undefined;
  // Reached via AppHeader's bell icon (`onNotify`) — confirmed against
  // screens-main.jsx's `onNotify={() => nav?.("notifications")}`.
  Notifications: undefined;
  // The "Txns" bottom-nav tab (screens-main.jsx's TransactionsScreen).
  Transactions: undefined;
  // The "Budget" bottom-nav tab (screens-main.jsx's BudgetScreen).
  Budget: undefined;
  // The "Bills" bottom-nav tab (screens-main.jsx's BillsScreen).
  Bills: undefined;
  BillDetail: { bill: Bill };
  // Reached from Settings' "Data & privacy" section.
  BackupSettings: undefined;
  // The "Split" bottom-nav tab (screens-split.jsx's SplitsScreen).
  Splits: undefined;
  FriendDetail: { friendId: string };
  GroupDetail: { groupId: string };
  // Reached from Home's "Savings goals" card and Settings' "Savings goals"
  // row (screens-extra-detail.jsx's GoalsScreen).
  Goals: undefined;
  // Reached from Home's insights teaser and Settings' "Insights" row
  // (insights.jsx's InsightsScreen).
  Insights: undefined;
  // Reached from Settings' own identity card and its "Profile" row
  // (screens-extra-detail.jsx's ProfileEditScreen).
  Profile: undefined;
  // Reached from Settings' "App lock" row (settings-sub.jsx's
  // AppLockScreen).
  AppLock: undefined;
  // Reached from Settings' "SMS sources" row (settings-sub.jsx's
  // SmsSourcesScreen).
  SmsSources: undefined;
  // Reached from Settings' "Notifications" row (settings-sub.jsx's
  // NotifSettingsScreen) — distinct from the bell-icon "Notifications"
  // inbox route above, matching the reference's own two separate screens.
  NotifSettings: undefined;
  // Reached from Settings' "Currency converter" row
  // (currency-converter.jsx's CurrencyConverterScreen).
  CurrencyConverter: undefined;
  // Reached from Settings' "Language" row (settings-sub.jsx's
  // LanguageScreen).
  Language: undefined;
  // Reached from Settings' "Currency" row (settings-sub.jsx's
  // CurrencyScreen) — the base-currency preference, distinct from the
  // CurrencyConverter route above.
  Currency: undefined;
  // Reached from Settings' "Appearance" row (settings-sub.jsx's
  // AppearanceScreen).
  Appearance: undefined;
  // Reached from Settings' "Export data" row (settings-sub.jsx's
  // ExportDataScreen).
  ExportData: undefined;
  // Reached from Settings' "Privacy settings" row (settings-sub.jsx's
  // PrivacySettingsScreen).
  PrivacySettings: undefined;
  LinkedAccounts: undefined;
  HelpSupport: undefined;
  AboutDhan: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  ContactSupport: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Restore" component={RestorePromptScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
        <Stack.Screen name="LinkBank" component={LinkBankScreen} />
        <Stack.Screen name="IncomeSetup" component={IncomeSetupScreen} />
        <Stack.Screen name="Framework" component={FrameworkScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TxnDetail" component={TxnDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="Bills" component={BillsScreen} />
        <Stack.Screen name="BillDetail" component={BillDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="BackupSettings" component={BackupSettingsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Splits" component={SplitsScreen} />
        <Stack.Screen name="FriendDetail" component={FriendDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Goals" component={GoalsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Insights" component={InsightsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="AppLock" component={AppLockScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="SmsSources" component={SmsSourcesScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="NotifSettings" component={NotifSettingsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CurrencyConverter" component={CurrencyConverterScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Language" component={LanguageScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Currency" component={CurrencyScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ExportData" component={ExportDataScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="LinkedAccounts" component={LinkedAccountsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="AboutDhan" component={AboutDhanScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ContactSupport" component={ContactSupportScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
