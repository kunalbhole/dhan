/**
 * Dhan
 * @format
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { IconContext } from 'phosphor-react-native/lib/module/lib';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from './src/components/Toast';
import GlobalAddSheet from './src/components/GlobalAddSheet';
import { colors } from './src/theme';
import { addSmsListener, hasSmsPermission } from './src/native/sms';
import { processIncomingSms } from './src/lib/smsPipeline';
import { startHistoryScan } from './src/lib/historyScanner';
import { maybeRunScheduledBackup } from './src/lib/backupScheduler';
import { isRulesMigrationNeeded, runRulesMigration } from './src/lib/rulesMigration';

const iconDefaults = { size: 24, weight: 'regular' as const, color: colors.fg2 };

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [rebuilding, setRebuilding] = useState(false);

  useEffect(() => {
    hasSmsPermission().then(async granted => {
      if (!granted) return;
      if (await isRulesMigrationNeeded()) {
        setRebuilding(true);
        try {
          await runRulesMigration();
          await startHistoryScan();
        } finally {
          setRebuilding(false);
        }
      } else {
        startHistoryScan().catch(() => {});
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
          {rebuilding && (
            <View style={styles.rebuildOverlay}>
              <ActivityIndicator size="large" color={colors.fg1} />
              <Text style={styles.rebuildText}>Rebuilding your transactions...</Text>
            </View>
          )}
        </View>
      </IconContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rebuildOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  rebuildText: {
    color: colors.fg1,
    fontSize: 15,
  },
});

export default App;
