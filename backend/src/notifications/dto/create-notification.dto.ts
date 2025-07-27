import { IsString, IsEnum, IsOptional, IsObject, IsNumber } from 'class-validator';
import { NotificationType, NotificationPriority } from '../notification.entity.js';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsNumber()
  userId: number;
} 