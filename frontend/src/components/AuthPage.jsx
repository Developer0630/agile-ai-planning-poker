import React, { useState } from 'react';
import { Bot, UserCheck, User, Lock } from 'lucide-react';
import { apiService } from '../services/api';

export default function AuthPage({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData =
        authMode === 'LOGIN'
          ? await apiService.login(username, password)
          : await apiService.register({ username, password, fullName, role });

      localStorage.setItem('agile_poker_user', JSON.stringify(userData));
      onAuthSuccess(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-600 rounded-xl">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Agile AI Planning Poker</h1>
            <p className="text-xs text-slate-400">Hệ thống ước lượng Agile tích hợp Llama-3</p>
          </div>
        </div>

        <div className="grid grid-cols-2 bg-slate-800/80 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode('LOGIN'); setError(''); }}
            className={`py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              authMode === 'LOGIN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('REGISTER'); setError(''); }}
            className={`py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              authMode === 'REGISTER' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'REGISTER' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên hiển thị</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn Hòa"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Vai trò trong Scrum Team</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="DEVELOPER">Developer (Kỹ sư phát triển)</option>
                  <option value="SCRUM_MASTER">Scrum Master (Điều phối phiên)</option>
                  <option value="PRODUCT_OWNER">Product Owner (Quản lý Backlog)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tên đăng nhập (Username)</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Nhập username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Đang xử lý...'
              : authMode === 'LOGIN'
              ? 'Đăng nhập vào hệ thống'
              : 'Tạo tài khoản & Bắt đầu'}
          </button>
        </form>
      </div>
    </div>
  );
}