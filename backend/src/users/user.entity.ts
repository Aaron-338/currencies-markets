import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity.js';
import { Transaction } from '../transactions/transaction.entity.js';
import { Subscription } from '../subscriptions/subscription.entity.js';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  verificationResponsibilities: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne('Profile', 'user', {
    cascade: true,
    eager: true,
  })
  profile: any;

  @OneToMany('Portfolio', (portfolio: Portfolio) => portfolio.user)
  portfolios: Portfolio[];

  @OneToMany('Transaction', (transaction: Transaction) => transaction.user)
  transactions: Transaction[];
  
  @OneToMany(() => Subscription, (subscription: Subscription) => subscription.user)
  subscriptions: Subscription[];

  @OneToMany('Session', (session: any) => session.user)
  sessions: any[];
}
