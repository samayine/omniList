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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async metrics() {
        const [totalUsers, totalProperties, publishedProperties, draftProperties, archivedProperties, totalFavorites] = await Promise.all([
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
    async disableProperty(id) {
        const property = await this.prisma.property.findFirst({
            where: { id, deletedAt: null },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found.');
        }
        return this.prisma.property.update({
            where: { id },
            data: { status: 'ARCHIVED' },
            include: { images: true, owner: { select: { id: true, email: true, role: true } } },
        });
    }
    async restoreProperty(id) {
        const property = await this.prisma.property.findFirst({
            where: { id, deletedAt: null, status: 'ARCHIVED' },
        });
        if (!property) {
            throw new common_1.NotFoundException('Archived property not found.');
        }
        return this.prisma.property.update({
            where: { id },
            data: { status: 'DRAFT' },
            include: { images: true, owner: { select: { id: true, email: true, role: true } } },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map