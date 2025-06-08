import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { PortfolioAsset } from '../portfolio-assets/portfolio-asset.entity'; // Corrected import path
import { Transaction } from '../transactions/transaction.entity'; // Import Transaction

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

  @ManyToOne(() => User, (user) => user.portfolios)
  @JoinColumn({ name: 'userId' }) // This explicitly sets the foreign key column name
  user: User;

  @Column() // This will store the foreign key (userId)
  userId: number;

  @OneToMany(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.portfolio)
  portfolioAssets: PortfolioAsset[];

  @OneToMany(() => Transaction, (transaction) => transaction.portfolio)
  transactions: Transaction[];
} 