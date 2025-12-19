
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { fetchDashboardData, fetchRecommendations } from '../services/geminiService';
import { ChartDataPoint, ApiCampaignEfficiency, LoadingState, User, Recommendation } from '../types';
import { MarketingEfficiencyChart } from './MarketingEfficiencyChart';
import { RecommendationList } from './RecommendationList';
import { CampaignDetailsModal } from './CampaignDetailsModal';
import { useShop } from '../context/ShopContext';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToImport: () => void;
  onNavigateToShopSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigateToImport, onNavigateToShopSettings }) => {
  const { shopSettings } = useShop();
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [rawData, setRawData] = useState<ApiCampaignEfficiency[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent double fetch in React Strict Mode
  const dataFetchedRef = useRef(false);

  // Modal State
  const [detailDate, setDetailDate] = useState<string | null>(null);

  // Helper to get default date range (10 days)
  const getDefaultDateRange = () => {
    const today = new Date();
    const nineDaysAgo = new Date();
    nineDaysAgo.setDate(today.getDate() - 9); // Last 10 days

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
      start: formatDate(nineDaysAgo),
      end: formatDate(today)
    };
  };

  // Filters
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(getDefaultDateRange());
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [queryType, setQueryType] = useState<'clickTime' | 'orderTime'>('clickTime');

  const fetchData = async () => {
    setStatus(LoadingState.LOADING);
    setError(null);
    try {
      // Ensure we have a valid date range to pass
      const currentStart = dateRange.start || getDefaultDateRange().start;
      const currentEnd = dateRange.end || getDefaultDateRange().end;

      // 1. Fetch main dashboard data and Recommendations in parallel
      const [result, recs] = await Promise.all([
        fetchDashboardData(currentStart, currentEnd, queryType),
        fetchRecommendations()
      ]);
      
      setRawData(result.dailyStats);
      setRecommendations(recs);

      setStatus(LoadingState.SUCCESS);
    } catch (e: any) {
      setError(e.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      setStatus(LoadingState.ERROR);
    }
  };

  const isFirstRender = useRef(true);

  // Data Fetch logic on filter/type change
  useEffect(() => {
    // We skip the dataFetchedRef check for subsequent filter updates
    if (isFirstRender.current) {
        isFirstRender.current = false;
        fetchData();
        return;
    }
    fetchData();
  }, [dateRange.start, dateRange.end, queryType]);


  // 1. Extract Unique Campaigns for Filter Dropdown
  const allCampaigns = useMemo(() => {
    const campaigns = new Set<string>();
    rawData.forEach(day => {
        day.campaignEfficiencies.forEach(c => campaigns.add(c.name));
    });
    return Array.from(campaigns).sort();
  }, [rawData]);

  // 2. Filter & Pivot Data for Main Chart
  const { processedData, activeCampaignsInView } = useMemo(() => {
    let filtered = rawData;
    if (dateRange.start) filtered = filtered.filter(d => d.date >= dateRange.start);
    if (dateRange.end) filtered = filtered.filter(d => d.date <= dateRange.end);

    const campaignsInView = new Set<string>();
    const chartData: ChartDataPoint[] = [];

    filtered.forEach(day => {
        const point: ChartDataPoint = {
            date: day.date,
            totalOrders: 0,
            totalSpent: 0,
            totalCommission: 0,
            totalNetProfit: 0
        };

        day.campaignEfficiencies.forEach(eff => {
            if (selectedCampaign !== 'all' && eff.name !== selectedCampaign) {
                return;
            }

            point.totalOrders += eff.orders;
            point.totalSpent += eff.spent;
            point.totalCommission += eff.commission;
            point.totalNetProfit += eff.netProfit;

            campaignsInView.add(eff.name);
            point[`spent__${eff.name}`] = eff.spent;
            point[`commission__${eff.name}`] = eff.commission;
            point[`cpc__${eff.name}`] = eff.cpc;
            point[`conversionRate__${eff.name}`] = eff.conversionRate;
            point[`roas__${eff.name}`] = eff.roas;
            point[`netProfit__${eff.name}`] = eff.netProfit;
        });

        chartData.push(point);
    });

    const result = chartData.sort((a, b) => a.date.localeCompare(b.date));
    const sortedActiveCampaigns = Array.from(campaignsInView).sort();

    return { processedData: result, activeCampaignsInView: sortedActiveCampaigns };
  }, [rawData, dateRange, selectedCampaign]);

  // Data for Modal
  const detailData = useMemo(() => {
      if (!detailDate) return [];
      const dayData = rawData.find(d => d.date === detailDate);
      return dayData ? dayData.campaignEfficiencies : [];
  }, [detailDate, rawData]);

  // Summary KPIs - Using sum of netProfit from API for totalNetProfit
  const totalOrders = processedData.reduce((acc, curr) => acc + curr.totalOrders, 0);
  const totalCommission = processedData.reduce((acc, curr) => acc + curr.totalCommission, 0);
  const totalSpent = processedData.reduce((acc, curr) => acc + curr.totalSpent, 0);
  const netProfitTotal = processedData.reduce((acc, curr) => acc + curr.totalNetProfit, 0);

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 leading-none">
                      {shopSettings?.name || 'Hiệu Suất Tiếp Thị'}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">Xin chào, {user.username}</p>
                </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">

            <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Import Button */}
                <button
                    onClick={onNavigateToImport}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import
                </button>
                
                {/* Campaign Filter Dropdown */}
                <select 
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="bg-slate-100 border-none text-sm rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer hover:bg-slate-200 transition-colors w-full sm:w-auto sm:max-w-[200px]"
                >
                    <option value="all">Tất cả Chiến dịch</option>
                    {allCampaigns.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <button 
                    onClick={onNavigateToShopSettings}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    title="Cài đặt cửa hàng"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                
                <button 
                    onClick={onLogout}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    title="Đăng xuất"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Date Filters & Type Switcher Row */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
            {/* Type Switcher (Segmented Control) */}
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-sm">
                <button
                    onClick={() => setQueryType('clickTime')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        queryType === 'clickTime' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    Thời gian Click
                </button>
                <button
                    onClick={() => setQueryType('orderTime')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        queryType === 'orderTime' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    Thời gian Đặt Hàng
                </button>
            </div>

            <div className="flex items-center bg-white rounded-lg p-1 text-sm border border-slate-200 shadow-sm w-full sm:w-auto">
                <div className="flex items-center px-3 py-1 flex-1 sm:flex-none">
                    <span className="text-slate-400 mr-2 text-xs font-medium uppercase whitespace-nowrap">Từ</span>
                    <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-slate-700 p-0 text-sm font-medium cursor-pointer outline-none w-full"
                    />
                </div>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <div className="flex items-center px-3 py-1 flex-1 sm:flex-none">
                    <span className="text-slate-400 mr-2 text-xs font-medium uppercase whitespace-nowrap">Đến</span>
                    <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-slate-700 p-0 text-sm font-medium cursor-pointer outline-none w-full"
                    />
                </div>
            </div>
        </div>

        {status === LoadingState.ERROR && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {status === LoadingState.LOADING && rawData.length === 0 && (
          <div className="h-80 md:h-96 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm md:text-base">Đang xử lý dữ liệu...</p>
          </div>
        )}

        {rawData.length > 0 && (
          <div className={`transition-all duration-300 ${status === LoadingState.LOADING ? 'opacity-50 blur-[1px]' : ''}`}>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-slate-800">{totalOrders.toLocaleString()}</p>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">Orders</span>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Chi Tiêu (Ads)</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(totalSpent)}</p>
                    <span className="text-xs text-slate-400">VND</span>
                </div>
              </div>

              <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Hoa Hồng</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(totalCommission)}</p>
                    <span className="text-xs text-slate-400">VND</span>
                </div>
              </div>

               <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lợi Nhuận Ròng (Net)</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className={`text-2xl font-bold ${netProfitTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(Math.abs(netProfitTotal))}
                    </p>
                    <span className="text-xs text-slate-400">{netProfitTotal >= 0 ? 'Lãi' : 'Lỗ'}</span>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="mt-2">
                <RecommendationList recommendations={recommendations} />
            </div>

            {/* Main Visuals - Marketing Chart occupies full width */}
            <div className="w-full">
              <MarketingEfficiencyChart 
                  data={processedData} 
                  activeCampaigns={activeCampaignsInView}
                  onViewDetails={(date) => setDetailDate(date)}
              />
            </div>
          </div>
        )}

        {status === LoadingState.SUCCESS && rawData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center px-4">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Chưa có dữ liệu hiển thị</h3>
            <p className="text-slate-500 max-w-sm mt-2 mb-6">
              Không tìm thấy dữ liệu chiến dịch trong khoảng thời gian này. Hãy thử thay đổi bộ lọc hoặc import thêm dữ liệu.
            </p>
            <button
                onClick={onNavigateToImport}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Dữ Liệu Ngay
            </button>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {detailDate && (
        <CampaignDetailsModal 
          isOpen={!!detailDate} 
          onClose={() => setDetailDate(null)} 
          date={detailDate} 
          data={detailData} 
        />
      )}
    </div>
  );
};
