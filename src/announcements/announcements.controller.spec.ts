import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Reflector } from '@nestjs/core';

const mockAnnouncementsService = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUser = { id: 'user-cuid', email: 'test@test.com', role: 'USER' };
const mockId = 'announcement-cuid';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        {
          provide: AnnouncementsService,
          useValue: mockAnnouncementsService,
        },
        Reflector, // RolesGuard dependency
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll and return an array', async () => {
      const result = await controller.findAll();
      expect(mockAnnouncementsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with the correct id', async () => {
      const announcement = { id: mockId, title: 'Test' };
      mockAnnouncementsService.findOne.mockResolvedValue(announcement);

      const result = await controller.findOne(mockId);
      expect(mockAnnouncementsService.findOne).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(announcement);
    });
  });

  describe('create', () => {
    it('should call service.create with correct data', async () => {
      const dto: CreateAnnouncementDto = { title: 'New Announcement', content: 'Details' };

      const expectedAnnouncement = { id: mockId, ...dto, authorId: mockUser.id };

      mockAnnouncementsService.create.mockResolvedValue(expectedAnnouncement);

      await controller.create(mockUser.id, dto);
      expect(mockAnnouncementsService.create).toHaveBeenCalledWith(dto, mockUser.id);
    });
  });

  describe('update', () => {
    it('should call service.update with correct data', async () => {
      const dto: UpdateAnnouncementDto = { title: 'Updated' };
      const expectedAnnouncement = { id: mockId, ...dto };

      mockAnnouncementsService.update.mockResolvedValue(expectedAnnouncement);

      await controller.update(mockId, dto);
      expect(mockAnnouncementsService.update).toHaveBeenCalledWith(mockId, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with the correct id', async () => {
      mockAnnouncementsService.remove.mockResolvedValue({ id: mockId });

      await controller.remove(mockId);
      expect(mockAnnouncementsService.remove).toHaveBeenCalledWith(mockId);
    });
  });
});
