import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  create(createPositionDto: CreatePositionDto) {
    return this.prisma.position.create({ data: createPositionDto });
  }

  findAll() {
    return this.prisma.position.findMany();
  }

  findOne(id: string) {
    return this.prisma.position.findUnique({ where: { id } });
  }

  update(id: string, updatePositionDto: UpdatePositionDto) {
    return this.prisma.position.update({
      where: { id },
      data: updatePositionDto,
    });
  }

  remove(id: string) {
    return this.prisma.position.delete({ where: { id } });
  }
}
