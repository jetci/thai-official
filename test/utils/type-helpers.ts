import { Prisma, User } from '@prisma/client';

/**
 * Defines the shape of a user object for testing purposes, based on the actual Prisma model.
 * Using `satisfies` with this type ensures our mock users are always in sync with the schema.
 */
export type UserShape = Pick<
  User,
  'id' | 'email' | 'password' | 'role' | 'createdAt' | 'updatedAt'
>;

/**
 * Defines the shape for creating a refresh token, used for mocking creation payloads.
 */
export type RefreshTokenCreate = Prisma.RefreshTokenUncheckedCreateInput;
