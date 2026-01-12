
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

export type RecommendationLevel = 'VERY_BAD' | 'BAD' | 'OK' | 'EFFICIENT' | 'VERY_EFFICIENT';

export interface RecommendationResponse {
  evaluateDate: string;
  evaluateCampaigns: Recommendation[];
}

export interface Recommendation {
  name: string;
  level: RecommendationLevel;
  briefSummary: string;
  recommendedActions: string[];
}

// --- MAPPING TYPES ---

export interface CampaignMappingInfo {
  id: number;
  name: string;
  unmapped: boolean;
}

export interface OrderLinkMappingInfo {
  id: number;
  name: string;
  campaigns: CampaignMappingInfo[];
}

