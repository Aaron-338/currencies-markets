import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './subscription.entity';
import { User } from '../users/user.entity';
import { existsSync, mkdirSync } from 'fs';
import { NotificationsModule } from '../notifications/notifications.module';

// Ensure receipts directory exists
const uploadsDir = './uploads';
const receiptsDir = './uploads/receipts';

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir);
}

if (!existsSync(receiptsDir)) {
  mkdirSync(receiptsDir);
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, User]),

    NotificationsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {} 