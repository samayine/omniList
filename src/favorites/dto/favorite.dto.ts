import { IsString } from 'class-validator';

export class FavoriteDto {
  @IsString()
  propertyId: string;
}
