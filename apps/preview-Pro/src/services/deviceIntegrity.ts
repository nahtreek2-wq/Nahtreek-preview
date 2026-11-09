import {Alert, NativeModules} from 'react-native';
import {runtimeConfig} from '../config/runtime';

// Warn only on production runtimes: developers and testers routinely run
// debug builds on rooted devices and emulators, which would false-positive.
export function shouldWarnForCompromise(deviceCompromised: unknown, environment: string): boolean {
  return deviceCompromised === true && environment === 'production';
}

let warned = false;
// One dismissible alert per launch. Never blocks: the signal is
// best-effort and false positives must not lock anyone out.
export function warnForCompromiseOnce(): void {
  if (warned) return;
  const native = NativeModules.NahtreekRuntimeConfig as {deviceCompromised?: unknown} | undefined;
  if (!shouldWarnForCompromise(native?.deviceCompromised, runtimeConfig.environment)) return;
  warned = true;
  Alert.alert(
    'Device security warning',
    'This device looks rooted or jailbroken. You can keep working, but be extra careful with payments and client data on this device.',
    [{text: 'Understood'}],
  );
}
