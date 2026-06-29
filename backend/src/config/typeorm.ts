import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Profile } from '../profiles/profile.entity';
import { Asset } from '../assets/asset.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { PortfolioAsset } from '../portfolio-assets/portfolio-asset.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Session } from '../auth/session.entity';
import { Subscription } from '../subscriptions/subscription.entity';

const isMigration = process.env.TYPEORM_MIGRATION === 'true';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '12345678',
  database: 'ivrex',
  synchronize: true,
  logging: true,
  entities: [
    User,
    Profile,
    Portfolio,
    Transaction,
    Session,
    Subscription,
    Asset,
    PortfolioAsset,
  ],
  migrations: isMigration ? ['src/migrations/*.ts'] : [],
});

export default dataSource;

// Initialize separately to avoid TypeORM metadata issues
export const AppDataSource = dataSource.initialize()
  .then(() => console.log('Data Source initialized!'))
  .catch((err) => console.error('Error initializing Data Source:', err));

// Export entities and types
export {
  User,
  Profile,
  Portfolio,
  Transaction,
  Session,
  Subscription,
  Asset,
  PortfolioAsset,
};
export type {
  User as UserEntity,
  Profile as ProfileEntity,
  Portfolio as PortfolioEntity,
  Transaction as TransactionEntity,
  Session as SessionEntity,
  Subscription as SubscriptionEntity,
  Asset as AssetEntity,
  PortfolioAsset as PortfolioAssetEntity,
};
export { isMigration };
