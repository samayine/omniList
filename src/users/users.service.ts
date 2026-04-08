import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
      },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email?.toLowerCase(),
        role: dto.role,
      },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted.' };
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
  }
}
