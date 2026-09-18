/**
 * @format
 */

// Must be the very first import — crypto-js (src/lib/backupCrypto.ts) has
// no CSPRNG of its own on RN and relies on this polyfilling
// crypto.getRandomValues before anything else runs.
import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
