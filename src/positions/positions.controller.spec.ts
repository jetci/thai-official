import { Test } from '@nestjs/testing';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

// Mock the actual services and guards
const mockPositionsService = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('PositionsController', () => {
  let controller: PositionsController;
  let service: PositionsService;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [PositionsController],
      providers: [
        { provide: PositionsService, useValue: mockPositionsService },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue(mockAuthGuard)
    .overrideGuard(RolesGuard).useValue(mockRolesGuard)
    .compile();

    controller = moduleRef.get<PositionsController>(PositionsController);
    service = moduleRef.get<PositionsService>(PositionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should call service.findOne and return the result', async () => {
      const id = 'pos_123';
      const result = { id, name: 'Officer', createdAt: new Date(), updatedAt: new Date() };
      mockPositionsService.findOne.mockResolvedValue(result);

      await expect(controller.findOne(id)).resolves.toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const createDto = { name: 'New Position' };
      const result = { id: 'pos_new', ...createDto, createdAt: new Date(), updatedAt: new Date() };
      mockPositionsService.create.mockResolvedValue(result);

      await expect(controller.create(createDto)).resolves.toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should call service.update and return the result', async () => {
      const id = 'pos_123';
      const updateDto = { name: 'Updated Position' };
      const result = { id, ...updateDto, createdAt: new Date(), updatedAt: new Date() };
      mockPositionsService.update.mockResolvedValue(result);

      await expect(controller.update(id, updateDto)).resolves.toEqual(result);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });
});
