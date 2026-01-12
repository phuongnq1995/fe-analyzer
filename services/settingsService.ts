
import { ShopSettings } from "../types";
import { authenticatedFetch } from "./authService";

const baseUrl = import.meta.env.VITE_API_URL;
const SETTINGS_API_URL = `${baseUrl}/shop/settings`;

export const getSettings = async (): Promise<ShopSettings> => {
  try {
    const response = await authenticatedFetch(SETTINGS_API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shop settings');
    }

    return await response.json();
  } catch (error) {
    console.warn("Shop Settings API failed, returning mock data.", error);
    // Mock default settings if API is unavailable
    return {
      marketingFee: 1.0,
      salesTax: 10.0,
      name: "Cửa hàng của tôi",
      description: "Mô tả cửa hàng chuyên doanh Affiliate"
    };
  }
};

export const updateSettings = async (settings: ShopSettings): Promise<ShopSettings> => {
  const response = await authenticatedFetch(SETTINGS_API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(settings)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update shop settings');
  }

  return await response.json();
};
