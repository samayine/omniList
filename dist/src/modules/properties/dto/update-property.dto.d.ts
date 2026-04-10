import { ImageDto } from './image.dto';
export declare class UpdatePropertyDto {
    title?: string;
    description?: string;
    location?: string;
    price?: number;
    images?: ImageDto[];
}
