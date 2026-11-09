// Explicit preview operations only. No credentials are printed or written to disk.
require('dotenv').config({quiet: true});
const {PrismaClient} = require('@prisma/client');
const {randomBytes} = require('crypto');
const {spawnSync} = require('child_process');
const prisma = new PrismaClient();

async function main() {
  if (process.env.CONFIGURE_PREVIEW_PUSH !== 'yes' || !process.env.DATABASE_URL?.includes('gnlquwusgocnlgefpfob')) {
    throw new Error('Explicit preview database confirmation required');
  }
  const secretName = 'nahtreek_preview_push_dispatch';
  const existing = await prisma.$queryRaw`SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = ${secretName}`;
  const secret = existing[0]?.decrypted_secret || randomBytes(32).toString('hex');
  if (!existing.length) await prisma.$queryRaw`SELECT vault.create_secret(${secret}, ${secretName})::text`;
  for (const [name, value] of [['CRON_SECRET', secret], ['PUSH_ENABLED', 'true']]) {
    const result = spawnSync('vercel', ['env', 'add', name, 'production', '--force', '--sensitive'], {input: value, encoding: 'utf8'});
    if (result.status !== 0) throw new Error(`Could not configure ${name}; inspect Vercel project access`);
    console.log(`${name} configured (value hidden)`);
  }
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_cron');
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions');
  // Dispatch pending work and check opt-in weekly tips once per hour. Vault keeps the bearer token
  // out of cron.job command text. A lease in the API prevents concurrent claims.
  const command = `SELECT net.http_post(
    url := 'https://nahtreek-api.vercel.app/api/v1/internal/push/dispatch',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization',
      'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'nahtreek_preview_push_dispatch')),
    body := '{}'::jsonb, timeout_milliseconds := 30000
  ) WHERE EXISTS (SELECT 1 FROM public."Notification" WHERE "pushState" = 'PENDING' AND "pushAfter" <= now())
    OR EXTRACT(MINUTE FROM now()) = 0;`;
  // Re-running setup replaces these two named jobs rather than creating duplicate dispatches.
  await prisma.$executeRawUnsafe("SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('nahtreek-preview-push', 'nahtreek-preview-booking-expiry')");
  await prisma.$queryRaw`SELECT cron.schedule('nahtreek-preview-push', '* * * * *', ${command})`;
  const expireCommand = `SELECT net.http_post(
    url := 'https://nahtreek-api.vercel.app/api/v1/internal/service-workflow/expire',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization',
      'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'nahtreek_preview_push_dispatch')),
    body := '{}'::jsonb, timeout_milliseconds := 30000
  ) WHERE EXISTS (SELECT 1 FROM public."ServiceJourney" WHERE "stage" = 'PENDING' AND "expiresAt" <= now());`;
  await prisma.$queryRaw`SELECT cron.schedule('nahtreek-preview-booking-expiry', '* * * * *', ${expireCommand})`;
  console.log('Preview dispatcher scheduled every minute; redeploy API to activate new environment.');
}
main().catch(error => {console.error(error.message?.includes('preview') ? error.message : 'Push setup failed; no secret values printed.'); process.exitCode = 1;}).finally(() => prisma.$disconnect());
