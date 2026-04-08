import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      select: { id: true },
    });
    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    return this.prisma.favorite.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      update: {},
      create: { userId, propertyId },
      include: {
        property: { include: { images: true } },
      },
    });
  }

  async list(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: { images: true, owner: { select: { id: true, email: true } } },
        },
      },
      orderBy: { id: 'desc' },
    });

    return favorites.filter((favorite) => !favorite.property.deletedAt);
  }

  async remove(userId: string, propertyId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
      select: { id: true },
    });
    if (!favorite) {
      throw new NotFoundException('Favorite not found.');
    }

    await this.prisma.favorite.delete({
      where: { userId_propertyId: { userId, propertyId } },
    });
    return { message: 'Favorite removed.' };
  }
}
