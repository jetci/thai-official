import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
export declare class AnnouncementsController {
    private readonly announcementsService;
    constructor(announcementsService: AnnouncementsService);
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
    findOne(id: string): Promise<{
        id: number;
        title: string;
        agency: string | null;
        details: string | null;
        application_start_date: Date | null;
        application_end_date: Date | null;
        official_link: string | null;
        created_at: Date;
    }>;
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
