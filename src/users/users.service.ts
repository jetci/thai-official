import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // TODO: Assign a default role, e.g., 'general_member'
    const defaultRoleId = 1; // Assuming 1 is the ID for 'general_member'

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password_hash: hashedPassword,
        roleId: defaultRoleId,
      },
    });
  }

  async findOneById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      // Select fields for security (don't send password_hash)
      select: {
        id: true,
        email: true,
        fullName: true,
        roleId: true,
      },
    });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
