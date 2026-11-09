import React, {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NavigationState} from '@react-navigation/native';

// Remembers where the user was when the app goes to the background or the
// OS kills the process, so reopening resumes the same screen instead of
// restarting from Home. Keyed per account: a guest, a signed-in user, and a
// different signed-in user each restore only their own last screen.
const STORAGE_KEY = 'nahtreek-home-nav-state-v1';

type PersistedNav = {account: string; state: NavigationState};

export function isNavigationState(value: unknown): value is NavigationState {
  if (!value || typeof value !== 'object') return false;
  const state = value as {routes?: unknown; index?: unknown};
  return (
    Array.isArray(state.routes) &&
    state.routes.length > 0 &&
    typeof state.index === 'number'
  );
}

// Only the main tab tree is resumable. A stack that does not start at
// MainTabs (a bare Login/auth screen) must never restore, or a signed-in
// user could land back on login — those restart fresh. Login pushed above
// MainTabs is harmless: LoginRoute sends a signed-in user back.
export function sanitizeRestoredState(value: unknown): NavigationState | undefined {
  if (!isNavigationState(value)) return undefined;
  const root = value.routes[0] as {name?: unknown} | undefined;
  if (!root || root.name !== 'MainTabs') return undefined;
  return value;
}

export async function loadPersistedNavigationState(
  account: string,
): Promise<NavigationState | undefined> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<PersistedNav> | null;
    if (!parsed || parsed.account !== account) return undefined;
    return sanitizeRestoredState(parsed.state);
  } catch {
    return undefined;
  }
}

export async function clearPersistedNavigationState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best effort: a stale entry only costs one fresh start.
  }
}

export function usePersistedNavigationState(account: string, settled: boolean, restorable: boolean) {
  const [initialState, setInitialState] = useState<NavigationState | undefined>();
  const [ready, setReady] = useState(false);
  // Restore is decided exactly once, when the session settles: guests and
  // signed-in users resume their last screen on cold start, while a later
  // sign-in on the same mount starts fresh instead of replaying storage.
  const decided = React.useRef(false);

  useEffect(() => {
    if (!settled || decided.current) return;
    decided.current = true;
    if (!restorable) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void loadPersistedNavigationState(account).then(state => {
      if (cancelled) return;
      setInitialState(state);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [account, settled, restorable]);

  const onStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (!state) return;
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({account, state})).catch(
        () => undefined,
      );
    },
    [account],
  );

  return {initialState, ready, onStateChange};
}
