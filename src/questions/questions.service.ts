import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const { choices, position_ids, ...questionData } = createQuestionDto;

    return this.prisma.question.create({
      data: {
        ...questionData,
        choices: {
          create: choices,
        },
        positions: position_ids
          ? {
              create: position_ids.map((id) => ({
                position: { connect: { id } },
              })),
            }
          : undefined,
      },
      include: { choices: true, positions: { include: { position: true } } },
    });
  }

  findAll() {
    return this.prisma.question.findMany({ include: { choices: true, subject: true, positions: true } });
  }

  findOne(id: number) {
    return this.prisma.question.findUnique({ where: { id }, include: { choices: true, subject: true, positions: true } });
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const { choices, position_ids, ...questionData } = updateQuestionDto;

    // For many-to-many relations, it's often easiest to delete existing relations and create new ones.
    // This is wrapped in a transaction to ensure atomicity.
    return this.prisma.$transaction(async (tx) => {
      // 1. Update the basic question data
      const updatedQuestion = await tx.question.update({
        where: { id },
        data: {
          ...questionData,
        },
      });

      // 2. If position_ids are provided, update the relations
      if (position_ids) {
        // Delete all existing relations for this question
        await tx.positionQuestion.deleteMany({ where: { question_id: id } });

        // Create new relations
        await tx.positionQuestion.createMany({
          data: position_ids.map((posId) => ({
            question_id: id,
            position_id: posId,
          })),
        });
      }

      // 3. If choices are provided, update them (complex logic, simplified here)
      if (choices) {
        await tx.choice.deleteMany({ where: { question_id: id } });
        await tx.choice.createMany({
          data: choices.map(choice => ({ ...choice, question_id: id }))
        });
      }

      // 4. Return the fully updated question with all relations
      return tx.question.findUnique({ 
        where: { id }, 
        include: { choices: true, positions: { include: { position: true } } }
      });
    });
  }

  remove(id: number) {
    return this.prisma.question.delete({ where: { id } });
  }
}
