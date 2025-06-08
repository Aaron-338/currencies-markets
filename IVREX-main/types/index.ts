export interface User {
  id: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string; // ISO 8601 string from backend Date
  updatedAt: string; // ISO 8601 string from backend Date
}

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: string;
  currentPrice: number | null;
  lastUpdated: string; // ISO 8601 string from backend Date
}

export interface Portfolio {
  id: number;
  name: string;
  createdAt: string; // ISO 8601 string from backend Date
  updatedAt: string; // ISO 8601 string from backend Date
  userId: number;
  // Relationships (optional for basic fetching, but good for type safety)
  user?: User;
  portfolioAssets?: PortfolioAsset[];
}

export interface PortfolioAsset {
  portfolioId: number;
  assetId: number;
  quantity: number;
  averageCost: number;
  lastUpdated: string; // ISO 8601 string from backend Date
  // Relationships (optional for basic fetching)
  portfolio?: Portfolio;
  asset?: Asset;
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface Transaction {
  id: number;
  type: TransactionType;
  quantity: number;
  price: number;
  transactionDate: string; // ISO 8601 string from backend Date
  userId: number;
  assetId: number;
  portfolioId: number | null;
  // Relationships (optional for basic fetching)
  user?: User;
  asset?: Asset;
  portfolio?: Portfolio;
} 