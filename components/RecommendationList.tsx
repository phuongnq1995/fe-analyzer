
import React, { useState } from 'react';
import { Recommendation, RecommendationLevel } from '../types';

interface RecommendationListProps {
    recommendations: Recommendation[];
    lastUpdated?: string;
}

const LEVEL_CONFIG: Record<RecommendationLevel, { label: string, color: string, bg: string, border: string, icon: React.ReactNode }> = {
    VERY_BAD: { 
        label: 'Rất kém', 
        color: 'text-red-700', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )
    },
    BAD: { 
        label: 'Kém', 
        color: 'text-orange-700', 
        bg: 'bg-orange-50', 
        border: 'border-orange-200',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    OK: { 
        label: 'Ổn định', 
        color: 'text-slate-700', 
        bg: 'bg-slate-100', 
        border: 'border-slate-200',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        )
    },
    EFFICIENT: { 
        label: 'Hiệu quả', 
        color: 'text-emerald-700', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-200',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    VERY_EFFICIENT: { 
        label: 'Rất hiệu quả', 
        color: 'text-purple-700', 
        bg: 'bg-purple-50', 
        border: 'border-purple-200',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    },
};

export const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations, lastUpdated }) => {
    const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

    if (recommendations.length === 0) return null;

    const formattedDate = lastUpdated 
        ? new Date(lastUpdated).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Bảng Đề Xuất Tối Ưu
                </h3>
                
                {formattedDate && (
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        Cập nhật: {formattedDate}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <th className="px-6 py-4">Chiến dịch</th>
                                <th className="px-6 py-4">Đánh giá</th>
                                <th className="px-6 py-4">Tổng quan</th>
                                <th className="px-6 py-4 text-right">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recommendations.map((rec, index) => {
                                const config = LEVEL_CONFIG[rec.level] || LEVEL_CONFIG.OK;
                                return (
                                    <tr 
                                        key={`${rec.name}-${index}`}
                                        onClick={() => setSelectedRec(rec)}
                                        className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                                                {rec.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color} border ${config.border}`}>
                                                {config.icon}
                                                {config.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-md">
                                            <p className="text-xs text-slate-500 line-clamp-1 italic">
                                                {rec.briefSummary}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-5 h-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recommendation Detail Modal */}
            {selectedRec && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRec(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${LEVEL_CONFIG[selectedRec.level].bg} ${LEVEL_CONFIG[selectedRec.level].color}`}>
                                    {LEVEL_CONFIG[selectedRec.level].icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{selectedRec.name}</h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${LEVEL_CONFIG[selectedRec.level].color}`}>
                                        Trạng thái: {LEVEL_CONFIG[selectedRec.level].label}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRec(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Phân tích tổng quan
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 italic">{selectedRec.briefSummary}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Hành động đề xuất
                                </h4>
                                <div className="space-y-3">
                                    {selectedRec.recommendedActions.map((action, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all">
                                            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <span className="text-sm text-slate-700 font-medium leading-tight">{action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <button 
                                onClick={() => setSelectedRec(null)}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                            >
                                Đóng chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
