import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '../../../common/enums/property-type.enum';
import { ImageDto } from './image.dto';

export class CreatePropertyDto {
  @ApiProperty({ description: 'Property title', example: 'Modern Waterfront Villa' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ description: 'Detailed property description' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ description: 'Property city or address', example: 'Miami, FL' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Listing ask price in USD', example: 750000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ enum: PropertyType, default: PropertyType.APARTMENT })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional({ description: 'Number of bedrooms', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Number of bathrooms', example: 2.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ description: 'Total floor area in square feet', example: 1850 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  areaSqFt?: number;

  @ApiPropertyOptional({ description: 'List of amenities and highlights', example: ['Pool', 'Parking', 'AC'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ type: [ImageDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];
}
