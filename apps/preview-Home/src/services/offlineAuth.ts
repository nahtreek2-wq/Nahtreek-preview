import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_ACCOUNTS_KEY = '@nahtreek/offline-accounts/v1';

type OfflineAccount = {
  fullName: string;
  phoneNumber: string;
  homeCity?: string;
  createdAt: string;
};

type OfflineAccounts = Record<string, OfflineAccount>;

export type OfflineSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    roles: string[];
    homeCity?: string;
  };
};

function normalizePhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
}

async function loadAccounts(): Promise<OfflineAccounts> {
  const stored = await AsyncStorage.getItem(OFFLINE_ACCOUNTS_KEY);
  if (!stored) return {};

  try {
    return JSON.parse(stored) as OfflineAccounts;
  } catch {
    return {};
  }
}

function toSession(account: OfflineAccount): OfflineSession {
  const accountId = encodeURIComponent(account.phoneNumber);
  return {
    accessToken: `offline.${accountId}`,
    refreshToken: `offline.${accountId}`,
    user: {
      id: `offline-client-${account.phoneNumber.replace(/\D/g, '')}`,
      fullName: account.fullName,
      phoneNumber: account.phoneNumber,
      roles: ['CLIENT'],
      ...(account.homeCity ? {homeCity: account.homeCity} : {}),
    },
  };
}

/**
 * Stores a device-local profile only when no server is configured. This is not
 * an SMS-verified or cross-device account; it exists so the Client app remains
 * usable offline without pretending a remote sign-in succeeded.
 */
export async function createOfflineSession(input: {phoneNumber: string; fullName: string; homeCity?: string}): Promise<OfflineSession> {
  const phoneNumber = normalizePhone(input.phoneNumber);
  const accounts = await loadAccounts();
  const account: OfflineAccount = {
    phoneNumber,
    fullName: input.fullName.trim(),
    homeCity: input.homeCity?.trim() || accounts[phoneNumber]?.homeCity,
    createdAt: accounts[phoneNumber]?.createdAt ?? new Date().toISOString(),
  };
  accounts[phoneNumber] = account;
  await AsyncStorage.setItem(OFFLINE_ACCOUNTS_KEY, JSON.stringify(accounts));
  return toSession(account);
}

export async function getOfflineSession(phoneNumber: string): Promise<OfflineSession | null> {
  const account = (await loadAccounts())[normalizePhone(phoneNumber)];
  return account ? toSession(account) : null;
}
