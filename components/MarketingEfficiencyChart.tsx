
import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartDataPoint } from '../types';

interface MarketingEfficiencyChartProps {
  data: ChartDataPoint[];
  activeCampaigns: string[];
  onViewDetails: (date: string) => void;
  onlyActive: boolean;
  setOnlyActive: (value: boolean) => void;
}

const SPENT_COLOR = '#ef4444'; // Red 500
const COMMISSION_COLOR = '#10b981'; // Emerald 500

const CustomTooltip = ({ active, payload, label, onViewDetails }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      
      return (
        <div 
            onClick={() => onViewDetails(data.date)}
            className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 text-xs min-w-[320px] z-50 cursor-pointer hover:shadow-2xl transition-all group"
        >
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <p className="font-bold text-slate-800 text-sm">
                {new Date(data.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
            <div className="text-blue-600 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded-md group-hover:bg-blue-100 transition-colors">
                <span>Xem chi tiết</span>
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
          </div>
  
          {/* Totals Summary - Net Profit moved to latest column as requested */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2 rounded-lg group-hover:bg-slate-100 transition-colors">
               <div className="text-center">
                  <p className="text-slate-500 mb-0.5 uppercase text-[9px] tracking-wider">Đơn</p>
                  <p className="font-bold text-amber-500 text-sm">{data.totalOrders}</p>
               </div>
               <div className="text-center border-l border-slate-200">
                  <p className="text-slate-500 mb-0.5 uppercase text-[9px] tracking-wider">Chi</p>
                  <p className="font-bold text-red-600 text-[11px]">
                      {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(data.totalSpent)}
                  </p>
               </div>
               <div className="text-center border-l border-slate-200">
                  <p className="text-slate-500 mb-0.5 uppercase text-[9px] tracking-wider">Thu</p>
                  <p className="font-bold text-emerald-600 text-[11px]">
                      {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(data.totalCommission)}
                  </p>
               </div>
               <div className="text-center border-l border-slate-200">
                  <p className="text-slate-500 mb-0.5 uppercase text-[9px] tracking-wider">Lợi nhuận</p>
                  <p className={`font-bold text-[11px] ${data.totalNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(data.totalNetProfit)}
                  </p>
               </div>
          </div>
        </div>
      );
    }
    return null;
  };

export const MarketingEfficiencyChart: React.FC<MarketingEfficiencyChartProps> = ({ 
  data, 
  activeCampaigns,
  onViewDetails,
  onlyActive,
  setOnlyActive
}) => {

  const formatXAxis = (val: string) => {
    const date = new Date(val);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
                Hiệu quả theo Thời gian (Tổng quan)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
                Cột Đỏ (Trái): Tổng Chi tiêu Quảng cáo • Cột Xanh (Phải): Tổng Hoa hồng thu được
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group shadow-sm">
            <input 
              type="checkbox" 
              id="activeFilter" 
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="activeFilter" className="text-sm font-bold text-slate-600 group-hover:text-slate-900 cursor-pointer select-none">
              Chỉ hiện chiến dịch hoạt động
            </label>
          </div>
      </div>

      {/* Responsive Height Container */}
      <div className="h-[300px] sm:h-[400px] lg:h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="#64748b"
              fontSize={11}
              minTickGap={30}
              height={30}
            />
            
            {/* Left Axis: Currency */}
            <YAxis 
              yAxisId="left" 
              stroke="#64748b" 
              fontSize={11}
              tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`}
              label={{ value: 'VND', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }}
              width={50}
            />

            {/* Right Axis: Orders Count */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b" 
              fontSize={11}
              label={{ value: 'Số đơn', angle: 90, position: 'insideRight', offset: 10, fontSize: 10, fill: '#f59e0b' }}
              width={40}
            />

            <Tooltip 
                content={<CustomTooltip onViewDetails={onViewDetails} />} 
                wrapperStyle={{ pointerEvents: 'auto' }}
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              content={() => (
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    <span className="text-slate-600">Tổng Chi tiêu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                    <span className="text-slate-600">Tổng Hoa hồng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-amber-500"></div>
                    <span className="text-slate-600">Đơn hàng</span>
                  </div>
                </div>
              )}
            />

            {/* Aggregated Bar for Total Spent */}
            <Bar 
                yAxisId="left" 
                dataKey="totalSpent" 
                name="Tổng Chi"
                fill={SPENT_COLOR} 
                barSize={20}
                radius={[4, 4, 0, 0]}
                onClick={(data: any) => onViewDetails(data.date)}
                cursor="pointer"
            />

            {/* Aggregated Bar for Total Commission */}
            <Bar 
                yAxisId="left" 
                dataKey="totalCommission" 
                name="Tổng Thu"
                fill={COMMISSION_COLOR} 
                barSize={20}
                radius={[4, 4, 0, 0]}
                onClick={(data: any) => onViewDetails(data.date)}
                cursor="pointer"
            />

            {/* Orders Line (Volume) */}
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="totalOrders" 
              name="totalOrders" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
