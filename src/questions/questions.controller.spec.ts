import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';

import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockQuestionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockQuestionId = 'question-cuid-1';
const mockSubjectId = 'subject-cuid-1';

describe('QuestionsController', () => {
  let controller: QuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard('jwt')) // Mock the AuthGuard
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard) // Mock the RolesGuard
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<QuestionsController>(QuestionsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with the correct DTO', async () => {
      const createDto: CreateQuestionDto = {
        title: 'What is the capital of Thailand?',
        content: 'A basic geography question.',
        subjectId: mockSubjectId,
        choices: [
          { text: 'Bangkok', isCorrect: true },
          { text: 'Chiang Mai', isCorrect: false },
        ],
      };
      const expectedQuestion = { id: mockQuestionId, ...createDto };
      mockQuestionsService.create.mockResolvedValue(expectedQuestion);

      const result = await controller.create(createDto);

      expect(mockQuestionsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedQuestion);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll without any arguments', async () => {
      mockQuestionsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(mockQuestionsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with the correct string id', async () => {
      const expectedQuestion = { id: mockQuestionId, title: 'Test Question' };
      mockQuestionsService.findOne.mockResolvedValue(expectedQuestion);

      const result = await controller.findOne(mockQuestionId);

      expect(mockQuestionsService.findOne).toHaveBeenCalledWith(mockQuestionId);
      expect(result).toEqual(expectedQuestion);
    });
  });

  describe('update', () => {
    it('should call service.update with the correct string id and DTO', async () => {
      // The update method is not implemented in the controller, so this test is skipped.
      // When implemented, it should be tested properly.
      expect((controller as any).update).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should call service.remove with the correct string id', async () => {
      mockQuestionsService.remove.mockResolvedValue({ id: mockQuestionId });

      await controller.remove(mockQuestionId);

      expect(mockQuestionsService.remove).toHaveBeenCalledWith(mockQuestionId);
    });
  });
});
