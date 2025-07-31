import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AnnouncementsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        title: string;
        agency: string | null;
        details: string | null;
        application_start_date: Date | null;
        application_end_date: Date | null;
        official_link: string | null;
        created_at: Date;
    }[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__announcementsClient<{
        id: number;
        title: string;
        agency: string | null;
        details: string | null;
        application_start_date: Date | null;
        application_end_date: Date | null;
        official_link: string | null;
        created_at: Date;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(createAnnouncementDto: CreateAnnouncementDto): import(".prisma/client").Prisma.Prisma__announcementsClient<{
        id: number;
        title: string;
        agency: string | null;
        details: string | null;
        application_start_date: Date | null;
        application_end_date: Date | null;
        official_link: string | null;
        created_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
