import { INestApplication, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma client connected successfully.');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1000') {
        if (this.config.get('NODE_ENV') !== 'production') {
          this.logger.error('🔴 Prisma Error P1000: Authentication failed against database server.');
          this.logger.error('👉 Please check the following:');
          this.logger.error('1. Your DATABASE_URL in the .env file is correct (user, password, host, port, db name).');
          this.logger.error('2. The PostgreSQL database server is running.');
          this.logger.error('3. If your password contains special characters, ensure they are URL-encoded.');
          this.logger.error('4. Run `npm run db:check` to test the connection independently.');
        }
      }
      // Re-throw the error to ensure the application fails to start
      throw error;
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}