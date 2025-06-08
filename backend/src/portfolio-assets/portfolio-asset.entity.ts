import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Asset } from '../assets/asset.entity';

@Entity()
export class PortfolioAsset {
  @PrimaryColumn()
  portfolioId: number;

  @PrimaryColumn()
  assetId: number;

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
  averageCost: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.portfolioAssets)
  @JoinColumn({ name: 'portfolioId' })
  portfolio: Portfolio;

  @ManyToOne(() => Asset, (asset) => asset.portfolioAssets)
  @JoinColumn({ name: 'assetId' })
  asset: Asset;
} 