import {readFileSync} from 'fs';
import {join} from 'path';

it('guards the native logout implementation against clearing encrypted accounts and profiles', () => {
  const source = readFileSync(
    join(
      __dirname,
      '../android/app/src/main/java/com/nahtreek/client/NahtreekRuntimeConfigModule.kt',
    ),
    'utf8',
  );
  const logout = source
    .split('fun clearSecureSession(promise: Promise) {')[1]
    .split('private fun getOrCreateKey')[0];
  expect(logout).toContain('.remove("payload").commit()');
  expect(logout).not.toContain('.clear()');
  expect(logout).not.toContain('deleteEntry');
});
