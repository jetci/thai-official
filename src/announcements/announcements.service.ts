import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found.`);
    }
    return announcement;
  }

  async create(createAnnouncementDto: CreateAnnouncementDto, authorId: string) {
    const { title, content } = createAnnouncementDto;
    try {
      return await this.prisma.announcement.create({
        data: {
          title,
          content,
          authorId,
        } as Prisma.AnnouncementUncheckedCreateInput,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Invalid authorId. The specified author does not exist.',
          );
        }
      }
      throw error;
    }
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    const { title, content } = updateAnnouncementDto;
    try {
      return await this.prisma.announcement.update({
        where: { id },
        data: { title, content }, // Allow-list for updatable fields
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Announcement with ID ${id} not found.`);
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.announcement.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Announcement with ID ${id} not found.`);
        }
      }
      throw error;
    }
  }
}
