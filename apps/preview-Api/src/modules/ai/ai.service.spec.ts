import {HttpException} from '@nestjs/common';
import {AiService} from './ai.service';

jest.mock('../../common/storage', () => ({
  downloadAsset: jest.fn().mockResolvedValue(Buffer.from('fake-image-bytes')),
  uploadAsset: jest.fn(),
  signedAssetUrl: jest.fn(async (value: string) => value),
}));

function setup() {
  const db: any = {
    $queryRaw: jest.fn().mockResolvedValue([{count: 1}]),
    $transaction: jest.fn(async (fn: any) => fn({aiMessage: {create: jest.fn(async ({data}: any) => ({id: 'm', ...data}))},
      aiConversation: {update: jest.fn()}})),
    aiConversation: {findFirst: jest.fn().mockResolvedValue({id: 'c', projectType: 'HOME_REPAIR'})},
    aiMessage: {findMany: jest.fn().mockResolvedValue([]), create: jest.fn(async ({data}: any) => ({id: 'm', ...data}))},
    aiRateCard: {findMany: jest.fn().mockResolvedValue([])},
    auditLog: {create: jest.fn()},
  };
  const billing = {assertAiAccess: jest.fn().mockResolvedValue(undefined)};
  const requests = {create: jest.fn(async (dto: any) => ({id: 'r', ...dto}))};
  const service = new AiService(db, billing as any, requests as any);
  return {db, billing, requests, service};
}

describe('AI paywall gating', () => {
  it('checks message quota before answering', async () => {
    const {billing, service} = setup();
    await service.message('u', 'c', {content: 'hello'} as any);
    expect(billing.assertAiAccess).toHaveBeenCalledWith('u', 'message');
  });

  it('checks subscription before generating plans', async () => {
    const {db, billing, service} = setup();
    db.aiDocument = {findMany: jest.fn().mockResolvedValue([])};
    db.aiProjectPlan = {findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(async ({data}: any) => ({id: 'p', ...data}))};
    await service.generatePlan('u', 'c', {} as any);
    expect(billing.assertAiAccess).toHaveBeenCalledWith('u', 'plan');
    expect(db.aiProjectPlan.create).toHaveBeenCalled();
  });

  it('propagates the 402 paywall without touching AI', async () => {
    const {db, billing, service} = setup();
    billing.assertAiAccess.mockRejectedValue(new HttpException({code: 'AI_SUBSCRIPTION_REQUIRED'}, 402));
    await expect(service.message('u', 'c', {content: 'hello'} as any)).rejects.toMatchObject({status: 402});
    expect(db.$queryRaw).not.toHaveBeenCalled();
  });
});

describe('AI rate cards', () => {
  it('prefers city rows over the ALL fallback and labels ranges', async () => {
    const {db, service} = setup();
    db.aiRateCard.findMany.mockResolvedValue([
      {serviceKey: 'ac-service', city: 'ALL', label: 'AC general service', minPaisa: 49900, maxPaisa: 79900, unit: 'unit', note: null},
      {serviceKey: 'ac-service', city: 'Chennai', label: 'AC general service', minPaisa: 59900, maxPaisa: 89900, unit: 'unit', note: null},
    ]);
    const cards = await service.rateCards('Chennai');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({city: 'Chennai', rangeLabel: '₹599–₹899 per unit'});
  });
  it('matches the city row regardless of case or surrounding spaces', async () => {
    const {db, service} = setup();
    db.aiRateCard.findMany.mockResolvedValue([]);
    await service.rateCards('  CHENNAI ');
    expect(db.aiRateCard.findMany).toHaveBeenCalledWith({
      where: {OR: [{city: {equals: 'CHENNAI', mode: 'insensitive'}}, {city: 'ALL'}]},
      orderBy: [{label: 'asc'}],
    });
  });
});

