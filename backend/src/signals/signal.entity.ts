import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum SignalType {
  BUY = 'buy',
  SELL = 'sell',
}

export enum SignalStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('signals')
export class Signal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  symbol: string;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  entry_price: number;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  stop_loss: number;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  take_profit: number;

  @Column({
    type: 'enum',
    enum: SignalType,
  })
  type: SignalType;

  @Column({
    type: 'enum',
    enum: SignalStatus,
    default: SignalStatus.ACTIVE,
  })
  status: SignalStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;
} 