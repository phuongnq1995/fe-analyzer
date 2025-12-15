import { ApiResponse, CampaignRawData, ApiCampaignEfficiency, Recommendation } from "../types";
import { authenticatedFetch } from "./authService";

const baseUrl = import.meta.env.VITE_API_URL;

export const fetchDashboardData = async (from?: string, to?: string): Promise<ApiResponse> => {
  try {
    const url = new URL(baseUrl+'/stats');
    
    if (from) url.searchParams.append('from', from);
    if (to) url.searchParams.append('to', to);

    const response = await authenticatedFetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
    }

    const rawData: ApiCampaignEfficiency[] = await response.json();

    return { dailyStats : rawData };
  } catch (error: any) {
    console.warn("API request failed:", error);
    
    // Return empty data instead of mock fallback
    return { dailyStats: [] };
  }
};

export const fetchRecommendations = async (): Promise<Recommendation[]> => {
    try {
      const url = new URL(baseUrl+'/recommendation');

      const response = await authenticatedFetch(url.toString(), {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
        console.warn("API request failed for recommendations:", error);
        // Return empty data instead of mock fallback
        return [];
    }
};