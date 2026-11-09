// Runtime only: Prisma migration/administration commands retain their own URL.
export function runtimeDatabaseUrl(value: string, serverless: boolean): string {
  const url = new URL(value);
  // The configured Supabase session pooler is measurably faster for Prisma's
  // interactive transactions. Keep its port; bound each serverless instance.
  if (serverless && url.hostname.endsWith('.pooler.supabase.com')) url.searchParams.set('connection_limit', '1');
  for (const [key, fallback] of Object.entries({connect_timeout: '10', pool_timeout: '10', socket_timeout: '20'})) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, fallback);
  }
  return url.toString();
}
