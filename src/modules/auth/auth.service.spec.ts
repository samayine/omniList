import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates new user with hashed password and returns auth response', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');

      const mockCreated = {
        id: 'u1',
        email: 'newuser@omnilist.local',
        role: Role.USER,
      };
      prisma.user.create.mockResolvedValue(mockCreated);

      const result = await service.register({
        email: 'NewUser@OmniList.Local',
        password: 'Password123',
        role: Role.USER,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@omnilist.local',
          passwordHash: 'hashed-pass',
          role: Role.USER,
        },
      });
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user: mockCreated,
      });
    });

    it('throws UnauthorizedException if email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'exists@omnilist.local',
          password: 'Password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('validates password and returns access token on valid credentials', async () => {
      const mockUser = {
        id: 'u1',
        email: 'user@omnilist.local',
        passwordHash: 'hashed-pass',
        role: Role.USER,
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'user@omnilist.local',
        password: 'CorrectPassword',
      });

      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('throws UnauthorizedException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@omnilist.local',
          password: 'SomePassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@omnilist.local',
        passwordHash: 'hashed-pass',
        role: Role.USER,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'user@omnilist.local',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
