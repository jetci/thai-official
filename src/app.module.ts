import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AnnouncementsModule } from './announcements/announcements.module';
import { SubjectsModule } from './subjects/subjects.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    /*AnnouncementsModule, SubjectsModule,*/ AuthModule, UsersModule, PrismaModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
