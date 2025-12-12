import React from 'react';
import { Recommendation } from '../types';

interface RecommendationListProps {
    recommendations: Recommendation[];
}

export const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations }) => {
    
    const getActionColor = (action: string) => {
        switch(action) {
            case 'Increase': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Keep': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Decrease': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Stop': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getActionIcon = (action: string) => {
        switch(action) {
            case 'Increase': 
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                );
            case 'Keep': 
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                    </svg>
                );
            case 'Decrease': 
                 return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                );
            case 'Stop': 
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            default: return null;
        }
    };

    if (recommendations.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Đề Xuất Tối Ưu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendations.map((rec, index) => (
                    <div 
                        key={`${rec.campaignName}-${index}`}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-800 truncate pr-2" title={rec.campaignName}>
                                {rec.campaignName}
                            </h4>
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${getActionColor(rec.action)}`}>
                                {getActionIcon(rec.action)}
                                {rec.action}
                            </span>
                        </div>
                        
                        <div className="mb-3 flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Hiệu quả:</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div 
                                        key={level} 
                                        className={`w-2 h-2 rounded-full ${
                                            level <= rec.efficiencyLevel 
                                                ? 'bg-purple-500' 
                                                : 'bg-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed flex-1">
                            {rec.advise}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
