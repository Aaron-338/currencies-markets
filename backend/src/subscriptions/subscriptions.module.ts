import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service.js';
import { SubscriptionsController } from './subscriptions.controller.js';
import { Subscription } from './subscription.entity.js';
import { User } from '../users/user.entity.js';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { NotificationsModule } from '../notifications/notifications.module.js';

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
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/receipts',
      }),
    }),
    NotificationsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {} 