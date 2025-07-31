import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        id: number;
        password_hash: string;
        full_name: string | null;
        role_id: number;
        created_at: Date;
        updated_at: Date;
    }>;
    findOneByEmail(email: string): Promise<{
        email: string;
        id: number;
        password_hash: string;
        full_name: string | null;
        role_id: number;
        created_at: Date;
        updated_at: Date;
    }>;
}
