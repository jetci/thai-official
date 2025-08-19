/**
 * Creates a mock instance of the PrismaService for use in NestJS testing modules.
 * This factory provides mock functions for each of the delegates (user, refreshToken, etc.)
 * allowing tests to control their behavior and assert that they were called correctly.
 */
export const createPrismaMock = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  // Mock the transaction functionality to allow transaction-based tests to run.
  // It simply executes the callback with the mock prisma instance.
  $transaction: jest.fn().mockImplementation(async (callback) => callback(createPrismaMock())),
});
