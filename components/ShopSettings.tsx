
import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';
import { ShopSettings as IShopSettings, LoadingState } from '../types';
import { useShop } from '../context/ShopContext';

interface ShopSettingsProps {
  onBack: () => void;
}

export const ShopSettings: React.FC<ShopSettingsProps> = ({ onBack }) => {
  const { setShopSettings } = useShop();
  const [settings, setSettings] = useState<IShopSettings>({ 
    marketingFee: 0, 
    salesTax: 0,
    name: '',
    description: ''
  });
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [saveStatus, setSaveStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setStatus(LoadingState.LOADING);
      try {
        const data = await getSettings();
        // Convert decimals (0.1) to percentages (10) for UI display
        setSettings({
          ...data,
          marketingFee: data.marketingFee * 100,
          salesTax: data.salesTax * 100
        });
        setStatus(LoadingState.SUCCESS);
      } catch (err: any) {
        setError(err.message || "Không thể tải cài đặt cửa hàng");
        setStatus(LoadingState.ERROR);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(LoadingState.LOADING);
    setError(null);
    try {
      // Convert percentages (10) back to decimals (0.1) before calling update API
      const settingsToUpdate = {
        ...settings,
        marketingFee: settings.marketingFee / 100,
        salesTax: settings.salesTax / 100
      };

      const updated = await updateSettings(settingsToUpdate);
      
      // Update local state with converted values to keep UI consistent
      setSettings({
        ...updated,
        marketingFee: updated.marketingFee * 100,
        salesTax: updated.salesTax * 100
      });

      // Update global context with raw API response (decimals)
      setShopSettings(updated); 
      
      setSaveStatus(LoadingState.SUCCESS);
      setTimeout(() => setSaveStatus(LoadingState.IDLE), 3000);
    } catch (err: any) {
      setError(err.message || "Không thể lưu cài đặt cửa hàng");
      setSaveStatus(LoadingState.ERROR);
    }
  };

  if (status === LoadingState.LOADING) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-slate-800">Cấu hình cửa hàng</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Thông tin & Tài chính</h2>
            <p className="text-sm text-slate-500 mt-1">Điều chỉnh thông tin hiển thị và các thông số tính toán lợi nhuận.</p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-8">
            {/* Shop Information Section */}
            <div className="space-y-6">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Thông tin cơ bản</h3>
               
               <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên cửa hàng</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all group-hover:border-slate-300"
                  placeholder="Ví dụ: My Affiliate Shop"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả cửa hàng</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all group-hover:border-slate-300 min-h-[100px]"
                  placeholder="Nhập mô tả ngắn gọn về cửa hàng của bạn..."
                />
              </div>
            </div>

            {/* Financial Parameters Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Tham số tài chính</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phí Marketing (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={settings.marketingFee}
                      onChange={(e) => setSettings({ ...settings, marketingFee: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all group-hover:border-slate-300"
                      placeholder="5.0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Thuế bán hàng (VAT %)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={settings.salesTax}
                      onChange={(e) => setSettings({ ...settings, salesTax: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all group-hover:border-slate-300"
                      placeholder="8.0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400">Các phí và thuế này sẽ được tự động áp dụng khi tính toán lợi nhuận ròng trên Dashboard.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {saveStatus === LoadingState.SUCCESS && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cập nhật cài đặt thành công!
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={saveStatus === LoadingState.LOADING}
                className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition-all
                  ${saveStatus === LoadingState.LOADING 
                    ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'}`}
              >
                {saveStatus === LoadingState.LOADING ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang lưu...
                  </div>
                ) : 'Lưu cài đặt'}
              </button>
              
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
