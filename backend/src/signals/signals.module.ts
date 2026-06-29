import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
import { Signal } from './signal.entity';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

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