import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

export type RawSms = {
  sender: string | null;
  body: string;
  timestamp: number;
};

const { SmsModule } = NativeModules;

const smsEmitter = new NativeEventEmitter(
  SmsModule ?? { addListener() {}, removeListeners() {} },
);

export const hasSmsPermission = (): Promise<boolean> =>
  SmsModule ? SmsModule.hasPermission() : Promise.resolve(false);

export const requestSmsPermission = (): Promise<boolean> =>
  SmsModule
    ? SmsModule.requestPermission()
    : Promise.reject(new Error('SmsModule is not available on this platform'));

export const readExistingSms = (limit = 500): Promise<RawSms[]> =>
  SmsModule && SmsModule.readExistingSms
    ? SmsModule.readExistingSms(limit)
    : Promise.resolve([]);

export const addSmsListener = (
  listener: (sms: RawSms) => void,
): EmitterSubscription =>
  smsEmitter.addListener('onSmsReceived', (event: unknown) =>
    listener(event as RawSms),
  );

export default SmsModule;
