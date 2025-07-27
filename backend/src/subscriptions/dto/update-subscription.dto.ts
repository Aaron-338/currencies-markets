import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubscriptionStatus } from '../subscription.entity.js';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @IsOptional()
  @IsString()
  receiptImagePath?: string;
} 