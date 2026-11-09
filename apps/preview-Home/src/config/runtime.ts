import {NativeModules, Platform} from 'react-native';

export type RuntimeEnvironment = 'development' | 'staging' | 'production';

type NativeRuntimeConfig = {
  apiBaseUrl?: string;
  environment?: RuntimeEnvironment;
};

const nativeConfig = NativeModules.NahtreekRuntimeConfig as NativeRuntimeConfig | undefined;
const configuredApiBaseUrl = nativeConfig?.apiBaseUrl?.trim();

// The emulator endpoint is a development convenience only. Release builds
// must receive their API URL through the native build property so production
// infrastructure never becomes part of the JavaScript bundle by accident.
const localDevelopmentApiBaseUrl = __DEV__
  ? `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:3000/api/v1`
  : undefined;

export const runtimeConfig = {
  environment: nativeConfig?.environment ?? (__DEV__ ? 'development' : 'production'),
  apiBaseUrl: (configuredApiBaseUrl || localDevelopmentApiBaseUrl)?.replace(/\/$/, ''),
} as const;

export const isProductionRuntime = runtimeConfig.environment === 'production';
