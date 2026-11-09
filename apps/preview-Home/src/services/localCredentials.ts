import {NativeModules} from 'react-native';
import {runtimeConfig} from '../config/runtime';
import {isApiConfigured} from './config';
import {useSessionStore} from '../stores/session';
import {
  getOfflineClientProfile,
  updateOfflineClientProfile,
} from '../data/offlineCatalogue';

export interface ClientRegistration {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}
interface StoredAccount extends Omit<ClientRegistration, 'password'> {
  salt: string;
  hash: string;
  createdAt: string;
}
type Accounts = Record<string, StoredAccount>;
type Bridge = {
  getLocalAccounts(): Promise<string | null>;
  setLocalAccounts(payload: string): Promise<void>;
  hashLocalPassword(password: string): Promise<{salt: string; hash: string}>;
  verifyLocalPassword(
    password: string,
    salt: string,
    hash: string,
  ): Promise<boolean>;
  confirmLocalPasswordReset(): Promise<boolean>;
};
function bridge(): Bridge {
  const native = NativeModules.NahtreekRuntimeConfig as Bridge | undefined;
  if (
    isApiConfigured ||
    runtimeConfig.environment !== 'staging' ||
    !native?.getLocalAccounts ||
    !native?.hashLocalPassword
  )
    throw new Error(
      'Local account storage is unavailable. Connect the authentication service.',
    );
  return native;
}
export function normalizeMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!/^([6-9]\d{9}|91[6-9]\d{9})$/.test(digits))
    throw new Error('Enter a valid 10-digit Indian mobile number');
  return '+91' + digits.slice(-10);
}
export function validateClientDetails(
  input: Pick<
    ClientRegistration,
    'fullName' | 'address' | 'city' | 'state' | 'postalCode'
  >,
): string | null {
  if (input.fullName.trim().length < 2) return 'Enter your full name';
  if (input.address.trim().length < 5)
    return 'Enter your house or street address';
  if (input.city.trim().length < 2 || input.state.trim().length < 2)
    return 'Enter your city and state';
  if (!/^[1-9]\d{5}$/.test(input.postalCode))
    return 'Enter a valid 6-digit PIN code';
  return null;
}
export function validateRegistration(input: ClientRegistration): string | null {
  try {
    normalizeMobile(input.phoneNumber);
  } catch {
    return 'Enter a valid 10-digit mobile number';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    return 'Enter a valid email address';
  if (input.password.length < 8 || input.password.length > 72)
    return 'Use a password with 8 to 72 characters';
  if (!input.acceptedTerms)
    return 'Please read and accept the account data notice';
  return null;
}
async function load(): Promise<Accounts> {
  const raw = await bridge().getLocalAccounts();
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error(
      'Local account data is unreadable. Please contact support.',
    );
  return parsed as Accounts;
}
let pending: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const task = pending.then(fn, fn);
  pending = task.catch(() => undefined);
  return task;
}
function session(account: StoredAccount) {
  const user = {
    id: 'offline-client-' + account.phoneNumber.replace(/\D/g, ''),
    fullName: account.fullName,
    phoneNumber: account.phoneNumber,
    email: account.email,
    address: account.address,
    homeCity: account.city,
    state: account.state,
    postalCode: account.postalCode,
    roles: ['CLIENT'],
  };
  const token = 'offline.' + encodeURIComponent(account.phoneNumber);
  return {accessToken: token, refreshToken: token, user};
}
export function registerLocalAccount(input: ClientRegistration) {
  return serial(async () => {
    const error = validateRegistration(input);
    if (error) throw new Error(error);
    const accounts = await load();
    const phoneNumber = normalizeMobile(input.phoneNumber);
    const email = input.email.trim().toLowerCase();
    if (
      accounts[phoneNumber] ||
      Object.values(accounts).some(a => a.email === email)
    )
      throw new Error(
        'An account with this mobile or email already exists. Please sign in.',
      );
    const {password, ...details} = input;
    const credentials = await bridge().hashLocalPassword(password);
    const account: StoredAccount = {
      ...details,
      fullName: details.fullName.trim() || 'New Client',
      address: details.address.trim(),
      city: details.city.trim(),
      state: details.state.trim(),
      phoneNumber,
      email,
      ...credentials,
      createdAt: new Date().toISOString(),
    };
    const result = session(account);
    await updateOfflineClientProfile(result.user, {
      fullName: account.fullName,
      address: account.address,
      city: account.city,
      state: account.state,
      postalCode: account.postalCode,
      email,
    });
    accounts[phoneNumber] = account;
    await bridge().setLocalAccounts(JSON.stringify(accounts));
    return result;
  });
}
export function loginLocalAccount(identifier: string, password: string) {
  return serial(async () => {
    const accounts = await load();
    const normalized = identifier.includes('@')
      ? identifier.trim().toLowerCase()
      : normalizeMobile(identifier);
    const account = identifier.includes('@')
      ? Object.values(accounts).find(a => a.email === normalized)
      : accounts[normalized];
    if (
      !account ||
      !(await bridge().verifyLocalPassword(
        password,
        account.salt,
        account.hash,
      ))
    )
      throw new Error('Mobile/email or password is incorrect');
    const result = session(account);
    const profile = await getOfflineClientProfile(result.user);
    return {
      ...result,
      user: {
        ...result.user,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        address: profile.address,
        homeCity: profile.city,
        state: profile.state,
        postalCode: profile.postalCode,
      },
    };
  });
}

export function syncLocalAccountProfile(
  userId: string,
  patch: {
    fullName: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  },
) {
  return serial(async () => {
    const accounts = await load();
    const account = Object.values(accounts).find(
      item => session(item).user.id === userId,
    );
    if (!account) return; // Earlier internal profiles do not have password credentials.
    const email = patch.email?.trim().toLowerCase() ?? account.email;
    if (
      Object.values(accounts).some(
        item =>
          item.phoneNumber !== account.phoneNumber && item.email === email,
      )
    )
      throw new Error('That email is already used by another account');
    accounts[account.phoneNumber] = {
      ...account,
      fullName: patch.fullName,
      email,
      address: patch.address ?? account.address,
      city: patch.city ?? account.city,
      state: patch.state ?? account.state,
      postalCode: patch.postalCode ?? account.postalCode,
    };
    await bridge().setLocalAccounts(JSON.stringify(accounts));
  });
}
export function resetLocalPassword(
  phone: string,
  email: string,
  password: string,
) {
  return serial(async () => {
    const accounts = await load();
    const phoneNumber = normalizeMobile(phone);
    const account = accounts[phoneNumber];
    if (!account || account.email !== email.trim().toLowerCase())
      throw new Error(
        'No matching password account. Older phone-only test profiles must be replaced with a new password account.',
      );
    if (password.length < 8 || password.length > 72)
      throw new Error('Use a password with 8 to 72 characters');
    if (!(await bridge().confirmLocalPasswordReset()))
      throw new Error('Device confirmation is required');
    const credentials = await bridge().hashLocalPassword(password);
    accounts[phoneNumber] = {...account, ...credentials};
    await bridge().setLocalAccounts(JSON.stringify(accounts));
    if (useSessionStore.getState().user?.id === session(account).user.id)
      useSessionStore.getState().clearSession();
  });
}
