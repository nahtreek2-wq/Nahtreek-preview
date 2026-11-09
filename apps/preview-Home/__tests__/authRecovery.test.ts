import {ApiError} from '../src/services/apiClient';
import {registerWithRecovery} from '../src/services/authRecovery';

it('signs in after a lost registration response without resending the OTP', async () => {
  const register = jest.fn().mockRejectedValue(new ApiError(0, 'Timed out', 'timeout'));
  const login = jest.fn().mockResolvedValue({accessToken: 'recovered'});
  await expect(registerWithRecovery(register, login)).resolves.toEqual({accessToken: 'recovered'});
  expect(register).toHaveBeenCalledTimes(1);
  expect(login).toHaveBeenCalledTimes(1);
});

it('keeps the original error when account creation did not finish', async () => {
  const error = new ApiError(504, 'Temporarily unavailable');
  await expect(registerWithRecovery(
    () => Promise.reject(error),
    () => Promise.reject(new ApiError(401, 'Invalid credentials')),
  )).rejects.toBe(error);
});

it('does not retry invalid OTPs or offline registration', async () => {
  const login = jest.fn();
  for (const error of [new ApiError(401, 'Incorrect code'), new ApiError(0, 'Offline', 'network')]) {
    await expect(registerWithRecovery(() => Promise.reject(error), login)).rejects.toBe(error);
  }
  expect(login).not.toHaveBeenCalled();
});
