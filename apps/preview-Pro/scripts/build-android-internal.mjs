import {copyFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '../..');
const androidRoot = path.join(appRoot, 'android');
const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const apiBaseUrl = process.env.NAHTREEK_API_BASE_URL?.trim();
const args = ['assembleInternal'];
if (apiBaseUrl) args.push(`-PNAHTREEK_API_BASE_URL=${apiBaseUrl}`);

execFileSync(gradle, args, {cwd: androidRoot, stdio: 'inherit'});

const source = path.join(androidRoot, 'app/build/outputs/apk/internal/app-internal.apk');
if (!existsSync(source)) throw new Error(`Internal APK was not created at ${source}`);
const destination = path.join(repoRoot, 'NAHTREEK-Professionals-v1.0.0-internal.apk');
copyFileSync(source, destination);
console.log(`Internal APK: ${destination}`);
