import {randomBytes} from 'node:crypto';
import {mkdirSync, existsSync, readFileSync, writeFileSync, chmodSync, copyFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const privateDir = path.join(root, '.android-signing');
mkdirSync(privateDir, {recursive: true, mode: 0o700});
chmodSync(privateDir, 0o700);
const credentialPath = path.join(privateDir, 'internal-credentials.json');
if (!existsSync(credentialPath)) {
  writeFileSync(credentialPath, JSON.stringify({password: randomBytes(32).toString('base64url')}), {mode: 0o600, flag: 'wx'});
}
const {password} = JSON.parse(readFileSync(credentialPath, 'utf8'));
const keyPath = path.join(privateDir, 'internal.p12');
const env = {...process.env, NAHTREEK_SIGNING_PASSWORD: password,
  NAHTREEK_SIGNING_FILE: keyPath, NAHTREEK_SIGNING_ALIAS: 'nahtreek-internal'};
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {cwd, env, stdio: 'inherit'});
  if (result.error || result.status !== 0) throw new Error(command + ' failed');
}
if (!existsSync(keyPath)) {
  run('keytool', ['-genkeypair', '-keystore', keyPath, '-storetype', 'PKCS12',
    '-storepass:env', 'NAHTREEK_SIGNING_PASSWORD', '-alias', 'nahtreek-internal',
    '-keyalg', 'RSA', '-keysize', '3072', '-validity', '3650',
    '-dname', 'CN=NAHTREEK Internal Testing', '-noprompt']);
  chmodSync(keyPath, 0o600);
}
const api = (process.env.NAHTREEK_API_BASE_URL || 'https://nahtreek-api.vercel.app/api/v1').trim();
if (!api.startsWith('https://')) throw new Error('Internal builds require an HTTPS API endpoint.');
run('./gradlew', ['assembleInternal', ...(api ? ['-PNAHTREEK_API_BASE_URL=' + api] : [])], path.join(root, 'android'));
const output = path.resolve(root, '../../NAHTREEK-Client-v1.0.0-internal.apk');
copyFileSync(path.join(root, 'android/app/build/outputs/apk/internal/app-internal.apk'), output);
console.log('Internal APK: ' + output);
console.log('Signing credentials are private in .android-signing; do not commit or share that directory.');
