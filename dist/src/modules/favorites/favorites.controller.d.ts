import type { AuthUser } from '../../common/types/auth-user.type';
import { FavoriteDto } from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    add(dto: FavoriteDto, user: AuthUser): Promise<{
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
    list(user: AuthUser): Promise<({
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
    remove(dto: FavoriteDto, user: AuthUser): Promise<{
        message: string;
    }>;
}
