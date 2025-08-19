import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  announcement: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let prisma: PrismaService;

  const mockAnnouncementId = 'clxkz2npi0000a8b4c3d2e1f0';
  const mockAuthorId = 'clxkz2npi0001a8b4c3d2e1f1';
  const mockAnnouncement = {
    id: mockAnnouncementId,
    title: 'Test Announcement',
    content: 'This is a test.',
    authorId: mockAuthorId,
    published: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of announcements', async () => {
      prisma.announcement.findMany = jest.fn().mockResolvedValue([mockAnnouncement]);
      const result = await service.findAll();
      expect(result).toEqual([mockAnnouncement]);
      expect(prisma.announcement.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
    });
  });

  describe('findOne', () => {
    it('should return a single announcement', async () => {
      prisma.announcement.findUnique = jest.fn().mockResolvedValue(mockAnnouncement);
      const result = await service.findOne(mockAnnouncementId);
      expect(result).toEqual(mockAnnouncement);
      expect(prisma.announcement.findUnique).toHaveBeenCalledWith({ where: { id: mockAnnouncementId } });
    });

    it('should throw NotFoundException if announcement is not found', async () => {
      prisma.announcement.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.findOne(mockAnnouncementId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new announcement', async () => {
      const dto: CreateAnnouncementDto = { title: 'New', content: 'Content' };
      prisma.announcement.create = jest.fn().mockResolvedValue(mockAnnouncement);
      const result = await service.create(dto, mockAuthorId);
      expect(result).toEqual(mockAnnouncement);
      expect(prisma.announcement.create).toHaveBeenCalledWith({
        data: { ...dto, authorId: mockAuthorId },
      });
    });

    it('should throw BadRequestException on foreign key error (P2003)', async () => {
      const dto: CreateAnnouncementDto = { title: 'New', content: 'Content' };
      const error = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', { code: 'P2003', clientVersion: '5.x.x' });
      prisma.announcement.create = jest.fn().mockRejectedValue(error);
      await expect(service.create(dto, 'invalid-author-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update an announcement', async () => {
      const dto: UpdateAnnouncementDto = { title: 'Updated', content: 'Updated Content' };
      prisma.announcement.update = jest.fn().mockResolvedValue(mockAnnouncement);
      const result = await service.update(mockAnnouncementId, dto);
      expect(result).toEqual(mockAnnouncement);
      expect(prisma.announcement.update).toHaveBeenCalledWith({
        where: { id: mockAnnouncementId },
        data: dto,
      });
    });

    it('should throw NotFoundException on update if announcement not found (P2025)', async () => {
      const dto: UpdateAnnouncementDto = { title: 'Updated' };
      const error = new Prisma.PrismaClientKnownRequestError('Record to update not found.', { code: 'P2025', clientVersion: '5.x.x' });
      prisma.announcement.update = jest.fn().mockRejectedValue(error);
      await expect(service.update(mockAnnouncementId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an announcement', async () => {
      prisma.announcement.delete = jest.fn().mockResolvedValue(mockAnnouncement);
      const result = await service.remove(mockAnnouncementId);
      expect(result).toEqual(mockAnnouncement);
      expect(prisma.announcement.delete).toHaveBeenCalledWith({ where: { id: mockAnnouncementId } });
    });

    it('should throw NotFoundException on remove if announcement not found (P2025)', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record to delete not found.', { code: 'P2025', clientVersion: '5.x.x' });
      prisma.announcement.delete = jest.fn().mockRejectedValue(error);
      await expect(service.remove(mockAnnouncementId)).rejects.toThrow(NotFoundException);
    });
  });
});
