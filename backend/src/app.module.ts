import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { AssetsModule } from './assets/assets.module.js';
import { PortfoliosModule } from './portfolios/portfolios.module.js';
import { PortfolioAssetsModule } from './portfolio-assets/portfolio-assets.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { SignalsModule } from './signals/signals.module.js';
import { EconomicEventsModule } from './economic-events/economic-events.module.js';
import { ChallengesModule } from './challenges/challenges.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { MarketNewsModule } from './market-news/market-news.module.js';
import AppDataSource from './config/typeorm.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        ignoreTLS: true,
        secure: false,
        auth: {
          user: 'your_mailtrap_username',
          pass: 'your_mailtrap_password',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: process.cwd() + '/src/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => AppDataSource.options,
    }),
    UsersModule,
    AssetsModule,
    PortfoliosModule,
    PortfolioAssetsModule,
    TransactionsModule,
    AuthModule,
    SubscriptionsModule,
    SignalsModule,
    EconomicEventsModule,
    ChallengesModule,
    NotificationsModule,
    MarketNewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
