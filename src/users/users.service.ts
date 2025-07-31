import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

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
        full_name: createUserDto.fullName,
        password_hash: hashedPassword,
        role_id: defaultRoleId,
      },
    });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // We will add findOne by ID later for fetching user profile
}
