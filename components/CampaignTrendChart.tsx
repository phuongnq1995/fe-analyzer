
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ChartDataPoint } from '../types';

interface CampaignTrendChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    const spent = data.totalSpent;
    const commission = data.totalCommission;
    const profit = commission - spent;
    const roas = spent > 0 ? commission / spent : 0;

    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 text-xs min-w-[200px] z-50">
        <p className="font-bold text-slate-800 text-sm mb-2 pb-1 border-b border-slate-100">
          {new Date(data.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              Chi tiêu:
            </span>
            <span className="font-bold text-slate-700">
              {new Intl.NumberFormat('vi-VN').format(spent)} đ
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Hoa hồng:
            </span>
            <span className="font-bold text-slate-700">
              {new Intl.NumberFormat('vi-VN').format(commission)} đ
            </span>
          </div>
          <div className="pt-2 mt-1 border-t border-slate-50">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Lợi nhuận:</span>
              <span className={`font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {profit >= 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(profit)} đ
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-slate-400 font-medium">ROAS:</span>
              <span className="font-bold text-blue-600">{roas.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CampaignTrendChart: React.FC<CampaignTrendChartProps> = ({ data }) => {
  const formatXAxis = (val: string) => {
    const date = new Date(val);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Xu hướng Chi tiêu & Thu nhập
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Biểu đồ diện tích so sánh biến động chi phí quảng cáo và hoa hồng thực nhận hàng ngày.
        </p>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis} 
              stroke="#94a3b8" 
              fontSize={11} 
              minTickGap={30}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs font-medium text-slate-600">{value === 'totalSpent' ? 'Chi tiêu' : 'Hoa hồng'}</span>}
            />
            <Area
              type="monotone"
              dataKey="totalSpent"
              stroke="#f43f5e"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSpent)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="totalCommission"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCommission)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Vùng chồng lấp</span>
          <span className="text-xs text-slate-600 mt-0.5">Thể hiện mối tương quan trực tiếp giữa tiền chi và tiền thu.</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-100"></div>
            <span className="text-[11px] font-bold text-slate-600">Lãi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-rose-500 bg-rose-100"></div>
            <span className="text-[11px] font-bold text-slate-600">Lỗ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
