import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { uploadAsset } from "../../common/storage";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  UpdateClientProfileDto,
  UploadPhotoDto,
} from "./dto/update-client-profile.dto";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });
    if (!profile) throw new NotFoundException("Client profile not found");
    return this.serialize(profile);
  }

  async updateMe(userId: string, dto: UpdateClientProfileDto) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException("Client profile not found");
    if (dto.fullName !== undefined && dto.fullName.trim().length < 2)
      throw new BadRequestException("Add your full name");
    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.email !== undefined)
        await tx.user.update({
          where: { id: userId },
          data: { email: dto.email.trim().toLowerCase() },
        });
      const result = await tx.clientProfile.update({
        where: { id: profile.id },
        data: {
          ...(dto.fullName !== undefined
            ? { fullName: dto.fullName.trim() }
            : {}),
          ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
          ...(dto.postalCode !== undefined
            ? { postalCode: dto.postalCode }
            : {}),
          ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
          ...(dto.city !== undefined ? { city: dto.city.trim() } : {}),
          ...(dto.state !== undefined ? { state: dto.state.trim() } : {}),
          ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
          ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
        },
        include: { user: { select: { email: true } } },
      });
      await tx.auditLog.create({
        data: {
          userId,
          action: "PROFILE_UPDATED",
          entity: "ClientProfile",
          entityId: profile.id,
        },
      });
      return result;
    });
    return this.serialize(updated);
  }

  async photo(userId: string, dto: UploadPhotoDto) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException("Client profile not found");
    const content = Buffer.from(dto.contentBase64, "base64");
    const extension =
      dto.mimeType === "image/jpeg"
        ? "jpg"
        : dto.mimeType === "image/png"
        ? "png"
        : "webp";
    const valid =
      extension === "jpg"
        ? content.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
        : extension === "png"
        ? content
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : content.subarray(0, 4).toString() === "RIFF" &&
          content.subarray(8, 12).toString() === "WEBP";
    if (!valid || content.length > 1000000)
      throw new BadRequestException(
        "Choose a JPG, PNG or WebP image under 1 MB"
      );
    const filename = `${randomUUID()}.${extension}`;
    const avatarUrl = await uploadAsset('avatars', filename, content, dto.mimeType);
    await this.prisma.clientProfile.update({
      where: { id: profile.id },
      data: { avatarUrl },
    });
    return { avatarUrl };
  }

  private serialize(profile: {
    id: string;
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    address: string | null;
    postalCode?: string | null;
    user?: { email: string | null };
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
  }) {
    return {
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl ?? undefined,
      address: profile.address ?? undefined,
      postalCode: profile.postalCode ?? undefined,
      email: profile.user?.email ?? undefined,
      city: profile.city ?? undefined,
      state: profile.state ?? undefined,
      latitude: profile.latitude ?? undefined,
      longitude: profile.longitude ?? undefined,
    };
  }
}
