
import React, { useState, useRef, useEffect } from 'react';
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
        border: 'border-red-100',
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
        border: 'border-orange-100',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    OK: { 
        label: 'Chấp nhận', 
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
        border: 'border-emerald-100',
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
        border: 'border-purple-100',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    },
};

export const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations, lastUpdated }) => {
    const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        // Use requestAnimationFrame to ensure layout is calculated after paint
        requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                // Use a small buffer (1px) for floating point calculations in high-dpi screens
                setCanScrollLeft(scrollLeft > 1);
                setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
            }
        });
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // ResizeObserver is much more reliable for elements that grow/shrink dynamically
        const resizeObserver = new ResizeObserver(() => {
            checkScroll();
        });

        resizeObserver.observe(container);
        
        // Initial check
        checkScroll();

        // Safety timeout for content that might render with a delay (e.g., animations)
        const timer = setTimeout(checkScroll, 100);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timer);
        };
    }, [recommendations]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320; 
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            // Check scroll again after the smooth animation is mostly done
            setTimeout(checkScroll, 350);
        }
    };

    if (recommendations.length === 0) return null;

    const formattedDate = lastUpdated 
        ? new Date(lastUpdated).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Đề Xuất Tối Ưu
                </h3>
                
                {formattedDate && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-tight">
                            Dữ liệu mới nhất: {formattedDate}
                        </span>
                    </div>
                )}
            </div>

            <div className="relative group">
                {/* Navigation Buttons */}
                {canScrollLeft && (
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-purple-600 hover:scale-110 transition-all duration-200"
                        aria-label="Scroll Left"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {canScrollRight && (
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-purple-600 hover:scale-110 transition-all duration-200"
                        aria-label="Scroll Right"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                <div 
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x items-stretch"
                >
                    {recommendations.map((rec, index) => {
                        const config = LEVEL_CONFIG[rec.level] || LEVEL_CONFIG.OK;
                        return (
                            <div 
                                key={`${rec.name}-${index}`}
                                onClick={() => setSelectedRec(rec)}
                                className={`flex-shrink-0 w-[300px] snap-start bg-white p-5 rounded-2xl shadow-sm border ${config.border} flex flex-col hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 relative overflow-hidden group/card min-h-[160px]`}
                            >
                                <div className={`absolute top-0 right-0 p-1.5 ${config.bg} rounded-bl-xl border-b border-l ${config.border}`}>
                                    {config.icon}
                                </div>

                                <div className="mb-4">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color} border ${config.border} mb-3`}>
                                        {config.label}
                                    </div>
                                    <h4 className="font-bold text-slate-800 line-clamp-2 group-hover/card:text-purple-600 transition-colors" title={rec.name}>
                                        {rec.name}
                                    </h4>
                                </div>
                                
                                <p className="text-xs text-slate-500 leading-relaxed italic flex-1 mb-4">
                                    {rec.briefSummary}
                                </p>

                                <div className="mt-auto flex items-center text-[10px] font-bold text-purple-600 opacity-0 group-hover/card:opacity-100 transition-all transform translate-x-2 group-hover/card:translate-x-0">
                                    <span>Xem chi tiết</span>
                                    <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Scroll Indication Shadow */}
                {canScrollRight && (
                    <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-slate-50/80 to-transparent pointer-events-none rounded-r-2xl"></div>
                )}
                {canScrollLeft && (
                    <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-slate-50/80 to-transparent pointer-events-none rounded-l-2xl"></div>
                )}
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
                                        Đánh giá: {LEVEL_CONFIG[selectedRec.level].label}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRec(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Tổng quan
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-sm">{selectedRec.briefSummary}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Hành động đề xuất
                                </h4>
                                <div className="space-y-2">
                                    {selectedRec.recommendedActions.map((action, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all">
                                            <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <span className="text-sm text-slate-700 font-medium">{action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <button 
                                onClick={() => setSelectedRec(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
