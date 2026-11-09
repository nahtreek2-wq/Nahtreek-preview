import {Prisma} from '@prisma/client';
import {DatabaseErrorFilter} from './database-error.filter';

describe('database outage responses', () => {
  it.each(['P1017', 'P2024', 'P2028'])('maps %s to a sanitized 503 without retrying writes', code => {
    const response = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    const host = {switchToHttp: () => ({getResponse: () => response})};
    new DatabaseErrorFilter().catch(new Prisma.PrismaClientKnownRequestError('private connection details', {code, clientVersion: '5.22.0'}), host as any);
    expect(response.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(response.json.mock.calls)).not.toContain('private connection details');
  });
});
