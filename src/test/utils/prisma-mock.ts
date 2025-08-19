export const createPrismaMock = () => ({
  position: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Add other delegates as needed by other tests
});
