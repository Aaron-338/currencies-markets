import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EventImportance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  RELEASED = 'released',
  REVISED = 'revised',
  CANCELLED = 'cancelled'
}

@Entity('economic_events')
@Index(['releaseDate', 'importance'])
@Index(['country'])
@Index(['eventName'])
export class EconomicEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  eventName: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 10 })
  countryCode: string;

  @Column({ type: 'timestamp' })
  releaseDate: Date;

  @Column({ type: 'time', nullable: true })
  releaseTime: string | null;

  @Column({ type: 'enum', enum: EventImportance })
  importance: EventImportance;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.SCHEDULED })
  status: EventStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  unit: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  actual: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  forecast: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  previous: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  externalId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  period: string | null;

  @Column({ type: 'boolean', default: false })
  isRevised: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 