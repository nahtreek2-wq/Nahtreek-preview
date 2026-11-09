import {PlatformService} from './platform.service';

// Real PNG rendering takes seconds and flakes under load; live device runs
// already prove the actual QR image. Mock it and assert the data-URL shape.
jest.mock('qrcode', () => ({toDataURL: jest.fn(async (url: string) => `data:image/png;base64,QR:${url}`)}));
import * as QRCode from 'qrcode';

function setup(prof: any) {
  const db: any = {professionalProfile: {
    findUnique: jest.fn(async ({where}: any) => {
      if (where.userId) return prof?.userId === where.userId ? prof : null;
      if (where.id) return prof?.id === where.id ? prof : null;
      return null;
    }),
    updateMany: jest.fn(async ({data}: any) => {
      if (prof.reviewCode) return {count: 0};
      Object.assign(prof, data);
      return {count: 1};
    }),
  }};
  return {db, service: new PlatformService(db)};
}

const base = {id: 'prof-1', userId: 'pro', fullName: 'Eng Narayanan', averageRating: 4.5,
  totalReviewsCount: 2, reviewCode: null as string | null};

describe('provider review QR', () => {
  it('mints a stable 6-character code and QR link on first call', async () => {
    const {service} = setup({...base});
    const result = await service.reviewQr('pro');
    expect(result.code).toMatch(/^[A-Z2-9]{6}$/);
    expect(result.url).toBe('https://nahtreek-website.vercel.app/p/prof-1');
    expect(result.qrPng).toMatch(/^data:image\/png;base64,/);
    expect(QRCode.toDataURL).toHaveBeenCalledWith(result.url, expect.objectContaining({width: 512}));
    expect(result).toMatchObject({fullName: 'Eng Narayanan', averageRating: 4.5, totalReviewsCount: 2});
  });
  it('reuses the minted code so printed cards keep working', async () => {
    const {db, service} = setup({...base, reviewCode: 'AB12CD'});
    const result = await service.reviewQr('pro');
    expect(result.code).toBe('AB12CD');
    expect(db.professionalProfile.updateMany).not.toHaveBeenCalled();
  });
  it('404s without a professional profile', async () => {
    const {service} = setup(null);
    await expect(service.reviewQr('ghost')).rejects.toThrow('Professional profile not found');
  });
});
