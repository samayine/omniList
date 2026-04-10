import { PrismaService } from '../../prisma/prisma.service';
export declare class FavoritesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    add(userId: string, propertyId: string): Promise<{
        property: {
            images: {
                url: string;
                id: string;
                mimeType: string;
                sizeBytes: number;
                order: number;
                propertyId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            location: string;
            price: number;
            status: import("@prisma/client").$Enums.Status;
            deletedAt: Date | null;
            publishedAt: Date | null;
            ownerId: string;
        };
    } & {
        id: string;
        userId: string;
        propertyId: string;
    }>;
    list(userId: string): Promise<({
        property: {
            owner: {
                id: string;
                email: string;
            };
            images: {
                url: string;
                id: string;
                mimeType: string;
                sizeBytes: number;
                order: number;
                propertyId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            location: string;
            price: number;
            status: import("@prisma/client").$Enums.Status;
            deletedAt: Date | null;
            publishedAt: Date | null;
            ownerId: string;
        };
    } & {
        id: string;
        userId: string;
        propertyId: string;
    })[]>;
    remove(userId: string, propertyId: string): Promise<{
        message: string;
    }>;
}
