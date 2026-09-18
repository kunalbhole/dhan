/**
 * Dhan
 * @format
 */

import { useEffect } from 'react';
import { AppState, StatusBar, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { IconContext } from 'phosphor-react-native/lib/module/lib';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from './src/components/Toast';
import GlobalAddSheet from './src/components/GlobalAddSheet';
import { colors } from './src/theme';
import { addSmsListener, hasSmsPermission } from './src/native/sms';
import { processIncomingSms, scanAndProcessInbox } from './src/lib/smsPipeline';
import { maybeRunScheduledBackup } from './src/lib/backupScheduler';

const iconDefaults = { size: 24, weight: 'regular' as const, color: colors.fg2 };

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    hasSmsPermission().then(granted => {
      if (granted) {
        scanAndProcessInbox(500).catch(() => {});
      }
    });
    const sub = addSmsListener(sms => {
      processIncomingSms(sms).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    maybeRunScheduledBackup();
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') maybeRunScheduledBackup();
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <IconContext.Provider value={iconDefaults}>
        <View style={{ flex: 1 }}>
          <RootNavigator />
          <Toast />
          <GlobalAddSheet />
        </View>
      </IconContext.Provider>
    </SafeAreaProvider>
  );
}

export default App;
