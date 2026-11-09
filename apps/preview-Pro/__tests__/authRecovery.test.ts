import {ApiError} from '../src/services/apiClient';
import {registerWithRecovery} from '../src/services/authRecovery';

it('signs in after a lost professional signup response without reusing the OTP', async () => {
  const register = jest.fn().mockRejectedValue(new ApiError(0, 'Timed out', 'timeout'));
  const login = jest.fn().mockResolvedValue({accessToken: 'recovered'});
  await expect(registerWithRecovery(register, login)).resolves.toEqual({accessToken: 'recovered'});
  expect(register).toHaveBeenCalledTimes(1);
  expect(login).toHaveBeenCalledTimes(1);
});

it('does not sign in after a validation failure', async () => {
  const login = jest.fn();
  const error = new ApiError(400, 'Invalid details');
  await expect(registerWithRecovery(() => Promise.reject(error), login)).rejects.toBe(error);
  expect(login).not.toHaveBeenCalled();
});
