import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { Status } from '../../common/enums/status.enum';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ──────────────────────────────────────────────
  // Properties always start as DRAFT. Only OWNER/ADMIN can create.
  async create(dto: CreatePropertyDto, user: AuthUser) {
    return this.prisma.property.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        price: dto.price,
        status: Status.DRAFT,
        ownerId: user.sub,
        images: {
          create:
            dto.images?.map((img, index) => ({
              url: img.url,
              mimeType: img.mimeType,
              sizeBytes: img.sizeBytes,
              order: index,
            })) ?? [],
        },
      },
      include: { images: true },
    });
  }

  // ── Find All (with filtering & pagination) ─────────────
  async findAll(filters: FilterPropertiesDto, user: AuthUser) {
    const { search, location, minPrice, maxPrice, status, page = 1, limit = 10, onlyMine } = filters;
    const skip = (page - 1) * limit;

    // Build the WHERE clause based on role
    const where: any = { deletedAt: null };

    if (onlyMine && user?.role === Role.OWNER) {
      // "My Listings" — only the caller's own properties, all statuses
      where.ownerId = user.sub;
    } else if (!user || user.role === Role.USER) {
      where.status = Status.PUBLISHED;
    } else if (user.role === Role.OWNER) {
      where.OR = [
        { status: Status.PUBLISHED },
        { ownerId: user.sub },
      ];
    }
    // ADMIN: no extra filter — sees all non-deleted

    // Keyword search across title, description, AND location
    if (search) {
      const searchClause = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      };
      // Merge with any existing OR clause (OWNER role builds one above)
      if (where.OR) {
        where.AND = [{ OR: where.OR }, searchClause];
        delete where.OR;
      } else {
        Object.assign(where, searchClause);
      }
    }

    // Apply remaining filters
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (status) {
      // Override the role-based status filter if explicitly requested
      // (only meaningful for ADMIN/OWNER who can see non-published)
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          images: true,
          owner: { select: { id: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Find One ───────────────────────────────────────────
  async findOne(id: string, user: AuthUser) {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: true,
        owner: { select: { id: true, email: true, role: true } },
      },
    });

    if (!property) throw new NotFoundException('Property not found.');

    if (!property) throw new NotFoundException('Property not found.');

    // Unauthenticated visitors and regular users can only see published properties
    if (
      (!user || user.role === Role.USER) &&
      property.status !== Status.PUBLISHED
    ) {
      throw new ForbiddenException('Not allowed to view this property.');
    }

    // Owners can see their own + published
    if (
      user?.role === Role.OWNER &&
      property.ownerId !== user.sub &&
      property.status !== Status.PUBLISHED
    ) {
      throw new ForbiddenException('Not allowed to view this property.');
    }

    return property;
  }

  // ── Update (content only, NOT status) ──────────────────
  async update(id: string, dto: UpdatePropertyDto, user: AuthUser) {
    const property = await this.ensureOwnedOrAdmin(id, user);

    // Can only edit DRAFT properties (published ones should not be silently modified)
    if (property.status !== Status.DRAFT && user.role !== Role.ADMIN) {
      throw new BadRequestException('Only DRAFT properties can be edited. Archive it first.');
    }

    return this.prisma.property.update({
      where: { id: property.id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        price: dto.price,
        images: dto.images
          ? {
              deleteMany: {},
              create: dto.images.map((img, index) => ({
                url: img.url,
                mimeType: img.mimeType,
                sizeBytes: img.sizeBytes,
                order: index,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });
  }

  // ── Publish (transactional with validation) ────────────
  async publish(id: string, user: AuthUser) {
    const property = await this.ensureOwnedOrAdmin(id, user);

    if (property.status !== Status.DRAFT) {
      throw new BadRequestException(
        `Cannot publish a property with status "${property.status}". Only DRAFT properties can be published.`,
      );
    }

    // Validation: ensure the property is complete before publishing
    const errors: string[] = [];
    if (!property.title || property.title.length < 3) {
      errors.push('Title must be at least 3 characters.');
    }
    if (!property.description || property.description.length < 10) {
      errors.push('Description must be at least 10 characters.');
    }
    if (!property.location) {
      errors.push('Location is required.');
    }
    if (property.price <= 0) {
      errors.push('Price must be greater than 0.');
    }

    // Check images exist
    const imageCount = await this.prisma.propertyImage.count({
      where: { propertyId: id },
    });
    if (imageCount === 0) {
      errors.push('At least one image is required to publish.');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Property is not ready to publish.',
        errors,
      });
    }

    // Transactional publish: update status + set publishedAt atomically
    return this.prisma.$transaction(async (tx) => {
      return tx.property.update({
        where: { id: property.id },
        data: {
          status: Status.PUBLISHED,
          publishedAt: new Date(),
        },
        include: { images: true },
      });
    });
  }

  // ── Archive ────────────────────────────────────────────
  async archive(id: string, user: AuthUser) {
    const property = await this.ensureOwnedOrAdmin(id, user);

    if (property.status === Status.ARCHIVED) {
      throw new BadRequestException('Property is already archived.');
    }

    return this.prisma.property.update({
      where: { id: property.id },
      data: { status: Status.ARCHIVED },
      include: { images: true },
    });
  }

  // ── Soft Delete ────────────────────────────────────────
  async remove(id: string, user: AuthUser) {
    const property = await this.ensureOwnedOrAdmin(id, user);
    await this.prisma.property.update({
      where: { id: property.id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Property deleted.' };
  }

  // ── Helper ─────────────────────────────────────────────
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
