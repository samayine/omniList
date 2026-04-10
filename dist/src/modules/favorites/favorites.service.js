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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FavoritesService = class FavoritesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async add(userId, propertyId) {
        const property = await this.prisma.property.findFirst({
            where: { id: propertyId, deletedAt: null },
            select: { id: true },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found.');
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
    async list(userId) {
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
    async remove(userId, propertyId) {
        const favorite = await this.prisma.favorite.findUnique({
            where: { userId_propertyId: { userId, propertyId } },
            select: { id: true },
        });
        if (!favorite) {
            throw new common_1.NotFoundException('Favorite not found.');
        }
        await this.prisma.favorite.delete({
            where: { userId_propertyId: { userId, propertyId } },
        });
        return { message: 'Favorite removed.' };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map