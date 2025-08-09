import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, Tokens } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPrismaMock } from '../../test/utils/prisma-mock';
import { UserShape } from '../../test/utils/type-helpers';
import { RegisterUserDto } from './dto/register-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwt: JwtService;
  let config: ConfigService;

  beforeEach(async () => {
    const prismaMock = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
    prisma = module.get(PrismaService) as unknown as ReturnType<typeof createPrismaMock>;
    jwt = module.get(JwtService);
    config = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Mock data
  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies UserShape;

  const mockTokens: Tokens = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    jest.spyOn(config, 'get').mockImplementation((key: string) => {
      if (key === 'JWT_ACCESS_TTL') return '15m';
      if (key === 'JWT_REFRESH_TTL') return '7d';
      if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      return null;
    });

    jest.spyOn(jwt, 'signAsync').mockResolvedValue(mockTokens.access_token);
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed-password');
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
  });

  describe('register', () => {
    const registerDto: RegisterUserDto = { email: 'test@example.com', password: 'password123' };

    it('should register a new user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      // Mock the entire token generation and saving process
      const generateAndSaveTokensSpy = jest.spyOn(service as any, 'generateAndSaveTokens').mockResolvedValue(mockTokens);

      const result = await service.register(registerDto, 'user-agent', '127.0.0.1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(generateAndSaveTokensSpy).toHaveBeenCalledWith(mockUser, 'user-agent', '127.0.0.1');
      expect(result).toEqual(mockTokens);
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto, 'user-agent', '127.0.0.1')).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should login a user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      // bcrypt.compare is mocked to return true by default
      const generateAndSaveTokensSpy = jest.spyOn(service as any, 'generateAndSaveTokens').mockResolvedValue(mockTokens);

      const result = await service.login(loginDto, 'user-agent', '127.0.0.1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(generateAndSaveTokensSpy).toHaveBeenCalledWith(mockUser, 'user-agent', '127.0.0.1');
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto, 'user-agent', '127.0.0.1')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login(loginDto, 'user-agent', '127.0.0.1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