describe('AI plan detail', () => {
  it('returns owned plans and 404s otherwise', async () => {
    const {db, service} = setup();
    db.aiProjectPlan = {findFirst: jest.fn().mockResolvedValue({id: 'p', title: 'Plan'})};
    await expect(service.planDetail('u', 'p')).resolves.toMatchObject({id: 'p'});
    db.aiProjectPlan.findFirst.mockResolvedValue(null);
    await expect(service.planDetail('u', 'missing')).rejects.toMatchObject({status: 404});
  });
});

describe('AI quote requests', () => {
  it('fills missing fields from the plan and records the chat milestone', async () => {
    const {db, requests, service} = setup();
    db.aiProjectPlan = {findFirst: jest.fn().mockResolvedValue({id: 'p', title: 'AC plan', summary: 'Service two units', version: 2, conversationId: 'c'})};
    const result = await service.quoteRequest('u', 'p', {
      engineerProfileId: 'e', locationAddress: 'Chennai home', latitude: 13, longitude: 80,
    } as any);
    expect(result.id).toBe('r');
    expect(requests.create).toHaveBeenCalledWith(expect.objectContaining({
      projectTitle: 'AC plan', propertyType: 'Residential', engineerProfileId: 'e',
    }), 'u');
    expect(db.aiMessage.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({conversationId: 'c', type: 'SERVICE_RECOMMENDATION'}),
    }));
    expect(db.auditLog.create).toHaveBeenCalled();
  });

  it('rejects quote requests for missing plans', async () => {
    const {db, service} = setup();
    db.aiProjectPlan = {findFirst: jest.fn().mockResolvedValue(null)};
    await expect(service.quoteRequest('u', 'missing', {engineerProfileId: 'e'} as any)).rejects.toMatchObject({status: 404});
  });
});

describe('AI photo analysis', () => {
  it('refuses non-photo documents', async () => {
    const {db, service} = setup();
    db.aiDocument = {findFirst: jest.fn().mockResolvedValue({id: 'd', mimeType: 'application/pdf', status: 'READY'})};
    await expect(service.analyzeDocument('u', 'd', {} as any)).rejects.toMatchObject({status: 400});
  });

  it('stores the analysis as a chat message with urgency metadata', async () => {
    const {db, billing, service} = setup();
    db.aiDocument = {
      findFirst: jest.fn().mockResolvedValue({id: 'd', userId: 'u', fileName: 'leak.jpg', mimeType: 'image/jpeg',
        status: 'READY', storageUrl: 'supabase://nahtreek-private/ai-documents/x.jpg', conversationId: 'c', conversation: {projectType: 'REPAIR'}}),
      update: jest.fn(),
    };
    const {message} = await service.analyzeDocument('u', 'd', {} as any);
    expect(billing.assertAiAccess).toHaveBeenCalledWith('u', 'message');
    expect(db.aiDocument.update).toHaveBeenCalledWith(expect.objectContaining({where: {id: 'd'}}));
    expect(message.content).toMatch(/Photo analysis/);
    expect(db.aiMessage.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({conversationId: 'c', metadata: expect.objectContaining({kind: 'IMAGE_ANALYSIS', documentId: 'd'})}),
    }));
  });
});

describe('AI engine health', () => {
  it('reports the guided fallback honestly when no hosted model is configured', async () => {
    // Hermetic against a developer .env: AiService selects its provider at
    // construction time from ambient variables.
    const priorUrl = process.env.AI_PROVIDER_URL;
    const priorKey = process.env.AI_PROVIDER_API_KEY;
    delete process.env.AI_PROVIDER_URL;
    delete process.env.AI_PROVIDER_API_KEY;
    try {
      const {service} = setup();
      await expect(service.engineHealth()).resolves.toMatchObject({engine: 'guided-fallback', ok: true, vision: 'unsupported'});
    } finally {
      if (priorUrl !== undefined) process.env.AI_PROVIDER_URL = priorUrl;
      if (priorKey !== undefined) process.env.AI_PROVIDER_API_KEY = priorKey;
    }
  });
});
