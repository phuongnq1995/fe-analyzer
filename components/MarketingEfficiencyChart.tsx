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
const RED_PALETTE = [
  '#ef4444', // 500
  '#b91c1c', // 700
  '#f87171', // 400
  '#991b1b', // 800
  '#fca5a5', // 300
  '#7f1d1d', // 900
  '#fecaca', // 200
  '#dc2626', // 600
];

// Extended Green Palette
const GREEN_PALETTE = [
  '#10b981', // 500
  '#047857', // 700
  '#34d399', // 400
  '#065f46', // 800
  '#6ee7b7', // 300
  '#064e3b', // 900
  '#a7f3d0', // 200
  '#059669', // 600
];

const getRedShade = (index: number) => RED_PALETTE[index % RED_PALETTE.length];
const getGreenShade = (index: number) => GREEN_PALETTE[index % GREEN_PALETTE.length];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      
      // Filter out the relevant items from payload
      // payload items contain: name, value, color, payload (the full data object), dataKey
      const spentPayload = payload.filter((p: any) => p.dataKey && p.dataKey.toString().startsWith('spent__'));
      const commPayload = payload.filter((p: any) => p.dataKey && p.dataKey.toString().startsWith('commission__'));
  
      // Sort descending by value for better readability
      spentPayload.sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
      commPayload.sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
  
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 text-xs min-w-[320px] z-50">
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
  
          {/* 2-Column Breakdown */}
          <div className="grid grid-cols-2 gap-4">
              
              {/* Left: Spend */}
              <div>
                  <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-red-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      <span className="font-bold text-red-700 uppercase text-[10px]">Chi Tiêu</span>
                  </div>
                  <div className="space-y-1">
                      {spentPayload.map((entry: any) => {
                          const name = entry.name?.toString().replace('spent__', '') || '';
                          return (
                               <div key={entry.name} className="flex justify-between items-center text-slate-600 gap-2">
                                  <span className="truncate flex-1 font-medium" style={{color: entry.color}} title={name}>{name}</span>
                                  <span className="text-slate-800 font-mono text-[10px]">
                                       {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(entry.value as number)}
                                  </span>
                               </div>
                          );
                      })}
                      {spentPayload.length === 0 && <span className="text-slate-400 italic text-[10px]">Không có dữ liệu</span>}
                  </div>
              </div>
  
              {/* Right: Commission */}
              <div>
                   <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-emerald-700 uppercase text-[10px]">Hoa Hồng</span>
                  </div>
                  <div className="space-y-1">
                      {commPayload.map((entry: any) => {
                          const name = entry.name?.toString().replace('commission__', '') || '';
                          return (
                               <div key={entry.name} className="flex justify-between items-center text-slate-600 gap-2">
                                  <span className="truncate flex-1 font-medium" style={{color: entry.color}} title={name}>{name}</span>
                                  <span className="text-slate-800 font-mono text-[10px]">
                                       {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(entry.value as number)}
                                  </span>
                               </div>
                          );
                      })}
                      {commPayload.length === 0 && <span className="text-slate-400 italic text-[10px]">Không có dữ liệu</span>}
                  </div>
              </div>
  
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
                Hiệu quả theo Thời gian (Phân rã Chiến dịch)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
                Cột Đỏ (Trái): Chi tiêu Quảng cáo • Cột Xanh (Phải): Hoa hồng thu được • Màu sắc đậm/nhạt tương ứng với các chiến dịch khác nhau
            </p>
          </div>
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
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
              label={{ value: 'VND', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10 }}
            />

            {/* Right Axis: Orders Count */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b" 
              fontSize={11}
              label={{ value: 'Số đơn', angle: 90, position: 'insideRight', offset: 0, fontSize: 10, fill: '#f59e0b' }}
            />

            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              content={() => (
                <div className="flex justify-center gap-6 pt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    <span className="text-slate-600">Chi tiêu (Ads)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                    <span className="text-slate-600">Hoa hồng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-amber-500"></div>
                    <span className="text-slate-600">Đơn hàng</span>
                  </div>
                </div>
              )}
            />

            {/* Render Stacked Bars for Spend */}
            {activeCampaigns.map((camp, index) => (
                <Bar 
                    key={`spent-${camp}`}
                    yAxisId="left" 
                    dataKey={`spent__${camp}`} 
                    name={`spent__${camp}`}
                    stackId="spent" 
                    fill={getRedShade(index)} 
                    barSize={20}
                />
            ))}

            {/* Render Stacked Bars for Commission */}
            {activeCampaigns.map((camp, index) => (
                <Bar 
                    key={`comm-${camp}`}
                    yAxisId="left" 
                    dataKey={`commission__${camp}`} 
                    name={`commission__${camp}`}
                    stackId="commission" 
                    fill={getGreenShade(index)} 
                    barSize={20}
                />
            ))}

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