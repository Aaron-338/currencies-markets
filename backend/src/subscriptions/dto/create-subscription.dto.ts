import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SubscriptionType } from '../subscription.entity.js';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsNotEmpty()
  @IsString()
  price: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsNotEmpty()
  @IsString()
  paymentPhoneNumber: string;

  @IsOptional()
  @IsString()
  notes?: string;
} 