import {BadRequestException} from '@nestjs/common';
import {RequestsService} from './requests.service';

describe('service request reviews', () => {
  it('accepts feedback only for the owning client after completion and refreshes the pro rating', async () => {
    const create = jest.fn().mockResolvedValue({id: 'review-1', rating: 5});
    const aggregate = jest.fn().mockResolvedValue({_avg: {rating: 4.5}, _count: {rating: 2}});
    const updateRating = jest.fn().mockResolvedValue({});
    const prisma = {
      serviceRequest: {findFirst: jest.fn().mockResolvedValue({
        id: 'service-1', status: 'COMPLETED', clientProfileId: 'client-profile', professionalProfileId: 'pro-profile',
      })},
      review: {findUnique: jest.fn().mockResolvedValue(null), create, aggregate},
      professionalProfile: {update: updateRating},
    };

    const result = await new RequestsService(prisma as any, {emitUserUpdate: jest.fn()} as any, {dispatch: jest.fn()} as any).addServiceReview(
      'service-1', 'client-user', {rating: 5, comment: 'Clear communication and excellent work.'},
    );

    expect(prisma.serviceRequest.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {id: 'service-1', client: {userId: 'client-user'}},
    }));
    expect(create).toHaveBeenCalledWith(expect.objectContaining({data: expect.objectContaining({
      serviceRequestId: 'service-1', professionalProfileId: 'pro-profile', rating: 5,
    })}));
    expect(updateRating).toHaveBeenCalledWith({where: {id: 'pro-profile'}, data: {averageRating: 4.5, totalReviewsCount: 2}});
    expect(result).toMatchObject({id: 'review-1'});
  });

  it('rejects feedback before the service is completed', async () => {
    const create = jest.fn();
    const prisma = {
      serviceRequest: {findFirst: jest.fn().mockResolvedValue({id: 'service-1', status: 'IN_PROGRESS'})},
      review: {create},
    };

    await expect(new RequestsService(prisma as any, {emitUserUpdate: jest.fn()} as any, {dispatch: jest.fn()} as any).addServiceReview(
      'service-1', 'client-user', {rating: 5, comment: 'Still working'},
    )).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });
});
