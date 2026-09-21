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
import PlusPaywallScreen from '../screens/PlusPaywallScreen';
import UncategorisedScreen from '../screens/UncategorisedScreen';
import CategoryTxnsScreen from '../screens/CategoryTxnsScreen';
import BudgetEditScreen from '../screens/BudgetEditScreen';
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

export type RootStackParamList = {
  Splash: undefined;
  Restore: undefined;
  Onboarding: undefined;
  SignUp: undefined;
  Permissions: undefined;
  LinkBank: undefined;
  IncomeSetup: undefined;
  Framework: undefined;
  Home: undefined;
  TxnDetail: { id?: string; transaction?: StoredTransaction };
  Settings: undefined;
  Search: undefined;
  Notifications: undefined;
  Transactions: undefined;
  Budget: undefined;
  Bills: undefined;
  BillDetail: { bill: Bill };
  BackupSettings: undefined;
  Splits: undefined;
  FriendDetail: { friendId: string };
  GroupDetail: { groupId: string };
  Goals: undefined;
  Insights: undefined;
  Profile: undefined;
  AppLock: undefined;
  SmsSources: undefined;
  NotifSettings: undefined;
  CurrencyConverter: undefined;
  Language: undefined;
  Currency: undefined;
  Appearance: undefined;
  ExportData: undefined;
  PrivacySettings: undefined;
  LinkedAccounts: undefined;
  HelpSupport: undefined;
  AboutDhan: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  ContactSupport: undefined;
  PlusPaywall: { note?: string } | undefined;
  Uncategorised: undefined;
  CategoryTxns: { category: string };
  BudgetEdit: undefined;
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
        <Stack.Screen name="LinkBank" component={LinkBankScreen} options={{ animation: 'slide_from_right' }} />
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
        <Stack.Screen name="PlusPaywall" component={PlusPaywallScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Uncategorised" component={UncategorisedScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CategoryTxns" component={CategoryTxnsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="BudgetEdit" component={BudgetEditScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
