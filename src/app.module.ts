import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';

import { AnnouncementsModule } from './announcements/announcements.module';
import { SubjectsModule } from './subjects/subjects.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PositionsModule } from './positions/positions.module';
import { QuestionsModule } from './questions/questions.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AtGuard } from './common/guards/at.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_TTL: Joi.string().required(),
        JWT_REFRESH_TTL: Joi.string().required(),
        DATABASE_URL: Joi.string().uri().required(),
        PORT: Joi.number().default(3000),
      }),
    }),
    AnnouncementsModule, SubjectsModule, AuthModule, UsersModule, PrismaModule, PositionsModule, QuestionsModule, SubscriptionsModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}


