import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthGuard } from '../src/auth/auth.guard';

describe('QuestionsController (e2e) - MOCKED AUTH', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let subjectId: string;

  const adminUser = {
    id: 'cl-admin-id-123',
    email: 'admin-e2e@test.com',
    role: 'ADMIN',
  };

  const regularUser = {
    id: 'cl-user-id-456',
    email: 'user-e2e@test.com',
    role: 'USER',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          const userRole = req.headers['x-mock-user-role'];
          if (userRole === 'admin') {
            req.user = adminUser;
          } else {
            req.user = regularUser;
          }
          return true; // Always allow access
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Clean and seed the database
    await prisma.choice.deleteMany();
    await prisma.question.deleteMany();
    await prisma.subject.deleteMany();

    const subject = await prisma.subject.create({
      data: {
        name: 'E2E Test Subject',
      },
    });
    subjectId = subject.id;
  });

  afterAll(async () => {
    // Clean up the database after all tests
    await prisma.choice.deleteMany();
    await prisma.question.deleteMany();
    await prisma.subject.deleteMany();
    await app.close();
  });

  describe('[POST /questions]', () => {
    it('should create a question when user is ADMIN', async () => {
      const createQuestionDto = {
        title: 'A new question by admin',
        subjectId: subjectId,
        choices: [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/questions')
        .set('x-mock-user-role', 'admin') // Set header to select the admin mock user
        .send(createQuestionDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createQuestionDto.title);
      expect(response.body.choices).toHaveLength(2);
    });

    it('should return 403 Forbidden when user is not ADMIN', async () => {
      const createQuestionDto = {
        title: 'An unauthorized question',
        subjectId: subjectId,
        choices: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
      };

      await request(app.getHttpServer())
        .post('/questions')
        .set('x-mock-user-role', 'user') // Set header to select the regular mock user
        .send(createQuestionDto)
        .expect(403);
    });
  });
});
