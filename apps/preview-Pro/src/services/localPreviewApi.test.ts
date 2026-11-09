import {localPreviewRequest} from './localPreviewApi';

describe('local preview API mutations', () => {
  it('does not pretend an unsupported service-job update was saved', async () => {
    await expect(
      localPreviewRequest('/service-requests/request-1/status', {
        method: 'PATCH',
        body: JSON.stringify({status: 'ACCEPTED'}),
      }),
    ).rejects.toThrow('Preview mode does not save job, chat or notification changes.');
  });

  it('still provides an empty page for an explicitly preview-only list', async () => {
    await expect(
      localPreviewRequest('/notifications?limit=50&page=1', {method: 'GET'}),
    ).resolves.toMatchObject({data: [], meta: {page: 1, totalPages: 0}});
  });
});
