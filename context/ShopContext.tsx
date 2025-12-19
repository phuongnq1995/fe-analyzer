
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ShopSettings } from '../types';
import { getSettings as fetchSettingsApi } from '../services/settingsService';

interface ShopContextType {
  shopSettings: ShopSettings | null;
  setShopSettings: React.Dispatch<React.SetStateAction<ShopSettings | null>>;
  refreshShopSettings: () => Promise<void>;
  isLoadingSettings: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  const refreshShopSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const settings = await fetchSettingsApi();
      setShopSettings(settings);
    } catch (error) {
      console.error("Failed to refresh shop settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  return (
    <ShopContext.Provider value={{ shopSettings, setShopSettings, refreshShopSettings, isLoadingSettings }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
