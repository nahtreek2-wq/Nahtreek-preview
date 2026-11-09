import {NativeModules} from 'react-native';
import {runtimeConfig} from '../config/runtime';
import {useToastStore} from '../stores/toast';

// Warn only on production runtimes: developers and testers routinely run
// debug builds on rooted devices and emulators, which would false-positive.
export function shouldWarnForCompromise(deviceCompromised: unknown, environment: string): boolean {
  return deviceCompromised === true && environment === 'production';
}

let warned = false;
// One dismissible warning per launch. Never blocks: the signal is
// best-effort and false positives must not lock anyone out.
export function warnForCompromiseOnce(): void {
  if (warned) return;
  const native = NativeModules.NahtreekRuntimeConfig as {deviceCompromised?: unknown} | undefined;
  if (!shouldWarnForCompromise(native?.deviceCompromised, runtimeConfig.environment)) return;
  warned = true;
  useToastStore.getState().show('This device looks rooted or jailbroken — be extra careful with payments here.', 'warning');
}
