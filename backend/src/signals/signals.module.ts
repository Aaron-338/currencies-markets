import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignalsController } from './signals.controller.js';
import { SignalsService } from './signals.service.js';
import { Signal } from './signal.entity.js';
import { User } from '../users/user.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Signal, User]), 
    AuthModule,
    NotificationsModule,
  ],
  controllers: [SignalsController],
  providers: [SignalsService],
})
export class SignalsModule {} 