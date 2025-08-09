import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';


@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const { choices, subjectId, ...questionData } = createQuestionDto;

    // Validation: Ensure at least one choice is correct
    const hasCorrectChoice = choices.some((choice) => choice.isCorrect);
    if (!hasCorrectChoice) {
      throw new BadRequestException('At least one choice must be correct.');
    }

    // Validation: Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found.`);
    }

    return this.prisma.question.create({
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
    });
  }

  findAll() {
    return this.prisma.question.findMany({
      include: {
        choices: true,
        subject: true,
      },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        choices: true,
        subject: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found.`);
    }
    return question;
  }

  // We will implement update later

  async remove(id: string) {
    // First, ensure the question exists
    await this.findOne(id);

    // Prisma's onDelete: Cascade on the Choice model will handle deleting related choices.
    return this.prisma.question.delete({
      where: { id },
    });
  }
}
