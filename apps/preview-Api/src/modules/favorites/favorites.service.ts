import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      select: { professionalId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, professionalId: string) {
    const professional = await this.prisma.professionalProfile.findUnique({ where: { id: professionalId } });
    if (!professional) throw new NotFoundException('Professional not found');
    return this.prisma.favorite.upsert({
      where: { userId_professionalId: { userId, professionalId } },
      create: { userId, professionalId },
      update: {},
      select: { professionalId: true, createdAt: true },
    });
  }

  async remove(userId: string, professionalId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, professionalId } });
    return { ok: true };
  }
}
