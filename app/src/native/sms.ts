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

export type RawSmsWithId = RawSms & { id: number };

// Total inbox row count — used only to turn a scan cursor into a percentage.
export const getSmsCount = (): Promise<number> =>
  SmsModule && SmsModule.getSmsCount ? SmsModule.getSmsCount() : Promise.resolve(0);

// Cursor-paged, oldest-first read for historyScanner.ts's full backfill —
// see SmsModule.kt's readSmsPage for why this pages by row id rather than
// by DATE (stable under new SMS arriving mid-scan).
export const readSmsPage = (afterId: number, limit = 200): Promise<RawSmsWithId[]> =>
  SmsModule && SmsModule.readSmsPage
    ? SmsModule.readSmsPage(afterId, limit)
    : Promise.resolve([]);

export const addSmsListener = (
  listener: (sms: RawSms) => void,
): EmitterSubscription =>
  smsEmitter.addListener('onSmsReceived', (event: unknown) =>
    listener(event as RawSms),
  );

export default SmsModule;
