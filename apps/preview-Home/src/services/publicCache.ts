import AsyncStorage from '@react-native-async-storage/async-storage';
import type {QueryClient} from '@tanstack/react-query';
import {API_BASE} from './config';

// Persist only public discovery data. Private account data remains in the
// account-scoped QueryClient and is discarded on logout/account switch.
const key = '@nahtreek/public-cache/v2/' + (API_BASE ?? 'unconfigured');
const allowed = new Set(['engineers', 'engineer', 'search', 'providers', 'services']);
const maxAge = 24 * 60 * 60 * 1000;
export async function restorePublicCache(client: QueryClient): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw || raw.length > 2000000) return;
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries)) return;
    for (const entry of entries.slice(0, 30)) {
      if (!Array.isArray(entry?.key) || !allowed.has(entry.key[0]) || typeof entry.updatedAt !== 'number' ||
          !Number.isFinite(entry.updatedAt) || entry.updatedAt > Date.now() || Date.now() - entry.updatedAt > maxAge || !entry.data) continue;
      const existing = client.getQueryState(entry.key);
      if (!existing?.dataUpdatedAt || existing.dataUpdatedAt < entry.updatedAt) client.setQueryData(entry.key, entry.data, {updatedAt: entry.updatedAt});
    }
  } catch { /* A missing or invalid public cache must not prevent startup. */ }
}
export function persistPublicCache(client: QueryClient): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const unsubscribe = client.getQueryCache().subscribe(event => {
    if (event.type !== 'updated' || !allowed.has(String(event.query.queryKey[0])) || !event.query.state.data) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const entries = client.getQueryCache().getAll()
        .filter(query => allowed.has(String(query.queryKey[0])) && query.state.data && Date.now() - query.state.dataUpdatedAt < maxAge)
        .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt).slice(0, 30)
        .map(query => ({key: query.queryKey, data: query.state.data, updatedAt: query.state.dataUpdatedAt}));
      const serialized = JSON.stringify(entries);
      if (serialized.length < 2000000) void AsyncStorage.setItem(key, serialized).catch(() => undefined);
    }, 400);
  });
  return () => { unsubscribe(); clearTimeout(timer); };
}
