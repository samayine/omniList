import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    metrics(): Promise<{
        users: number;
        properties: {
            total: number;
            published: number;
            draft: number;
            archived: number;
        };
        favorites: number;
    }>;
    properties(page?: number, limit?: number): import("@prisma/client").Prisma.PrismaPromise<({
        favorites: {
            id: string;
            userId: string;
        }[];
        owner: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
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
    })[]>;
    disableProperty(id: string): Promise<{
        owner: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
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
    }>;
    restoreProperty(id: string): Promise<{
        owner: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
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
    }>;
}
