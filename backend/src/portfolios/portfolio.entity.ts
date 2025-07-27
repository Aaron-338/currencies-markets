import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity.js';
import { PortfolioAsset } from '../portfolio-assets/portfolio-asset.entity.js'; // Corrected import path
import { Transaction } from '../transactions/transaction.entity.js'; // Import Transaction

@Entity()
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne('User', (user: User) => user.portfolios)
  @JoinColumn({ name: 'userId' }) // This explicitly sets the foreign key column name
  user: User;

  @Column() // This will store the foreign key (userId)
  userId: number;

  @OneToMany('PortfolioAsset', (portfolioAsset: PortfolioAsset) => portfolioAsset.portfolio)
  portfolioAssets: PortfolioAsset[];

  @OneToMany('Transaction', (transaction: Transaction) => transaction.portfolio)
  transactions: Transaction[];
}