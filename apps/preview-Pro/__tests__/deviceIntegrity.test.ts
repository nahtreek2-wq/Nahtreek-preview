import {Alert, NativeModules} from 'react-native';

function setup(native: Record<string, unknown> | undefined) {
  if (native === undefined) delete (NativeModules as Record<string, unknown>).NahtreekRuntimeConfig;
  else (NativeModules as Record<string, unknown>).NahtreekRuntimeConfig = native;
  let integrity!: typeof import('../src/services/deviceIntegrity');
  jest.isolateModules(() => {
    integrity = require('../src/services/deviceIntegrity');
  });
  return {integrity};
}

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockClear().mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete (NativeModules as Record<string, unknown>).NahtreekRuntimeConfig;
});

it('warns once on compromised production devices', () => {
  const {integrity} = setup({environment: 'production', deviceCompromised: true});
  integrity.warnForCompromiseOnce();
  integrity.warnForCompromiseOnce();
  expect(Alert.alert).toHaveBeenCalledTimes(1);
  expect(Alert.alert).toHaveBeenCalledWith(
    'Device security warning',
    expect.stringMatching(/rooted or jailbroken/),
    expect.anything(),
  );
});

it.each([
  ['clean device', {environment: 'production', deviceCompromised: false}],
  ['staging runtime', {environment: 'staging', deviceCompromised: true}],
  ['development runtime', {environment: 'development', deviceCompromised: true}],
  ['missing flag', {environment: 'production'}],
])('stays silent for %s', (_label, native) => {
  const {integrity} = setup(native);
  integrity.warnForCompromiseOnce();
  expect(Alert.alert).not.toHaveBeenCalled();
});

it('stays silent when the native module is unavailable', () => {
  const {integrity} = setup(undefined);
  integrity.warnForCompromiseOnce();
  expect(Alert.alert).not.toHaveBeenCalled();
});
