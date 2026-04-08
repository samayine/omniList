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

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: AuthUser) {
    return this.propertiesService.create(dto, user);
  }

  @Get()
  findAll(@Query() filters: FilterPropertiesDto, @CurrentUser() user: AuthUser) {
    return this.propertiesService.findAll(filters, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.propertiesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.propertiesService.update(id, dto, user);
  }

  @Patch(':id/publish')
  @Roles(Role.OWNER, Role.ADMIN)
  publish(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.propertiesService.publish(id, user);
  }

  @Patch(':id/archive')
  @Roles(Role.OWNER, Role.ADMIN)
  archive(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.propertiesService.archive(id, user);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.propertiesService.remove(id, user);
  }
}
