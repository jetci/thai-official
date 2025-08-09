import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createQuestionDto: CreateQuestionDto): Promise<{
        positions: ({
            position: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            question_id: number;
            position_id: number;
        })[];
        choices: {
            id: number;
            choice_text: string;
            is_correct: boolean;
            question_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        question_text: string;
        subject_id: number;
        difficulty: string | null;
        updated_at: Date;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        subject: {
            id: number;
            name: string;
        };
        positions: {
            question_id: number;
            position_id: number;
        }[];
        choices: {
            id: number;
            choice_text: string;
            is_correct: boolean;
            question_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        question_text: string;
        subject_id: number;
        difficulty: string | null;
        updated_at: Date;
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__QuestionClient<{
        subject: {
            id: number;
            name: string;
        };
        positions: {
            question_id: number;
            position_id: number;
        }[];
        choices: {
            id: number;
            choice_text: string;
            is_correct: boolean;
            question_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        question_text: string;
        subject_id: number;
        difficulty: string | null;
        updated_at: Date;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, updateQuestionDto: UpdateQuestionDto): Promise<{
        positions: ({
            position: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            question_id: number;
            position_id: number;
        })[];
        choices: {
            id: number;
            choice_text: string;
            is_correct: boolean;
            question_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        question_text: string;
        subject_id: number;
        difficulty: string | null;
        updated_at: Date;
    }>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__QuestionClient<{
        id: number;
        created_at: Date;
        question_text: string;
        subject_id: number;
        difficulty: string | null;
        updated_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
