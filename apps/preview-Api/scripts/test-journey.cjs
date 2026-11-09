// An isolated schema exercises the real HTTP/API/database journey without touching app users.
const {randomBytes} = require('node:crypto');
const {spawnSync} = require('node:child_process');
const path = require('node:path');
const {PrismaClient} = require('@prisma/client');
require('dotenv').config({path: path.join(__dirname, '../.env')});

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const schema = 'nahtreek_e2e_' + randomBytes(8).toString('hex');
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', schema);
  const admin = new PrismaClient();
  let created = false;
  try {
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    created = true;
    const env = {...process.env, DATABASE_URL: url.toString(), NAHTREEK_E2E_SCHEMA: schema,
      JWT_SECRET: randomBytes(32).toString('hex'), APP_ENV: 'preview', PUSH_ENABLED: 'false',
      AI_PROVIDER_URL: process.env.NAHTREEK_E2E_LIVE_AI === 'true' ? process.env.AI_PROVIDER_URL ?? '' : '',
      AI_PROVIDER_API_KEY: process.env.NAHTREEK_E2E_LIVE_AI === 'true' ? process.env.AI_PROVIDER_API_KEY ?? '' : '', NODE_ENV: 'test'};
    const root = path.join(__dirname, '../../..');
    for (const [bin, args] of [
      ['prisma/build/index.js', ['db', 'push', '--skip-generate', '--schema', 'prisma/schema.prisma']],
      ['jest/bin/jest.js', ['--runInBand', '--runTestsByPath', 'src/journey.integration.spec.ts', ...process.argv.slice(2)]],
    ]) {
      const run = spawnSync(process.execPath, [path.join(root, 'node_modules', bin), ...args], {cwd: path.join(__dirname, '..'), env, stdio: 'inherit'});
      if (run.status !== 0) throw new Error('Journey check failed');
    }
  } finally {
    if (created) {
      await admin.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
      console.log('Removed isolated test schema and its synthetic accounts.');
    }
    await admin.$disconnect();
  }
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
