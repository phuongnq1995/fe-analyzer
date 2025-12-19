
export interface ChartDataPoint {
  date: string;
  totalOrders: number;
  totalSpent: number;
  totalCommission: number;
  totalNetProfit: number;
  [key: string]: any; // For dynamic keys like 'spent__CampaignName'
}

// New Interface matching the provided JSON
export interface CampaignRawData {
  date: string;
  name: string;
  clicks: number;
  orders: number;
  spent: number;
  commission: number;
  netProfit: number;
  cpc: number;
  conversionRate: number;
  revenue: number;
  roas: number;
}

export interface ApiCampaignEfficiency {
  "date": string;
  "campaignEfficiencies": CampaignRawData[]
}

export interface ApiResponse {
  dailyStats: ApiCampaignEfficiency[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// --- AUTHENTICATION TYPES ---

export interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
}

export interface ShopSettings {
  marketingFee: number;
  salesTax: number;
  name: string;
  description: string;
}

export interface ShopInfo {
  name: string;
  description: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// --- RECOMMENDATION TYPES ---

export type RecommendationAction = 'Increase' | 'Keep' | 'Decrease' | 'Stop';

export interface Recommendation {
  campaignName: string;
  efficiencyLevel: 1 | 2 | 3 | 4 | 5;
  action: RecommendationAction;
  advise: string;
}
