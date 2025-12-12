import React, { useEffect, useState, useMemo } from 'react';
import { fetchDashboardData, fetchRecommendations } from '../services/geminiService';
import { ChartDataPoint, CampaignRawData, LoadingState, User, Recommendation } from '../types';
import { MarketingEfficiencyChart } from './MarketingEfficiencyChart';
import { RecommendationList } from './RecommendationList';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToImport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigateToImport }) => {
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [rawData, setRawData] = useState<CampaignRawData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Helper to get default date range
  const getDefaultDateRange = () => {
    // For demo purposes with the provided mock data (Dec 2025), we set the range to cover that data.
    // In production, this would likely be today's date minus 7 days.
    return {
      start: '2025-12-04',
      end: '2025-12-10'
    };
  };

  // Filters
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(getDefaultDateRange());
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  const fetchData = async () => {
    setStatus(LoadingState.LOADING);
    setError(null);
    try {
      // Ensure we have a valid date range to pass (fallback to default if empty strings)
      const currentStart = dateRange.start || getDefaultDateRange().start;
      const currentEnd = dateRange.end || getDefaultDateRange().end;
      const token = user.token || '';

      // 1. Fetch main dashboard data and Recommendations in parallel
      const [result, recs] = await Promise.all([
        fetchDashboardData(
            currentStart, 
            currentEnd
        ),
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

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []); // Only run on mount, date changes are handled by the user clicking filter or if we added it to dependency

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
    // A. Filter Data by Date
    let filtered = rawData;
    if (dateRange.start) filtered = filtered.filter(d => d.date >= dateRange.start);
    if (dateRange.end) filtered = filtered.filter(d => d.date <= dateRange.end);

    const campaignsInView = new Set<string>();
    const chartData: ChartDataPoint[] = [];

    // B. Pivot per day
    filtered.forEach(day => {
        const point: ChartDataPoint = {
            date: day.date,
            totalOrders: 0,
            totalSpent: 0,
            totalCommission: 0
        };

        day.campaignEfficiencies.forEach(eff => {
            // Apply Campaign Filter if active
            if (selectedCampaign !== 'all' && eff.name !== selectedCampaign) {
                return;
            }

            point.totalOrders += eff.orders;
            point.totalSpent += eff.spent;
            point.totalCommission += eff.commission;

            // Add breakdown keys for stacking
            campaignsInView.add(eff.name);
            point[`spent__${eff.name}`] = eff.spent;
            point[`commission__${eff.name}`] = eff.commission;
        });

        chartData.push(point);
    });

    const result = chartData.sort((a, b) => a.date.localeCompare(b.date));
    const sortedActiveCampaigns = Array.from(campaignsInView).sort();

    return { processedData: result, activeCampaignsInView: sortedActiveCampaigns };
  }, [rawData, dateRange, selectedCampaign]);

  // Calculate Summary KPIs
  const totalOrders = processedData.reduce((acc, curr) => acc + curr.totalOrders, 0);
  const totalCommission = processedData.reduce((acc, curr) => acc + curr.totalCommission, 0);
  const totalSpent = processedData.reduce((acc, curr) => acc + curr.totalSpent, 0);
  const netProfit = totalCommission - totalSpent;

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto md:h-16 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 self-start md:self-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">
                Hiệu Suất Tiếp Thị
                </h1>
                <p className="text-xs text-slate-500">Xin chào, {user.username}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">

            {/* Import Button */}
            <button
                onClick={onNavigateToImport}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import CSV
            </button>
            
            {/* Campaign Filter Dropdown */}
            <select 
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="bg-slate-100 border-none text-sm rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer hover:bg-slate-200 transition-colors max-w-[150px] sm:max-w-[200px]"
            >
                <option value="all">Tất cả Chiến dịch</option>
                {allCampaigns.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            <button 
              onClick={fetchData} 
              disabled={status === LoadingState.LOADING}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 w-full sm:w-auto justify-center
                ${status === LoadingState.LOADING 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
                }`}
            >
              {status === LoadingState.LOADING ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              )}
            </button>
            
            {/* Logout Button */}
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Date Filters Row */}
        <div className="flex items-center justify-end">
            <div className="flex items-center bg-white rounded-lg p-1 text-sm border border-slate-200 shadow-sm">
                <div className="flex items-center px-3 py-1">
                    <span className="text-slate-400 mr-2 text-xs font-medium uppercase">Từ</span>
                    <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-slate-700 p-0 text-sm font-medium cursor-pointer outline-none"
                    />
                </div>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <div className="flex items-center px-3 py-1">
                    <span className="text-slate-400 mr-2 text-xs font-medium uppercase">Đến</span>
                    <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-slate-700 p-0 text-sm font-medium cursor-pointer outline-none"
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
          <div className="h-96 flex flex-col items-center justify-center text-slate-400">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p>Đang xử lý dữ liệu...</p>
          </div>
        )}

        {status === LoadingState.SUCCESS && rawData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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

        {rawData.length > 0 && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-slate-800">{totalOrders.toLocaleString()}</p>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">Orders</span>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Chi Tiêu (Ads)</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(totalSpent)}</p>
                    <span className="text-xs text-slate-400">VND</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Hoa Hồng</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(totalCommission)}</p>
                    <span className="text-xs text-slate-400">VND</span>
                </div>
              </div>

               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lợi Nhuận Ròng (Net)</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(Math.abs(netProfit))}
                    </p>
                    <span className="text-xs text-slate-400">{netProfit >= 0 ? 'Lãi' : 'Lỗ'}</span>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="mt-2">
                <RecommendationList recommendations={recommendations} />
            </div>

            {/* Main Visuals Grid - Only MarketingEfficiencyChart */}
            <div className="grid grid-cols-1 gap-6">
              <MarketingEfficiencyChart 
                  data={processedData} 
                  activeCampaigns={activeCampaignsInView}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};