import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import { Status } from '../../common/enums/status.enum';
import type { AuthUser } from '../../common/types/auth-user.type';

import { CreatePropertyDto } from './dto/create-property.dto';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: {
    property: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    propertyImage: {
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockOwner: AuthUser = {
    sub: 'owner-1',
    email: 'owner@omnilist.local',
    role: Role.OWNER,
  };

  const mockOtherUser: AuthUser = {
    sub: 'other-user',
    email: 'other@omnilist.local',
    role: Role.USER,
  };

  const mockAdmin: AuthUser = {
    sub: 'admin-1',
    email: 'admin@omnilist.local',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    prisma = {
      property: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      propertyImage: {
        count: jest.fn(),
      },
      $transaction: jest.fn(
        <T>(callback: (tx: unknown) => Promise<T>): Promise<T> =>
          callback(prisma),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  describe('create', () => {
    it('creates property with status DRAFT and associates with authenticated owner', async () => {
      const dto: CreatePropertyDto = {
        title: 'Luxury Villa',
        description: 'Spectacular villa with pool and views',
        location: 'Beverly Hills, CA',
        price: 2500000,
        images: [
          {
            url: 'https://images.com/villa.jpg',
            mimeType: 'image/jpeg',
            sizeBytes: 5000,
          },
        ],
      };

      const expected = {
        id: 'prop-1',
        ...dto,
        status: Status.DRAFT,
        ownerId: mockOwner.sub,
      };
      prisma.property.create.mockResolvedValue(expected);

      const result = await service.create(dto, mockOwner);

      expect(prisma.property.create).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callArg = prisma.property.create.mock.calls[0][0] as {
        data: { status: Status; ownerId: string };
      };
      expect(callArg.data.status).toBe(Status.DRAFT);
      expect(callArg.data.ownerId).toBe(mockOwner.sub);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne visibility rules', () => {
    it('throws NotFoundException if property does not exist', async () => {
      prisma.property.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', mockOwner)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('allows visitors to view PUBLISHED properties', async () => {
      const published = {
        id: 'p1',
        status: Status.PUBLISHED,
        ownerId: 'someone',
      };
      prisma.property.findFirst.mockResolvedValue(published);

      const result = await service.findOne('p1', null as unknown as AuthUser);
      expect(result).toEqual(published);
    });

    it('forbids regular users from viewing DRAFT properties', async () => {
      const draft = { id: 'p1', status: Status.DRAFT, ownerId: 'someone' };
      prisma.property.findFirst.mockResolvedValue(draft);

      await expect(service.findOne('p1', mockOtherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows owners to view their own DRAFT property', async () => {
      const ownDraft = {
        id: 'p1',
        status: Status.DRAFT,
        ownerId: mockOwner.sub,
      };
      prisma.property.findFirst.mockResolvedValue(ownDraft);

      const result = await service.findOne('p1', mockOwner);
      expect(result).toEqual(ownDraft);
    });

    it('forbids owners from viewing another owner DRAFT property', async () => {
      const otherDraft = {
        id: 'p1',
        status: Status.DRAFT,
        ownerId: 'other-owner',
      };
      prisma.property.findFirst.mockResolvedValue(otherDraft);

      await expect(service.findOne('p1', mockOwner)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('publish', () => {
    it('rejects publishing if required fields or images are missing', async () => {
      const incompleteDraft = {
        id: 'p1',
        title: 'Ab', // too short (<3)
        description: 'Short', // too short (<10)
        location: '',
        price: 0,
        status: Status.DRAFT,
        ownerId: mockOwner.sub,
      };

      prisma.property.findFirst.mockResolvedValue(incompleteDraft);
      prisma.propertyImage.count.mockResolvedValue(0);

      await expect(service.publish('p1', mockOwner)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('publishes valid draft and sets publishedAt timestamp', async () => {
      const completeDraft = {
        id: 'p1',
        title: 'Luxury Villa',
        description: 'Complete description with plenty of characters',
        location: 'Miami, FL',
        price: 1500000,
        status: Status.DRAFT,
        ownerId: mockOwner.sub,
      };

      prisma.property.findFirst.mockResolvedValue(completeDraft);
      prisma.propertyImage.count.mockResolvedValue(2);
      prisma.property.update.mockResolvedValue({
        ...completeDraft,
        status: Status.PUBLISHED,
        publishedAt: new Date(),
      });

      const result = await service.publish('p1', mockOwner);

      expect(result.status).toBe(Status.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
    });
  });

  describe('ensureOwnedOrAdmin enforcement', () => {
    it('throws ForbiddenException when a non-owner attempts to archive property', async () => {
      const otherProp = {
        id: 'p1',
        status: Status.PUBLISHED,
        ownerId: 'other-owner',
      };
      prisma.property.findFirst.mockResolvedValue(otherProp);

      await expect(service.archive('p1', mockOwner)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows ADMIN to archive a property owned by someone else', async () => {
      const userProp = {
        id: 'p1',
        status: Status.PUBLISHED,
        ownerId: 'other-owner',
      };
      prisma.property.findFirst.mockResolvedValue(userProp);
      prisma.property.update.mockResolvedValue({
        ...userProp,
        status: Status.ARCHIVED,
      });

      const result = await service.archive('p1', mockAdmin);
      expect(result.status).toBe(Status.ARCHIVED);
    });
  });
});
