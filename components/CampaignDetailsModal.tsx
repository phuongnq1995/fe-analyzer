import React from 'react';
import { CampaignRawData } from '../types';

interface CampaignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  data: CampaignRawData[];
}

export const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ isOpen, onClose, date, data }) => {
  if (!isOpen) return null;

  // Calculate totals for the footer
  const total = data.reduce((acc, curr) => ({
    clicks: acc.clicks + curr.clicks,
    orders: acc.orders + curr.orders,
    spent: acc.spent + curr.spent,
    commission: acc.commission + curr.commission,
    revenue: acc.revenue + (curr.revenue || 0),
  }), { clicks: 0, orders: 0, spent: 0, commission: 0, revenue: 0 });

  const totalRoas = total.spent > 0 ? total.commission / total.spent : 0;
  const totalCR = total.clicks > 0 ? total.orders / total.clicks : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Chi tiết hiệu quả chiến dịch</h2>
            <p className="text-sm text-slate-500 mt-1">
              Ngày: {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-auto flex-1 p-6 bg-slate-50/50">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="sticky left-0 z-20 bg-slate-50 px-4 py-3 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-slate-200">Chiến dịch</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Clicks</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Orders</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">CR</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">CPC</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Chi phí (Ads)</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Hoa hồng</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Doanh thu</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((row, index) => {
                    // Calculate derived metrics if not present or consistent
                    const roas = row.spent > 0 ? row.commission / row.spent : 0;
                    const cr = row.clicks > 0 ? row.orders / row.clicks : 0;
                    
                    return (
                      <tr key={index} className="group hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-4 py-3 font-medium text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-slate-100 transition-colors">
                            {row.name}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                          {row.clicks.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                          {row.orders.toLocaleString()}
                        </td>
                         <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                          {(cr * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                          {new Intl.NumberFormat('vi-VN').format(row.cpc)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-red-600 font-medium">
                          {new Intl.NumberFormat('vi-VN').format(row.spent)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-bold">
                          {new Intl.NumberFormat('vi-VN').format(row.commission)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                          {new Intl.NumberFormat('vi-VN').format(row.revenue || 0)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            roas >= 2 ? 'bg-emerald-100 text-emerald-700' :
                            roas >= 1 ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {roas.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer Row */}
                <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                   <tr>
                    <td className="sticky left-0 z-20 bg-slate-50 px-4 py-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-slate-200">Tổng cộng</td>
                    <td className="px-4 py-3 text-right">{total.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{total.orders.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{(totalCR * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right text-red-700">{new Intl.NumberFormat('vi-VN').format(total.spent)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{new Intl.NumberFormat('vi-VN').format(total.commission)}</td>
                    <td className="px-4 py-3 text-right">{new Intl.NumberFormat('vi-VN').format(total.revenue)}</td>
                    <td className="px-4 py-3 text-right">{totalRoas.toFixed(2)}x</td>
                   </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};