import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async metrics() {
    const [users, properties, favorites, publishedProperties] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count({ where: { deletedAt: null } }),
      this.prisma.favorite.count(),
      this.prisma.property.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    ]);

    return {
      users,
      properties,
      publishedProperties,
      favorites,
    };
  }

  findAllProperties() {
    return this.prisma.property.findMany({
      include: {
        images: true,
        owner: { select: { id: true, email: true, role: true } },
        favorites: { select: { id: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
