import type { AuthUser } from '../../common/types/auth-user.type';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(dto: CreatePropertyDto, user: AuthUser): Promise<{
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
    findAll(filters: FilterPropertiesDto, user: AuthUser): Promise<{
        data: ({
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: AuthUser): Promise<{
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
    update(id: string, dto: UpdatePropertyDto, user: AuthUser): Promise<{
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
    publish(id: string, user: AuthUser): Promise<{
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
    archive(id: string, user: AuthUser): Promise<{
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
    remove(id: string, user: AuthUser): Promise<{
        message: string;
    }>;
}
