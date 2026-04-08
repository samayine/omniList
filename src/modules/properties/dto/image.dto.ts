import { IsIn, IsNumber, IsString, IsUrl, Max, Min } from 'class-validator';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export class ImageDto {
  @IsUrl()
  url: string;

  @IsString()
  @IsIn(ALLOWED_MIME_TYPES, {
    message: `mimeType must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
  })
  mimeType: string;

  @IsNumber()
  @Min(1, { message: 'Image size must be at least 1 byte.' })
  @Max(MAX_IMAGE_SIZE, { message: 'Image size must not exceed 5MB.' })
  sizeBytes: number;
}
