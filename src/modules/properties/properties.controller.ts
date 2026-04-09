import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new property (starts as DRAFT)' })
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: AuthUser) {
    return this.propertiesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List properties with filtering and pagination' })
  findAll(@Query() filters: FilterPropertiesDto, @CurrentUser() user: AuthUser) {
    return this.propertiesService.findAll(filters, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single property by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.propertiesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update property content (DRAFT only unless ADMIN)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.propertiesService.update(id, dto, user);
  }

  @Patch(':id/publish')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Publish a DRAFT property (validates completeness)' })
  publish(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.propertiesService.publish(id, user);
  }

  @Patch(':id/archive')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Archive a property' })
  archive(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.propertiesService.archive(id, user);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Soft-delete a property (sets deletedAt)' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.propertiesService.remove(id, user);
  }
}

