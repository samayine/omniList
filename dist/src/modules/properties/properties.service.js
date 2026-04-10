"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../../common/enums/role.enum");
const status_enum_1 = require("../../common/enums/status.enum");
const prisma_service_1 = require("../../prisma/prisma.service");
let PropertiesService = class PropertiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        return this.prisma.property.create({
            data: {
                title: dto.title,
                description: dto.description,
                location: dto.location,
                price: dto.price,
                status: status_enum_1.Status.DRAFT,
                ownerId: user.sub,
                images: {
                    create: dto.images?.map((img, index) => ({
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
    async findAll(filters, user) {
        const { search, location, minPrice, maxPrice, status, page = 1, limit = 10, onlyMine } = filters;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (onlyMine && user?.role === role_enum_1.Role.OWNER) {
            where.ownerId = user.sub;
        }
        else if (!user || user.role === role_enum_1.Role.USER) {
            where.status = status_enum_1.Status.PUBLISHED;
        }
        else if (user.role === role_enum_1.Role.OWNER) {
            where.OR = [
                { status: status_enum_1.Status.PUBLISHED },
                { ownerId: user.sub },
            ];
        }
        if (search) {
            const searchClause = {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { location: { contains: search, mode: 'insensitive' } },
                ],
            };
            if (where.OR) {
                where.AND = [{ OR: where.OR }, searchClause];
                delete where.OR;
            }
            else {
                Object.assign(where, searchClause);
            }
        }
        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined)
                where.price.gte = minPrice;
            if (maxPrice !== undefined)
                where.price.lte = maxPrice;
        }
        if (status) {
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
    async findOne(id, user) {
        const property = await this.prisma.property.findFirst({
            where: { id, deletedAt: null },
            include: {
                images: true,
                owner: { select: { id: true, email: true, role: true } },
            },
        });
        if (!property)
            throw new common_1.NotFoundException('Property not found.');
        if (!property)
            throw new common_1.NotFoundException('Property not found.');
        if ((!user || user.role === role_enum_1.Role.USER) &&
            property.status !== status_enum_1.Status.PUBLISHED) {
            throw new common_1.ForbiddenException('Not allowed to view this property.');
        }
        if (user?.role === role_enum_1.Role.OWNER &&
            property.ownerId !== user.sub &&
            property.status !== status_enum_1.Status.PUBLISHED) {
            throw new common_1.ForbiddenException('Not allowed to view this property.');
        }
        return property;
    }
    async update(id, dto, user) {
        const property = await this.ensureOwnedOrAdmin(id, user);
        if (property.status !== status_enum_1.Status.DRAFT && user.role !== role_enum_1.Role.ADMIN) {
            throw new common_1.BadRequestException('Only DRAFT properties can be edited. Archive it first.');
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
    async publish(id, user) {
        const property = await this.ensureOwnedOrAdmin(id, user);
        if (property.status !== status_enum_1.Status.DRAFT) {
            throw new common_1.BadRequestException(`Cannot publish a property with status "${property.status}". Only DRAFT properties can be published.`);
        }
        const errors = [];
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
        const imageCount = await this.prisma.propertyImage.count({
            where: { propertyId: id },
        });
        if (imageCount === 0) {
            errors.push('At least one image is required to publish.');
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Property is not ready to publish.',
                errors,
            });
        }
        return this.prisma.$transaction(async (tx) => {
            return tx.property.update({
                where: { id: property.id },
                data: {
                    status: status_enum_1.Status.PUBLISHED,
                    publishedAt: new Date(),
                },
                include: { images: true },
            });
        });
    }
    async archive(id, user) {
        const property = await this.ensureOwnedOrAdmin(id, user);
        if (property.status === status_enum_1.Status.ARCHIVED) {
            throw new common_1.BadRequestException('Property is already archived.');
        }
        return this.prisma.property.update({
            where: { id: property.id },
            data: { status: status_enum_1.Status.ARCHIVED },
            include: { images: true },
        });
    }
    async remove(id, user) {
        const property = await this.ensureOwnedOrAdmin(id, user);
        await this.prisma.property.update({
            where: { id: property.id },
            data: { deletedAt: new Date() },
        });
        return { message: 'Property deleted.' };
    }
    async ensureOwnedOrAdmin(id, user) {
        const property = await this.prisma.property.findFirst({
            where: { id, deletedAt: null },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found.');
        }
        if (user.role !== role_enum_1.Role.ADMIN && property.ownerId !== user.sub) {
            throw new common_1.ForbiddenException('Not allowed to modify this property.');
        }
        return property;
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map