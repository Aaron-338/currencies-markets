import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity.js';
import { Profile } from '../profiles/profile.entity.js';
import { Session } from './session.entity.js';
import { UsersService } from '../users/users.service.js';
import { SessionService } from './session.service.js';
import { TokenService } from './token.service.js';
import { BlacklistGuard } from './blacklist.guard.js';
import { MailerModule } from '@nestjs-modules/mailer';

@Global() // Make auth service available globally
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Session]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret', // Use environment variable for secret
      signOptions: { expiresIn: '60m' },
    }),
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    SessionService,
    TokenService,
    JwtStrategy, 
    UsersService,
    // Register the BlacklistGuard as a global guard
    {
      provide: APP_GUARD,
      useClass: BlacklistGuard,
    },
  ],
  exports: [AuthService, SessionService, TokenService],
})
export class AuthModule {}
