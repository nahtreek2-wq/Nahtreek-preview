import {NativeModules, Platform} from 'react-native';

type NativeRuntimeConfig = {apiBaseUrl?: string; environment?: string};
const native = NativeModules.NahtreekRuntimeConfig as NativeRuntimeConfig | undefined;
const configured = native?.apiBaseUrl?.trim();
const development = __DEV__
  ? `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:3000/api/v1`
  : undefined;

export const runtimeConfig = {
  environment: native?.environment ?? (__DEV__ ? 'development' : 'production'),
  apiBaseUrl: (configured || development)?.replace(/\/$/, ''),
} as const;

export const isApiConfigured = Boolean(runtimeConfig.apiBaseUrl);
