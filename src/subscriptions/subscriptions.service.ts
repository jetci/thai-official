import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const { userId, plan } = createSubscriptionDto;

    // Prisma's connect-or-create or relation handling implicitly checks user existence.
    // The unique constraint on userId in Subscription model handles existing subscription check.

    // Calculate the end date
    const startDate = new Date();
    let endDate: Date | null = null;
    if (plan === 'monthly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan === 'yearly') {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (plan === 'lifetime') {
      endDate = null; // Lifetime subscription
    }

    // Create the subscription
    try {
      return await this.prisma.subscription.create({
        data: {
          userId: userId,
          plan: plan,
          startDate: startDate,
          endDate: endDate,
          status: 'ACTIVE',
        },
      });
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint violation
        throw new ConflictException(`User with ID ${userId} already has a subscription.`);
      }
      throw error;
    }
  }
}

