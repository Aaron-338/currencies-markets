// src/subscriptions/dto/create-subscription.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SubscriptionType } from '../subscription.entity';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsNotEmpty()
  @IsString()
  paymentPhoneNumber: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
