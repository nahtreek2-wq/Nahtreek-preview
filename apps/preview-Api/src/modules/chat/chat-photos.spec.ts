import {ChatService} from './chat.service';

function conversation() {
  return {
    id: 'conv-1',
    engineerRequestId: 'req-1',
    serviceRequestId: null,
    updatedAt: new Date('2026-01-02'),
    participants: [
      {userId: 'client-user', lastReadAt: null,
        user: {clientProfile: {fullName: 'Asha', avatarUrl: 'https://cdn/client.jpg'}, professionalProfile: null}},
      {userId: 'eng-user', lastReadAt: null,
        user: {clientProfile: null, professionalProfile: {fullName: 'Eng Narayanan', avatarUrl: 'https://cdn/pro.jpg'}}},
    ],
    messages: [{content: 'Hello', createdAt: new Date('2026-01-02')}],
    engineerRequest: {projectTitle: 'Villa wiring', engineer: {profile: {fullName: 'Eng Narayanan'}}},
    serviceRequest: null,
  };
}

function setup(withAvatars: boolean) {
  const conv = conversation();
  if (!withAvatars) {
    conv.participants[0].user.clientProfile!.avatarUrl = null;
    conv.participants[1].user.professionalProfile!.avatarUrl = null;
  }
  const prisma: any = {
    conversation: {findMany: jest.fn().mockResolvedValue([conv]), count: jest.fn().mockResolvedValue(1)},
    message: {count: jest.fn().mockResolvedValue(0)},
    $transaction: jest.fn(async (arg: any) => Promise.all(arg)),
  };
  return {service: new ChatService(prisma)};
}

describe('conversation photos', () => {
  it('shows each side the other party photo', async () => {
    const {service} = setup(true);
    const clientView = await service.list('client-user', {});
    expect(clientView.data[0]).toMatchObject({title: 'Eng Narayanan', otherAvatarUrl: 'https://cdn/pro.jpg'});
    const proView = await service.list('eng-user', {});
    expect(proView.data[0]).toMatchObject({title: 'Asha', otherAvatarUrl: 'https://cdn/client.jpg'});
  });

  it('omits the photo when nobody uploaded one', async () => {
    const {service} = setup(false);
    const view = await service.list('client-user', {});
    expect(view.data[0]).not.toHaveProperty('otherAvatarUrl');
  });
});
