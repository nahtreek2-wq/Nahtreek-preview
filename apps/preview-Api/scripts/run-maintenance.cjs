// Run from a scheduled production task. The bearer secret is read at runtime.
const base = process.env.NAHTREEK_API_BASE_URL?.replace(/\/$/, '');
const secret = process.env.CRON_SECRET;

if (!base || !/^https:\/\/[^/]+\/api\/v1$/.test(base) || !secret || secret.length < 32) {
  console.error('Maintenance requires an HTTPS API base URL and a configured cron secret.');
  process.exitCode = 1;
} else {
  (async () => {
    for (const path of ['/internal/service-workflow/expire', '/internal/push/dispatch']) {
      const response = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json'},
        body: '{}',
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
      console.log(`${path} completed`);
    }
  })().catch(error => {
    console.error(`Maintenance failed: ${error.message}`);
    process.exitCode = 1;
  });
}
