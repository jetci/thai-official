import { Test } from '@nestjs/testing';
import { PositionsService } from './positions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPrismaMock } from 'src/test/utils/prisma-mock';

describe('PositionsService', () => {
  let service: PositionsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PositionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(PositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an item by id (string)', async () => {
      const id = 'pos_123';
      const mockPosition = { id, name: 'Officer', createdAt: new Date(), updatedAt: new Date() };
      prisma.position.findUnique.mockResolvedValue(mockPosition);

      await expect(service.findOne(id)).resolves.toEqual(mockPosition);
      expect(prisma.position.findUnique).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('create', () => {
    it('should create a new position', async () => {
      const createDto = { name: 'New Position' };
      const expectedResult = { id: 'pos_new', ...createDto, createdAt: new Date(), updatedAt: new Date() };
      prisma.position.create.mockResolvedValue(expectedResult);

      await expect(service.create(createDto)).resolves.toEqual(expectedResult);
      expect(prisma.position.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('findAll', () => {
    it('should return an array of positions', async () => {
      const expectedResult = [{ id: 'pos_1', name: 'Admin', createdAt: new Date(), updatedAt: new Date() }];
      prisma.position.findMany.mockResolvedValue(expectedResult);

      await expect(service.findAll()).resolves.toEqual(expectedResult);
      expect(prisma.position.findMany).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a position', async () => {
      const id = 'pos_123';
      const expectedResult = { id, name: 'Deleted Position', createdAt: new Date(), updatedAt: new Date() };
      prisma.position.delete.mockResolvedValue(expectedResult);

      await expect(service.remove(id)).resolves.toEqual(expectedResult);
      expect(prisma.position.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('update', () => {
    it('should update a position', async () => {
      const id = 'pos_123';
      const updateDto = { name: 'Updated Position' };
      const expectedResult = { id, ...updateDto, createdAt: new Date(), updatedAt: new Date() };
      prisma.position.update.mockResolvedValue(expectedResult);

      await expect(service.update(id, updateDto)).resolves.toEqual(expectedResult);
      expect(prisma.position.update).toHaveBeenCalledWith({ where: { id }, data: updateDto });
    });
  });
});
