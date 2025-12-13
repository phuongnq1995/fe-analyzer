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
}

// Extended Red Palette for better differentiation
const SPENT_COLOR = '#ef4444'; // Red 500
const COMMISSION_COLOR = '#10b981'; // Emerald 500

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;

      // Group payload by campaign to show Spent and Commission in the same row
      const campaignStats = new Map<string, { spent: number; commission: number; cpc: number; roas: number }>();

      // Iterate over data keys to find campaign specific data (prefixed keys)
      // This allows us to show the breakdown even though the chart bars are now aggregates
      Object.keys(data).forEach((key) => {
          if (key.startsWith('spent__')) {
              const name = key.replace('spent__', '');
             // Fetch all metrics from the raw data object using the naming convention
             campaignStats.set(name, { 
                 spent: data[`spent__${name}`] || 0,
                 commission: data[`commission__${name}`] || 0,
                 cpc: data[`cpc__${name}`] || 0,
                 roas: data[`roas__${name}`] || 0
             });
          }
      });

      // Convert to array and sort by Commission (Revenue) descending
      const sortedCampaigns = Array.from(campaignStats.entries())
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.commission - a.commission);

      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 text-xs min-w-[500px] z-50">
          <p className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-100 pb-2">
              {new Date(data.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
  
          {/* Totals Summary */}
          <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-2 rounded-lg">
               <div className="text-center">
                  <p className="text-slate-500 mb-0.5 uppercase text-[10px] tracking-wider">Đơn hàng</p>
                  <p className="font-bold text-amber-500 text-base">{data.totalOrders}</p>
               </div>
               <div className="text-center border-l border-slate-200">
                  <p className="text-slate-500 mb-0.5 uppercase text-[10px] tracking-wider">Tổng Chi</p>
                  <p className="font-bold text-red-600 text-sm">
                      {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(data.totalSpent)}
                  </p>
               </div>
               <div className="text-center border-l border-slate-200">
                  <p className="text-slate-500 mb-0.5 uppercase text-[10px] tracking-wider">Tổng Thu</p>
                  <p className="font-bold text-emerald-600 text-sm">
                      {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(data.totalCommission)}
                  </p>
               </div>
          </div>
  
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 mb-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
              <div className="col-span-3">Campaign</div>
              <div className="col-span-2 text-right">Chi (Ads)</div>
              <div className="col-span-3 text-right">Thu (HH)</div>
              <div className="col-span-2 text-right">CPC</div>
              <div className="col-span-2 text-right">ROAS</div>
          </div>

          {/* Campaign Rows */}
          <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
              {sortedCampaigns.map((camp) => (
                  <div key={camp.name} className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 hover:bg-slate-50 rounded transition-colors border-b border-slate-50 last:border-0">
                      
                      <div className="col-span-3 font-medium text-slate-700 truncate" title={camp.name}>
                          {camp.name}
                      </div>
                      <div className="col-span-2 text-right text-red-600 font-mono text-[11px]">
                          {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(camp.spent)}
                      </div>
                      <div className="col-span-3 text-right text-emerald-600 font-mono font-bold text-[11px]">
                          {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(camp.commission)}
                      </div>
                      <div className="col-span-2 text-right text-slate-500 font-mono text-[11px]">
                          {new Intl.NumberFormat('vi-VN').format(camp.cpc)}
                      </div>
                      <div className="col-span-2 text-right text-slate-500 font-mono text-[11px]">
                          {camp.roas.toFixed(2)}x
                      </div>
                  </div>
              ))}
              {sortedCampaigns.length === 0 && (
                  <div className="text-center py-2 text-slate-400 italic">Không có dữ liệu chi tiết</div>
              )}
          </div>
        </div>
      );
    }
    return null;
  };

export const MarketingEfficiencyChart: React.FC<MarketingEfficiencyChartProps> = ({ 
  data, 
  activeCampaigns
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

            <Tooltip content={<CustomTooltip />} />
            
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
            />

            {/* Aggregated Bar for Total Commission */}
            <Bar 
                yAxisId="left" 
                dataKey="totalCommission" 
                name="Tổng Thu"
                fill={COMMISSION_COLOR} 
                barSize={20}
                radius={[4, 4, 0, 0]}
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