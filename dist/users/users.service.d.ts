import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        email: string;
        fullName: string | null;
        password_hash: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
    }>;
    findOneById(id: number): Promise<{
        id: number;
        email: string;
        fullName: string;
        roleId: number;
    }>;
    findOneByEmail(email: string): Promise<{
        id: number;
        email: string;
        fullName: string | null;
        password_hash: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
    }>;
}
