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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
