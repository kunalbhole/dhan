import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/onboarding/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import SignUpScreen from '../screens/onboarding/SignUpScreen';
import PermissionsScreen from '../screens/onboarding/PermissionsScreen';
import LinkBankScreen from '../screens/onboarding/LinkBankScreen';
import IncomeSetupScreen from '../screens/onboarding/IncomeSetupScreen';
import FrameworkScreen from '../screens/onboarding/FrameworkScreen';

// Mirrors app.jsx's FLOW chain: splash -> onboarding -> signup -> permissions
// -> linkbank -> income -> framework -> home. Framework is the last
// onboarding step; every screen now routes to a real next screen.
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignUp: undefined;
  Permissions: undefined;
  LinkBank: undefined;
  IncomeSetup: undefined;
  Framework: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
        <Stack.Screen name="LinkBank" component={LinkBankScreen} />
        <Stack.Screen name="IncomeSetup" component={IncomeSetupScreen} />
        <Stack.Screen name="Framework" component={FrameworkScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
