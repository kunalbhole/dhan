import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CircleHalfIcon } from 'phosphor-react-native/lib/module/icons/CircleHalf';
import { SunIcon } from 'phosphor-react-native/lib/module/icons/Sun';
import { MoonIcon } from 'phosphor-react-native/lib/module/icons/Moon';
import Card from '../components/Card';
import RadioRow from '../components/RadioRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { spacing } from '../theme';
import { getAppearance, setAppearance, subscribeToAppearance, type AppearanceMode } from '../lib/appearanceStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Appearance'>;

function AppearanceScreen({ navigation }: Props) {
  const [mode, setModeState] = useState(getAppearance());
  // Real OS setting (not fabricated) — shown so "System" means something
  // concrete even though this app has no dark theme to actually switch to.
  const systemScheme = useColorScheme();

  useEffect(() => subscribeToAppearance(() => setModeState(getAppearance())), []);

  const modes: { id: AppearanceMode; icon: typeof CircleHalfIcon; sub: string }[] = [
    { id: 'System', icon: CircleHalfIcon, sub: `Follows your phone setting · currently ${systemScheme ?? 'light'}` },
    { id: 'Light', icon: SunIcon, sub: 'Always the light theme' },
    { id: 'Dark', icon: MoonIcon, sub: 'Always the dark theme' },
  ];

  return (
    <SettingsSubScreen title="Appearance" onBack={() => navigation.goBack()}>
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
        {modes.map((m, i) => (
          <RadioRow key={m.id} icon={m.icon} label={m.id} sub={m.sub} on={mode === m.id} last={i === modes.length - 1} onPress={() => setAppearance(m.id)} />
        ))}
      </Card>
    </SettingsSubScreen>
  );
}

export default AppearanceScreen;
