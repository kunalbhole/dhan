/**
 * Dhan
 * @format
 */

import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Deep import into the compiled module, not the package root — the root
// barrel re-exports all ~1500 icons (and phosphor-react-native ships three
// full copies of them under src/, lib/commonjs/, lib/module/), which is
// enough for Metro to stall indefinitely without Watchman installed. This
// path pulls in only what's actually used.
import { IconContext } from 'phosphor-react-native/lib/module/lib';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';
import { addSmsListener } from './src/native/sms';
import { processIncomingSms } from './src/lib/smsPipeline';

// App-wide icon defaults: regular weight, sized/colored to the design
// system. Individual icons override `weight="fill"` for active/selected
// states (see CLAUDE.md's icon convention) and `color` where needed.
const iconDefaults = { size: 24, weight: 'regular' as const, color: colors.fg2 };

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Runs at the app root (not tied to any one screen) so incoming SMS keep
  // getting parsed and stored regardless of which screen is on top.
  // Previously lived in HomeScreen alongside a debug UI that proved the
  // native module worked; now that HomeScreen is the real dashboard, this
  // wiring runs silently — permission itself is requested during
  // onboarding's PermissionsScreen.
  useEffect(() => {
    const sub = addSmsListener(sms => {
      processIncomingSms(sms).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <IconContext.Provider value={iconDefaults}>
        <RootNavigator />
      </IconContext.Provider>
    </SafeAreaProvider>
  );
}

export default App;
