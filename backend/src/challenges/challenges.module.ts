import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';

import { ChallengesService } from './challenges.service.js';
import { ChallengesController } from './challenges.controller.js';
import { Challenge } from './challenge.entity.js';
import { User } from '../users/user.entity.js';
import { Subscription } from '../subscriptions/subscription.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

// Ensure challenges directory exists
const uploadsDir = './uploads';
const challengesDir = './uploads/challenges';

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir);
}

if (!existsSync(challengesDir)) {
  mkdirSync(challengesDir);
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Challenge, User, Subscription]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/challenges',
      }),
    }),
    NotificationsModule,
  ],
  controllers: [ChallengesController],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {} 