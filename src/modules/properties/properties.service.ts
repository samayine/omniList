import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { Status } from '../../common/enums/status.enum';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePropertyDto, user: AuthUser) {
    return this.prisma.property.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        price: dto.price,
        status: dto.status ?? Status.DRAFT,
        publishedAt: dto.status === Status.PUBLISHED ? new Date() : null,
        ownerId: user.sub,
        images: {
          create:
            dto.images?.map((url, index) => ({
              url,
              order: index,
            })) ?? [],
        },
      },
      include: {
        images: true,
      },
    });
  }

  findAll(user: AuthUser) {
    const where =
      user.role === Role.ADMIN
        ? { deletedAt: null }
        : { deletedAt: null, OR: [{ status: Status.PUBLISHED }, { ownerId: user.sub }] };

    return this.prisma.property.findMany({
      where,
      include: { images: true, owner: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: AuthUser) {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: { images: true, owner: { select: { id: true, email: true, role: true } } },
    });

    if (!property) throw new NotFoundException('Property not found.');

    if (
      user.role !== Role.ADMIN &&
      property.ownerId !== user.sub &&
      property.status !== Status.PUBLISHED
    ) {
      throw new ForbiddenException('Not allowed to view this property.');
    }

    return property;
  }

  async update(id: string, dto: UpdatePropertyDto, user: AuthUser) {
    const property = await this.ensureOwnedOrAdmin(id, user);

    return this.prisma.property.update({
      where: { id: property.id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        price: dto.price,
        status: dto.status,
        publishedAt:
          dto.status === Status.PUBLISHED && !property.publishedAt
            ? new Date()
            : property.publishedAt,
        images: dto.images
          ? {
              deleteMany: {},
              create: dto.images.map((url, index) => ({ url, order: index })),
            }
          : undefined,
      },
      include: { images: true },
    });
  }

  async remove(id: string, user: AuthUser) {
    const property = await this.ensureOwnedOrAdmin(id, user);
    await this.prisma.property.update({
      where: { id: property.id },
      data: { deletedAt: new Date(), status: Status.ARCHIVED },
    });
    return { message: 'Property archived.' };
  }

  private async ensureOwnedOrAdmin(id: string, user: AuthUser) {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
    });
    if (!property) {
      throw new NotFoundException('Property not found.');
    }
    if (user.role !== Role.ADMIN && property.ownerId !== user.sub) {
      throw new ForbiddenException('Not allowed to modify this property.');
    }
    return property;
  }
}
