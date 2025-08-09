import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';

const mockPrismaService = {
  subject: {
    findUnique: jest.fn(),
  },
  question: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  positionQuestion: {
    deleteMany: jest.fn(),
  },
  // Mock the transaction to return the mock prisma client
  $transaction: jest.fn().mockImplementation(async (callback) => await callback(mockPrismaService)),
};

describe('QuestionsService', () => {
  let service: QuestionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockSubjectId = 'subject-cuid-1';
    const createQuestionDto: CreateQuestionDto = {
      title: 'Test Question',
      subjectId: mockSubjectId,
      choices: [{ text: 'Choice 1', isCorrect: true }],
    };

    it('should throw BadRequestException if no choice is correct', async () => {
      const dtoWithNoCorrectChoice = { ...createQuestionDto, choices: [{ text: 'Choice 1', isCorrect: false }] };
      await expect(service.create(dtoWithNoCorrectChoice)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if subject does not exist', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(null);
      await expect(service.create(createQuestionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create a question successfully using nested writes', async () => {
      const mockSubject = { id: mockSubjectId, name: 'Math' };
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);

      const { choices, subjectId, ...questionData } = createQuestionDto;
      const expectedPrismaCall = {
        data: {
          ...questionData,
          subject: {
            connect: { id: subjectId },
          },
          choices: {
            create: choices.map((choice) => ({
              text: choice.text,
              isCorrect: choice.isCorrect,
            })),
          },
        },
        include: {
          choices: true,
        },
      };

      const createdQuestion = { id: 'question-cuid-1', ...createQuestionDto };
      mockPrismaService.question.create.mockResolvedValue(createdQuestion);

      const result = await service.create(createQuestionDto);

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({ where: { id: mockSubjectId } });
      expect(prisma.question.create).toHaveBeenCalledWith(expectedPrismaCall);
      expect(result).toEqual(createdQuestion);
    });
  });

  describe('findAll', () => {
    it('should return an array of questions with choices and subject', async () => {
      const mockQuestions = [{ id: 'q-cuid-1', title: 'Test' }];
      mockPrismaService.question.findMany.mockResolvedValue(mockQuestions);

      const result = await service.findAll();
      expect(result).toEqual(mockQuestions);
      expect(prisma.question.findMany).toHaveBeenCalledWith({
        include: {
          choices: true,
          subject: true,
        },
      });
    });
  });

  describe('findOne', () => {
    const mockQuestionId = 'q-cuid-1';

    it('should return a single question or throw NotFoundException', async () => {
      const mockQuestion = { id: mockQuestionId, title: 'Test' };
      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      await expect(service.findOne(mockQuestionId)).resolves.toEqual(mockQuestion);

      mockPrismaService.question.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const mockQuestionId = 'q-cuid-1';

    it('should remove a question successfully', async () => {
      // Mock the findOne check
      mockPrismaService.question.findUnique.mockResolvedValue({ id: mockQuestionId });
      mockPrismaService.question.delete.mockResolvedValue({ id: mockQuestionId });

      await expect(service.remove(mockQuestionId)).resolves.toBeDefined();
      expect(prisma.question.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: mockQuestionId } }));
      expect(prisma.question.delete).toHaveBeenCalledWith({ where: { id: mockQuestionId } });
    });

    it('should throw NotFoundException if question to remove does not exist', async () => {
      mockPrismaService.question.findUnique.mockResolvedValue(null);
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
