
import React, { useState, useRef } from 'react';
import { uploadCsv } from '../services/csvService';
import { LoadingState } from '../types';

interface ImportDataProps {
  onBack: () => void;
}

export const ImportData: React.FC<ImportDataProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
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
              Nhập Dữ Liệu CSV
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImportCard 
            title="Import Quảng Cáo (Ads)" 
            description="Tải lên file báo cáo chi phí và hiệu quả quảng cáo."
            type="ad"
            iconColor="text-red-500"
            iconBg="bg-red-50"
            icon={(
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            )}
          />
          
          <ImportCard 
            title="Import Đơn Hàng (Orders)" 
            description="Tải lên file danh sách đơn hàng và doanh thu."
            type="order"
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50"
            icon={(
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          />
        </div>
      </main>
    </div>
  );
};

interface ImportCardProps {
  title: string;
  description: string;
  type: 'ad' | 'order';
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

const ImportCard: React.FC<ImportCardProps> = ({ title, description, type, icon, iconColor, iconBg }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus(LoadingState.IDLE);
      setMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setStatus(LoadingState.IDLE);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!fromDate || !toDate) {
      setStatus(LoadingState.ERROR);
      setMessage("Vui lòng chọn Từ ngày và Đến ngày.");
      return;
    }

    setStatus(LoadingState.LOADING);
    setMessage(null);

    try {
      await uploadCsv(file, type, fromDate, toDate);
      setStatus(LoadingState.SUCCESS);
      setMessage('Tải lên thành công!');
      setFile(null); // Clear file after success
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setStatus(LoadingState.ERROR);
      setMessage(error.message || 'Đã xảy ra lỗi.');
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Từ ngày</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
              />
           </div>
           <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Đến ngày</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
              />
           </div>
        </div>
      </div>

      <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 p-6 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-100 hover:border-slate-300 relative">
        <input 
          type="file" 
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {file ? (
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-medium text-slate-800 truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <>
             <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-slate-700">Kéo thả file CSV vào đây</p>
            <p className="text-xs text-slate-400 mt-1">hoặc click để chọn file</p>
          </>
        )}
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
          status === LoadingState.SUCCESS 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
           {status === LoadingState.SUCCESS ? (
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
           ) : (
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           )}
           {message}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || status === LoadingState.LOADING}
        className={`mt-4 w-full py-2 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2
          ${!file || status === LoadingState.LOADING
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow'
          }`}
      >
        {status === LoadingState.LOADING ? (
          <>
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             <span>Đang tải lên...</span>
          </>
        ) : 'Tải lên ngay'}
      </button>
    </div>
  );
};
