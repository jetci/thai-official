// src/subscriptions/dto/create-subscription.dto.ts

import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsIn(['monthly', 'yearly', 'lifetime'])
  @IsNotEmpty()
  plan: 'monthly' | 'yearly' | 'lifetime';
}
