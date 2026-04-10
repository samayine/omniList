import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { createCloudinaryStorage } from './cloudinary.storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  @Post('images')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Upload up to 10 property images directly to Cloudinary (JPEG, PNG, WebP, GIF — max 5 MB each)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: createCloudinaryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  uploadImages(@UploadedFiles() files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required.');
    }

    // Cloudinary returns the full absolute URL in 'path' or 'secure_url' depending on the version
    return files.map((file, index) => ({
      url: file.path || file.secure_url,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      order: index,
    }));
  }
}
