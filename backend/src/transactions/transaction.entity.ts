import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Asset } from '../assets/asset.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate: Date;

  @ManyToOne('User', (user: User) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne('Asset', (asset: Asset) => asset.transactions)
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @Column()
  assetId: number;

  @ManyToOne('Portfolio', (portfolio: Portfolio) => portfolio.transactions, { nullable: true })
  @JoinColumn({ name: 'portfolioId' })
  portfolio: Portfolio;

  @Column({ nullable: true })
  portfolioId: number;
} 