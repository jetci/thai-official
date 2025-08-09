import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({ data: createSubjectDto });
  }

  findAll() {
    return this.prisma.subject.findMany();
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found.`);
    }
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    try {
      return await this.prisma.subject.update({
        where: { id },
        data: updateSubjectDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Subject with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.subject.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Subject with ID ${id} not found.`);
      }
      throw error;
    }
  }
}
