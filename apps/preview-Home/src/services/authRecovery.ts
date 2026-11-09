import {ApiError} from './apiClient';

// A registration can commit on the server even when its response is lost.
// Never repeat the OTP-consuming write; check whether the new credentials work.
export async function registerWithRecovery<T>(
  register: () => Promise<T>,
  login: () => Promise<T>,
): Promise<T> {
  try {
    return await register();
  } catch (error) {
    if (!(error instanceof ApiError) ||
        !(error.kind === 'timeout' || [409, 503, 504].includes(error.status))) {
      throw error;
    }
    try {
      return await login();
    } catch {
      throw error;
    }
  }
}
