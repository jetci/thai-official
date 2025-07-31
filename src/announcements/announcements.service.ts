import { Injectable } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.announcements.findMany();
  }

  findOne(id: number) {
    return this.prisma.announcements.findUnique({
      where: { id },
    });
  }

  create(createAnnouncementDto: CreateAnnouncementDto) {
    return this.prisma.announcements.create({
      data: createAnnouncementDto,
    });
  }
}
