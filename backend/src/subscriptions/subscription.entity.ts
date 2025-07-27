import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAYMENT_FAILED = 'payment_failed',
}

export enum SubscriptionType {
  TRADING_SIGNALS = 'trading_signals',
  COPY_TRADING = 'copy_trading',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  PERSONAL_COACHING = 'personal_coaching',
  IVREX_PRO = 'ivrex_pro',
  SHARES_CHALLENGE = 'shares_challenge',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User', 'subscriptions')
  user: any;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
  })
  type: SubscriptionType;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentPhoneNumber: string;

  @Column({ nullable: true })
  receiptImagePath: string;

  @Column({ nullable: true })
  verificationNotes: string;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 