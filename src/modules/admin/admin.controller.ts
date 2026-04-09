import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get platform-level metrics (users, properties, favorites)' })
  metrics() {
    return this.adminService.metrics();
  }

  @Get('properties')
  @ApiOperation({ summary: 'List all properties (including non-published)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  properties(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.findAllProperties(Number(page) || 1, Number(limit) || 20);
  }

  @Patch('properties/:id/disable')
  @ApiOperation({ summary: 'Disable (archive) any property — admin override' })
  disableProperty(@Param('id') id: string) {
    return this.adminService.disableProperty(id);
  }
}

