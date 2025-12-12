import React, { useState } from 'react';
import { registerUser } from '../services/authService';
import { User, LoadingState } from '../types';

interface RegisterProps {
  onRegisterSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !shopName || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        return;
    }

    setStatus(LoadingState.LOADING);
    setError(null);

    try {
      const user = await registerUser(username, password, shopName, shopDescription);
      setStatus(LoadingState.SUCCESS);
      onRegisterSuccess(user);
    } catch (err: any) {
      setStatus(LoadingState.ERROR);
      setError(err.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Tạo Tài Khoản</h2>
          <p className="text-sm text-slate-500 mt-2">Bắt đầu theo dõi hiệu suất của bạn</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Mẹ và bé shop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Shop Description</label>
            <input
              type="text"
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Đồ dùng cho trẻ sơ sinh, trẻ em dưới 1 tuổi"
            />
          </div>

          <button
            type="submit"
            disabled={status === LoadingState.LOADING}
            className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all mt-2 shadow-md
              ${status === LoadingState.LOADING 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
          >
            {status === LoadingState.LOADING ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <button 
            onClick={onNavigateToLogin}
            className="text-blue-600 font-medium hover:text-blue-700 hover:underline"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};
