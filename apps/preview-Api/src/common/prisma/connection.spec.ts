import {runtimeDatabaseUrl} from './connection';

describe('database runtime configuration', () => {
  const value = 'postgresql://user:pass@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require&schema=qa';
  it('bounds serverless connections without changing the configured pooler', () => {
    const url = new URL(runtimeDatabaseUrl(value, true));
    expect(url.port).toBe('5432');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({connection_limit: '1', sslmode: 'require', schema: 'qa', socket_timeout: '20'});
  });
  it('leaves local/session database targets unchanged', () => {
    expect(new URL(runtimeDatabaseUrl(value, false)).port).toBe('5432');
    expect(new URL(runtimeDatabaseUrl('postgresql://u:p@localhost:5432/db', true)).port).toBe('5432');
  });
});
