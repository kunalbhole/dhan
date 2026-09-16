import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

// Raw payload only — sender/body/timestamp exactly as the OS delivered them.
// Parsing (amount, merchant, category) happens in JS, not here; see
// `Dhan App 2/sms-parser.js` for that logic once it's ported.
export type RawSms = {
  sender: string | null;
  body: string;
  timestamp: number;
};

const { SmsModule } = NativeModules;

// Falls back to a harmless no-op module when the native side isn't linked
// (Jest, iOS — this feature is Android-only) so importing this file never
// crashes; real calls below still reject clearly if there's no module.
const smsEmitter = new NativeEventEmitter(
  SmsModule ?? { addListener() {}, removeListeners() {} },
);

export const hasSmsPermission = (): Promise<boolean> =>
  SmsModule ? SmsModule.hasPermission() : Promise.resolve(false);

// Fires the OS permission dialog. Callers must show their own in-app
// rationale before calling this — the native side only wraps the prompt.
export const requestSmsPermission = (): Promise<boolean> =>
  SmsModule
    ? SmsModule.requestPermission()
    : Promise.reject(new Error('SmsModule is not available on this platform'));

export const addSmsListener = (
  listener: (sms: RawSms) => void,
): EmitterSubscription =>
  smsEmitter.addListener('onSmsReceived', (event: unknown) =>
    listener(event as RawSms),
  );

export default SmsModule;
