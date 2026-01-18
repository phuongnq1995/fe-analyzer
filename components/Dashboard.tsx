
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { fetchDashboardData, fetchRecommendations } from '../services/geminiService';
import { ChartDataPoint, ApiCampaignEfficiency, LoadingState, User, Recommendation, CampaignRawData } from '../types';
import { MarketingEfficiencyChart } from './MarketingEfficiencyChart';
import { RecommendationList } from './RecommendationList';
import { CampaignDetailsModal } from './CampaignDetailsModal';
import { useShop } from '../context/ShopContext';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToImport: () => void;
  onNavigateToShopSettings: () => void;
  onNavigateToMapping: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigateToImport, onNavigateToShopSettings, onNavigateToMapping }) => {
  const { shopSettings } = useShop();
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [rawData, setRawData] = useState<ApiCampaignEfficiency[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [evaluateDate, setEvaluateDate] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // New State for Active Filter - Default to True
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Modal State
  const [detailDate, setDetailDate] = useState<string | null>(null);

  // Helper to get default date range (10 days)
  const getDefaultDateRange = () => {
    const today = new Date();
    const prevDate = new Date();
    prevDate.setDate(today.getDate() - 9); // Last 10 days

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
      start: formatDate(prevDate),
      end: formatDate(today)
    };
  };

  // Filters
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(getDefaultDateRange());
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [queryType, setQueryType] = useState<'clickTime' | 'orderTime'>('clickTime');

  // Search Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setStatus(LoadingState.LOADING);
    setError(null);
    try {

      const currentStart = dateRange.start || getDefaultDateRange().start;
      const currentEnd = dateRange.end || getDefaultDateRange().end;

      const [result, recsResponse] = await Promise.all([
        fetchDashboardData(currentStart, currentEnd, queryType),
        fetchRecommendations()
      ]);

      setRawData(result.dailyStats);
      setRecommendations(recsResponse.evaluateCampaigns);
      setEvaluateDate(recsResponse.evaluateDate);

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

  const allCampaigns = useMemo(() => {
    const campaigns = new Set<string>();
    rawData.forEach(day => {
        day.campaignEfficiencies.forEach(c => campaigns.add(c.name));
    });
    return Array.from(campaigns).sort();
  }, [rawData]);

  // Autocomplete Logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        // On close, revert to selected value text
        if (selectedCampaign === 'all') {
            setSearchQuery('');
        } else {
            setSearchQuery(selectedCampaign);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCampaign]);

  // Update input text when selection changes externally or initially
  useEffect(() => {
      setSearchQuery(selectedCampaign === 'all' ? '' : selectedCampaign);
  }, [selectedCampaign]);

  const filteredCampaignsOptions = useMemo(() => {
    return allCampaigns.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allCampaigns, searchQuery]);

  const handleSelectCampaign = (val: string) => {
    setSelectedCampaign(val);
    setSearchQuery(val === 'all' ? '' : val);
    setIsDropdownOpen(false);
  };

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

            const isActive = eff.spent > 0 || eff.commission > 0;
            if (showOnlyActive && !isActive) {
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
  }, [rawData, dateRange, selectedCampaign, showOnlyActive]);

  // Data for Modal
  const { detailData, modalType, modalTitle, modalSubtitle } = useMemo(() => {
    if (!detailDate) {
      return { detailData: [], modalType: 'daily_breakdown' as const, modalTitle: '', modalSubtitle: '' };
    }

    // CASE 1: Specific Campaign Selected -> Show History (List of dates)
    if (selectedCampaign !== 'all') {
       let filtered = rawData;
       if (dateRange.start) filtered = filtered.filter(d => d.date >= dateRange.start);
       if (dateRange.end) filtered = filtered.filter(d => d.date <= dateRange.end);
       
       // Sort by date
       filtered = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

       const historyData = filtered.map(day => {
           const camp = day.campaignEfficiencies.find(c => c.name === selectedCampaign);
           if (camp) {
               return { ...camp, date: day.date }; // Ensure date is present from parent day
           }
           // Return zeroed data if missing for that day
           return {
               date: day.date,
               name: selectedCampaign,
               clicks: 0, orders: 0, spent: 0, commission: 0, netProfit: 0,
               cpc: 0, conversionRate: 0, revenue: 0, roas: 0
           } as CampaignRawData;
       });

       return {
         detailData: historyData,
         modalType: 'campaign_history' as const,
         modalTitle: `Lịch sử hiệu quả: ${selectedCampaign}`,
         modalSubtitle: `Giai đoạn: ${new Date(dateRange.start || getDefaultDateRange().start).toLocaleDateString('vi-VN')} - ${new Date(dateRange.end || getDefaultDateRange().end).toLocaleDateString('vi-VN')}`
       };
    }

    // CASE 2: All Campaigns -> Show Breakdown for that specific date (List of campaigns)
    const dayData = rawData.find(d => d.date === detailDate);
    const dailyData = dayData ? dayData.campaignEfficiencies.filter(eff => {
        if (showOnlyActive) return eff.spent > 0 || eff.commission > 0;
        return true;
    }) : [];

    return {
      detailData: dailyData,
      modalType: 'daily_breakdown' as const,
      modalTitle: 'Chi tiết hiệu quả chiến dịch',
      modalSubtitle: `Ngày: ${new Date(detailDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
    };

  }, [detailDate, rawData, showOnlyActive, selectedCampaign, dateRange]);

  // Summary KPIs
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

                <button
                    onClick={onNavigateToMapping}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Mapping
                </button>
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left Group: Type & Campaign Search */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Type Switcher (Segmented Control) */}
                <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-sm whitespace-nowrap">
                    <button
                        onClick={() => setQueryType('clickTime')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                            queryType === 'clickTime' 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Click Time
                    </button>
                    <button
                        onClick={() => setQueryType('orderTime')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                            queryType === 'orderTime' 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Order Time
                    </button>
                </div>

                {/* Campaign Autocomplete Search */}
                <div ref={dropdownRef} className="relative w-full sm:w-72 z-30">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm transition-all truncate placeholder:text-slate-400"
                            placeholder="Tất cả chiến dịch"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                        />
                        {/* Clear Button */}
                        {selectedCampaign !== 'all' && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCampaign('all');
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-slate-500 cursor-pointer"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        )}
                        {/* Chevron Down (Visual Only) */}
                        {selectedCampaign === 'all' && (
                             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-64 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-100 scrollbar-hide">
                            <button
                                onClick={() => handleSelectCampaign('all')}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 ${selectedCampaign === 'all' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'}`}
                            >
                                Tất cả chiến dịch
                            </button>
                            {filteredCampaignsOptions.length > 0 ? (
                                filteredCampaignsOptions.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => handleSelectCampaign(c)}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${selectedCampaign === c ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'}`}
                                    >
                                        <div className="truncate">{c}</div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-4 text-sm text-slate-400 text-center italic">
                                    Không tìm thấy chiến dịch nào
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Group: Date Picker */}
            <div className="flex items-center bg-white rounded-lg p-1 text-sm border border-slate-200 shadow-sm w-full sm:w-auto min-w-[300px]">
                <div className="flex items-center px-3 py-1 flex-1">
                    <span className="text-slate-400 mr-2 text-xs font-medium uppercase whitespace-nowrap">Từ</span>
                    <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-slate-700 p-0 text-sm font-medium cursor-pointer outline-none w-full"
                    />
                </div>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <div className="flex items-center px-3 py-1 flex-1">
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

            <div className="grid grid-cols-1 gap-6 mt-2">
              <MarketingEfficiencyChart 
                  data={processedData} 
                  activeCampaigns={activeCampaignsInView}
                  onViewDetails={(date) => setDetailDate(date)}
                  onlyActive={showOnlyActive}
                  setOnlyActive={setShowOnlyActive}
              />
            </div>
            
            {/* Recommendations Section */}
            <div className="mt-2">
                <RecommendationList recommendations={recommendations} lastUpdated={evaluateDate} />
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
          data={detailData}
          title={modalTitle}
          subtitle={modalSubtitle}
          type={modalType}
        />
      )}
    </div>
  );
};
