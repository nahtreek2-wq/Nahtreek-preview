import {NativeModules, Platform} from 'react-native';

type SecureSessionModule = {
  getSecureSession?: () => Promise<string | null>;
  setSecureSession?: (payload: string) => Promise<void>;
  clearSecureSession?: () => Promise<void>;
};

const nativeModule = NativeModules.NahtreekRuntimeConfig as SecureSessionModule | undefined;

// Both native implementations share this contract: Android Keystore and iOS
// Keychain. Serialize operations so logout cannot race an earlier token write.
let pending: Promise<unknown> = Promise.resolve();
function serial<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation, operation);
  pending = result.catch(() => undefined);
  return result;
}

function requireStorage(): Required<SecureSessionModule> {
  if (!['android', 'ios'].includes(Platform.OS) || !nativeModule?.getSecureSession ||
      !nativeModule?.setSecureSession || !nativeModule?.clearSecureSession) {
    throw new Error('Secure session storage is unavailable on this device.');
  }
  return nativeModule as Required<SecureSessionModule>;
}

export const secureSession = {
  async read(): Promise<string | null> {
    return serial(() => requireStorage().getSecureSession());
  },
  async write(payload: string): Promise<void> {
    return serial(() => requireStorage().setSecureSession(payload));
  },
  async clear(): Promise<void> {
    return serial(() => requireStorage().clearSecureSession());
  },
};
