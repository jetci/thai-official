import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Fields to be selected for public-facing responses
  private readonly userSelect = {
    id: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
    profile: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
  };

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
        profile: {
          create: {
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
          },
        },
      },
      select: this.userSelect,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: this.userSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    const data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect,
    });
  }

  async remove(id: string) {
    // Check if user exists
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: `User with ID "${id}" has been successfully deleted.` };
  }

  // For internal auth use, includes password
  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
