import * as bcrypt from 'bcrypt';
import { main as resetAdminPassword } from './reset-admin-password';
import { PrismaClient } from '@prisma/client';

// We only need to mock bcrypt now, as Prisma is injected.
jest.mock('bcrypt');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('reset-admin-password script', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPrisma: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a manual, lightweight mock for Prisma
    mockPrisma = {
      user: {
        update: jest.fn(),
      },
    };

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should update password and log success if user exists', async () => {
    // Arrange
    const mockHashedPassword = 'hashed_password';
    const mockUpdatedUser = { email: 'admin@example.com' };
    (mockBcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
    mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

    // Act
    await resetAdminPassword(mockPrisma as PrismaClient);

    // Assert
    expect(mockBcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
      data: { password: mockHashedPassword },
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(`Successfully updated password for user: ${mockUpdatedUser.email}`);
  });

  it('should log an error if the user does not exist', async () => {
    // Arrange
    const mockError = new Error('User not found');
    (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    mockPrisma.user.update.mockRejectedValue(mockError);

    // Act
    await resetAdminPassword(mockPrisma as PrismaClient);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating password for admin@example.com:', mockError);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('does not exist in the database'));
  });
});
