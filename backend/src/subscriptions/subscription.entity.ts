// src/subscriptions/subscription.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAYMENT_FAILED = 'payment_failed', 
  PENDING = "pending"// add this if used
}

export enum SubscriptionType {
  TRADING_SIGNALS = 'trading_signals',
  COPY_TRADING = 'copy_trading',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  PERSONAL_COACHING = 'personal_coaching',
  IVREX_PRO = 'ivrex_pro',
  SHARES_CHALLENGE = 'shares_challenge',
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serviceName: string;

  @Column({ type: 'enum', enum: SubscriptionType })
  type: SubscriptionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  paymentMethod: string;

  @Column()
  paymentPhoneNumber: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @ManyToOne(() => User, (user) => user.subscriptions, { eager: false })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

