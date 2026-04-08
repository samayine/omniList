import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthUser } from '../common/types/auth-user.type';
import { FavoriteDto } from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  add(@Body() dto: FavoriteDto, @CurrentUser() user: AuthUser) {
    return this.favoritesService.add(user.sub, dto.propertyId);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.favoritesService.list(user.sub);
  }

  @Delete()
  remove(@Body() dto: FavoriteDto, @CurrentUser() user: AuthUser) {
    return this.favoritesService.remove(user.sub, dto.propertyId);
  }
}
