import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { PortfolioAssetsModule } from './portfolio-assets/portfolio-assets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { AppDataSource } from './config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async () => (AppDataSource.options),
    }),
    UsersModule,
    AssetsModule,
    PortfoliosModule,
    PortfolioAssetsModule,
    TransactionsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
