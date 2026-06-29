import { IsString, IsOptional } from 'class-validator';
import { SubscriptionStatus } from '../subscription.entity';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentPhoneNumber?: string;
}
