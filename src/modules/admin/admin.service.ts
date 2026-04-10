import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async metrics() {
    const [totalUsers, totalProperties, publishedProperties, draftProperties, archivedProperties, totalFavorites] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.property.count({ where: { deletedAt: null } }),
        this.prisma.property.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
        this.prisma.property.count({ where: { status: 'DRAFT', deletedAt: null } }),
        this.prisma.property.count({ where: { status: 'ARCHIVED', deletedAt: null } }),
        this.prisma.favorite.count(),
      ]);

    return {
      users: totalUsers,
      properties: {
        total: totalProperties,
        published: publishedProperties,
        draft: draftProperties,
        archived: archivedProperties,
      },
      favorites: totalFavorites,
    };
  }

  findAllProperties(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.property.findMany({
      include: {
        images: true,
        owner: { select: { id: true, email: true, role: true } },
        favorites: { select: { id: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  // Admin: disable (archive) any property regardless of owner
  async disableProperty(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
    });
    if (!property) {
      throw new NotFoundException('Property not found.');
    }
    return this.prisma.property.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: { images: true, owner: { select: { id: true, email: true, role: true } } },
    });
  }

  // Admin: restore an archived property back to DRAFT
  async restoreProperty(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null, status: 'ARCHIVED' },
    });
    if (!property) {
      throw new NotFoundException('Archived property not found.');
    }
    return this.prisma.property.update({
      where: { id },
      data: { status: 'DRAFT' },
      include: { images: true, owner: { select: { id: true, email: true, role: true } } },
    });
  }
}
