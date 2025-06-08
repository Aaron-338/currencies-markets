import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PortfolioAsset } from '../portfolio-assets/portfolio-asset.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  symbol: string;

  @Column()
  name: string;

  @Column()
  type: string; // e.g., "Stock", "Crypto", "Commodity"

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  currentPrice: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @OneToMany(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.asset)
  portfolioAssets: PortfolioAsset[];

  @OneToMany(() => Transaction, (transaction) => transaction.asset)
  transactions: Transaction[];
}