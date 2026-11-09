import {NativeModules} from 'react-native';

function setup(native: Record<string, unknown> | undefined) {
  if (native === undefined) delete (NativeModules as Record<string, unknown>).NahtreekRuntimeConfig;
  else (NativeModules as Record<string, unknown>).NahtreekRuntimeConfig = native;
  let integrity!: typeof import('../src/services/deviceIntegrity');
  let toast!: typeof import('../src/stores/toast');
  jest.isolateModules(() => {
    integrity = require('../src/services/deviceIntegrity');
    toast = require('../src/stores/toast');
  });
  return {integrity, toast};
}

afterEach(() => {
  delete (NativeModules as Record<string, unknown>).NahtreekRuntimeConfig;
});

it('warns once on compromised production devices', () => {
  const {integrity, toast} = setup({environment: 'production', deviceCompromised: true});
  integrity.warnForCompromiseOnce();
  integrity.warnForCompromiseOnce();
  expect(toast.useToastStore.getState().current).toMatchObject({kind: 'warning'});
  expect(toast.useToastStore.getState().current?.message).toMatch(/rooted or jailbroken/);
  expect(toast.useToastStore.getState().queue).toHaveLength(0);
});

it.each([
  ['clean device', {environment: 'production', deviceCompromised: false}],
  ['staging runtime', {environment: 'staging', deviceCompromised: true}],
  ['development runtime', {environment: 'development', deviceCompromised: true}],
  ['missing flag', {environment: 'production'}],
])('stays silent for %s', (_label, native) => {
  const {integrity, toast} = setup(native);
  integrity.warnForCompromiseOnce();
  expect(toast.useToastStore.getState().current).toBeNull();
});

it('stays silent when the native module is unavailable', () => {
  const {integrity, toast} = setup(undefined);
  integrity.warnForCompromiseOnce();
  expect(toast.useToastStore.getState().current).toBeNull();
});
