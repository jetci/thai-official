import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

// Increase jest timeout for container + migrations
jest.setTimeout(120_000);

describe('DB Safety Constraints (Integration)', () => {
  let container: StartedTestContainer;
  let prisma: PrismaClient;
  let databaseUrl: string;

  beforeAll(async () => {
    // Start PostgreSQL container
    container = await new GenericContainer('postgres:16-alpine')
      .withEnvironment({
        POSTGRES_DB: 'app',
        POSTGRES_USER: 'app',
        POSTGRES_PASSWORD: 'password',
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(5432);

    databaseUrl = `postgresql://app:password@${host}:${port}/app?schema=public`;

    // Apply migrations to the fresh DB
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: { ...process.env },
    });
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });

    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  });

  async function countUniqueIndexLike(table: string, pattern: string): Promise<number> {
    const rows = await prisma.$queryRawUnsafe<Array<{ count: string }>>(`
      SELECT count(*)::int AS count
      FROM pg_class t
      JOIN pg_index i ON i.indrelid = t.oid
      JOIN pg_class ix ON ix.oid = i.indexrelid
      WHERE t.relname = $1
        AND i.indisunique = true
        AND pg_get_indexdef(ix.oid) ILIKE $2;
    `, table, pattern);
    return Number(rows[0]?.count ?? 0);
  }

  test('email unique on LOWER(email): inserting duplicate with different case should fail', async () => {
    const emailUpper = 'TestUser@Example.com';
    const emailLower = 'testuser@example.com';

    await prisma.user.create({
      data: {
        email: emailUpper,
        password: 'x',
      },
    });

    // Expect second insert with different case to fail due to functional unique index
    await expect(
      prisma.user.create({
        data: { email: emailLower, password: 'y' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' }); // Prisma unique constraint violation
  });

  test('email unique on LOWER(email): updating to conflicting email (different case) should fail (23505)', async () => {
    const a = await prisma.user.create({ data: { email: `dup+a@ex.com`, password: 'x' } });
    const b = await prisma.user.create({ data: { email: `dup+b@ex.com`, password: 'x' } });
    // Try to update B email to same as A but upper case mixed
    await expect(
      prisma.user.update({ where: { id: b.id }, data: { email: `DuP+A@Ex.Com` } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  test('subscription one-to-one: second subscription for same user should fail', async () => {
    const u = await prisma.user.create({ data: { email: `sub+${Date.now()}@ex.com`, password: 'x' } });

    await prisma.subscription.create({
      data: {
        userId: u.id,
        plan: 'PREMIUM',
        status: 'ACTIVE',
        startDate: new Date(),
      },
    });

    await expect(
      prisma.subscription.create({
        data: {
          userId: u.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          startDate: new Date(),
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  test('refresh token jti unique: duplicate jti should fail', async () => {
    const u = await prisma.user.create({ data: { email: `rt+${Date.now()}@ex.com`, password: 'x' } });

    await prisma.refreshToken.create({
      data: {
        userId: u.id,
        jti: 'duplicate-jti',
        tokenHash: 'hash-1',
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });

    await expect(
      prisma.refreshToken.create({
        data: {
          userId: u.id,
          jti: 'duplicate-jti',
          tokenHash: 'hash-2',
          expiresAt: new Date(Date.now() + 3600_000),
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  test('ON DELETE CASCADE: deleting user should remove its refresh tokens', async () => {
    const u = await prisma.user.create({ data: { email: `cas+${Date.now()}@ex.com`, password: 'x' } });
    await prisma.refreshToken.createMany({
      data: [
        { userId: u.id, jti: `jti-${Date.now()}-1`, tokenHash: 'h1', expiresAt: new Date(Date.now() + 1000_000) },
        { userId: u.id, jti: `jti-${Date.now()}-2`, tokenHash: 'h2', expiresAt: new Date(Date.now() + 1000_000) },
      ],
    });
    const before = await prisma.refreshToken.count({ where: { userId: u.id } });
    expect(before).toBe(2);
    await prisma.user.delete({ where: { id: u.id } });
    const after = await prisma.refreshToken.count({ where: { userId: u.id } });
    expect(after).toBe(0);
  });

  test('No duplicate unique indexes for Subscription.userId and RefreshToken.jti', async () => {
    const subIdxCount = await countUniqueIndexLike('Subscription', '%("userId")%');
    expect(subIdxCount).toBe(1);
    const rtIdxCount = await countUniqueIndexLike('RefreshToken', '%("jti")%');
    expect(rtIdxCount).toBe(1);
  });
});
