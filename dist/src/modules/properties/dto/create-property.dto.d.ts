import { ImageDto } from './image.dto';
export declare class CreatePropertyDto {
    title: string;
    description: string;
    location: string;
    price: number;
    images?: ImageDto[];
}
