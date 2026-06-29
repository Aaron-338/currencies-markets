import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { PortfolioAssetsModule } from './portfolio-assets/portfolio-assets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module'; 
import { SignalsModule } from './signals/signals.module';
import { AuthModule } from './auth/auth.module';
import AppDataSource from './config/typeorm';

import { User } from './users/user.entity';
import { Profile } from './profiles/profile.entity';
import { Portfolio } from './portfolios/portfolio.entity';
import { PortfolioAsset } from './portfolio-assets/portfolio-asset.entity';
import { Transaction } from './transactions/transaction.entity';
import { Asset } from './assets/asset.entity';
import { Session } from './auth/session.entity';
import { Subscription } from './subscriptions/subscription.entity';
import { Notification } from './notifications/notification.entity';
import { Signal } from './signals/signal.entity';


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
      useFactory: async () => ({
        ...AppDataSource.options,
        entities: [
          User,
          Profile,
          Portfolio,
          PortfolioAsset,
          Transaction,
          Asset,
          Session,
          Subscription,
          Notification,
          Signal,
        ],
      }),
    }),
    UsersModule,
    AssetsModule,
    PortfoliosModule,
    PortfolioAssetsModule,
    TransactionsModule,
    AuthModule,
    SubscriptionsModule,
    NotificationsModule,
    SignalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}