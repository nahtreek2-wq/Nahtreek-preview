import {NativeModules, Platform} from 'react-native';

type Bridge = {
  getSecureSession?: () => Promise<string | null>;
  setSecureSession?: (payload: string) => Promise<void>;
  clearSecureSession?: () => Promise<void>;
};
const native = NativeModules.NahtreekRuntimeConfig as Bridge | undefined;
let pending: Promise<unknown> = Promise.resolve();

function serial<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation, operation);
  pending = result.catch(() => undefined);
  return result;
}

function bridge(): Required<Bridge> {
  if (
    !['android', 'ios'].includes(Platform.OS) ||
    !native?.getSecureSession ||
    !native.setSecureSession ||
    !native.clearSecureSession
  ) {
    throw new Error('Secure session storage is unavailable on this device.');
  }
  return native as Required<Bridge>;
}

export const secureSession = {
  read: () => serial(() => bridge().getSecureSession()),
  write: (payload: string) => serial(() => bridge().setSecureSession(payload)),
  clear: () => serial(() => bridge().clearSecureSession()),
};

