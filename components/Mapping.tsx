
import React, { useState, useEffect, useMemo } from 'react';
import { 
  getUnmappedCampaigns, 
  getOrderLinksWithMappings, 
  mapCampaignToOrderLink, 
  removeCampaignMapping 
} from '../services/mappingService';
import { CampaignMappingInfo, OrderLinkMappingInfo, LoadingState } from '../types';

interface MappingProps {
  onBack: () => void;
}

export const Mapping: React.FC<MappingProps> = ({ onBack }) => {
  const [unmappedCampaigns, setUnmappedCampaigns] = useState<CampaignMappingInfo[]>([]);
  const [orderLinks, setOrderLinks] = useState<OrderLinkMappingInfo[]>([]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [actionStatus, setActionStatus] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drag and Drop state
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const loadData = async () => {
    setStatus(LoadingState.LOADING);
    try {
      const [campaigns, links] = await Promise.all([
        getUnmappedCampaigns(),
        getOrderLinksWithMappings()
      ]);
      setUnmappedCampaigns(campaigns.filter(c => c.unmapped));
      setOrderLinks(links);
      setStatus(LoadingState.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu mapping");
      setStatus(LoadingState.ERROR);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMap = async (campaignId: number, orderLinkId: number) => {
    const actionKey = `map-${campaignId}-${orderLinkId}`;
    setActionStatus(prev => ({ ...prev, [actionKey]: true }));
    try {
      await mapCampaignToOrderLink(campaignId, orderLinkId);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionStatus(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleUnmap = async (campaignId: number) => {
    const actionKey = `unmap-${campaignId}`;
    setActionStatus(prev => ({ ...prev, [actionKey]: true }));
    try {
      await removeCampaignMapping(campaignId);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionStatus(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent, campaignId: number) => {
    e.dataTransfer.setData("campaignId", campaignId.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, linkId: number) => {
    e.preventDefault(); 
    setDragOverId(linkId);
  };

  const onDragLeave = () => {
    setDragOverId(null);
  };

  const onDrop = async (e: React.DragEvent, linkId: number) => {
    e.preventDefault();
    setDragOverId(null);
    const campaignIdStr = e.dataTransfer.getData("campaignId");
    if (campaignIdStr) {
      const campaignId = parseInt(campaignIdStr, 10);
      await handleMap(campaignId, linkId);
    }
  };

  const filteredOrderLinks = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    if (!searchTerm) return orderLinks;
    return orderLinks.filter(link => 
      link.name.toLowerCase().includes(lower) || 
      link.campaigns.some(c => c.name.toLowerCase().includes(lower))
    );
  }, [orderLinks, searchTerm]);

  // Unmapped list is no longer filtered by search term per user request
  const unmappedCount = unmappedCampaigns.length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Mapping
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group/search">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm order link..." 
                  className="pl-9 pr-8 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48 md:w-64 transition-all focus:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
             </div>
             <button 
                onClick={loadData}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                title="Tải lại dữ liệu"
             >
                <svg className={`w-5 h-5 ${status === LoadingState.LOADING ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {status === LoadingState.ERROR && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Unmapped (Always shows all) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Chưa gán
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                {unmappedCount}
              </span>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">
              <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                {unmappedCampaigns.length === 0 && status !== LoadingState.LOADING ? (
                  <div className="p-8 text-center text-slate-300">
                    <p className="text-xs font-medium">Đã hết chiến dịch trống</p>
                  </div>
                ) : (
                  unmappedCampaigns.map(campaign => (
                    <div 
                      key={campaign.id} 
                      draggable 
                      onDragStart={(e) => onDragStart(e, campaign.id)}
                      className="p-3 bg-white hover:bg-emerald-50 transition-colors cursor-grab active:cursor-grabbing flex items-center gap-2 group border-l-2 border-transparent hover:border-emerald-500"
                    >
                      <svg className="w-3 h-3 text-slate-300 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                      <span className="font-medium text-slate-700 text-xs truncate" title={campaign.name}>
                        {campaign.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Links (Filtered by Search) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Danh sách Order Links
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                  {searchTerm ? `${filteredOrderLinks.length} kết quả` : `${orderLinks.length} link`}
                </span>
              </div>
            </div>

            {filteredOrderLinks.length === 0 && status !== LoadingState.LOADING ? (
              <div className="bg-white rounded-xl border border-slate-200 p-20 text-center flex flex-col items-center justify-center">
                 <svg className="w-12 h-12 text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
                 <p className="text-sm font-medium text-slate-400">Không tìm thấy Order Link nào khớp với "{searchTerm}"</p>
                 <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-emerald-600 text-xs font-bold hover:underline"
                 >
                   Xóa bộ lọc tìm kiếm
                 </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredOrderLinks.map(link => (
                  <div 
                    key={link.id} 
                    onDragOver={(e) => onDragOver(e, link.id)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, link.id)}
                    className={`
                      relative bg-white rounded-lg border-2 transition-all duration-150 flex flex-col min-h-[50px]
                      ${dragOverId === link.id 
                        ? 'border-emerald-500 bg-emerald-50 scale-[1.03] shadow-md z-10' 
                        : 'border-slate-100 hover:border-slate-200 shadow-sm'}
                    `}
                  >
                    {/* Item Header */}
                    <div className="px-3 py-1.5 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                      <h3 className="font-bold text-slate-800 text-[11px] truncate max-w-[80%]" title={link.name || `#${link.id}`}>
                        {link.name || `#${link.id}`}
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400">
                        {link.campaigns.length}
                      </span>
                    </div>

                    {/* Mapped Campaigns List */}
                    <div className="p-1.5 space-y-1 overflow-y-auto max-h-[150px] scrollbar-hide">
                      {link.campaigns.length === 0 ? (
                        <div className="flex items-center justify-center py-2 border border-dashed border-slate-100 rounded-md">
                          <p className="text-[8px] text-slate-300 uppercase font-bold tracking-wider">Trống</p>
                        </div>
                      ) : (
                        link.campaigns.map(c => {
                          const matchesSearch = searchTerm && c.name.toLowerCase().includes(searchTerm.toLowerCase());
                          return (
                            <div 
                              key={c.id} 
                              className={`flex items-center justify-between px-2 py-0.5 rounded border transition-all group/item
                                ${matchesSearch ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}
                              `}
                            >
                              <span className={`text-[10px] font-medium truncate mr-1 ${matchesSearch ? 'text-amber-800' : 'text-slate-600'}`} title={c.name}>
                                {c.name}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnmap(c.id);
                                }}
                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100 shrink-0"
                              >
                                {actionStatus[`unmap-${c.id}`] ? (
                                  <div className="w-2.5 h-2.5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
