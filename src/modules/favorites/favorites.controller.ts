import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/types/auth-user.type';
import { FavoriteDto } from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a property to user favorites (upsert)' })
  add(@Body() dto: FavoriteDto, @CurrentUser() user: AuthUser) {
    return this.favoritesService.add(user.sub, dto.propertyId);
  }

  @Get()
  @ApiOperation({ summary: 'List all favorite properties for the current user' })
  list(@CurrentUser() user: AuthUser) {
    return this.favoritesService.list(user.sub);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a property from user favorites' })
  remove(@Body() dto: FavoriteDto, @CurrentUser() user: AuthUser) {
    return this.favoritesService.remove(user.sub, dto.propertyId);
  }
}
