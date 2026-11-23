import React, { useState } from 'react';
import { LogOut, History, ArrowRight, Trash2 } from 'lucide-react';

export default function LobbyPage({
  authUser,
  recentRooms,
  onCreateRoom,
  onJoinRoom,
  onClearHistory,
  onLogout,
}) {
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleJoin = () => {
    if (!roomCodeInput.trim()) return alert('Vui lòng nhập mã phòng!');
    onJoinRoom(roomCodeInput.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Thông tin người dùng */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center font-bold text-indigo-300">
              {authUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-sm">{authUser.fullName}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                {authUser.role}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Tạo phòng hoặc nhập mã */}
        <div className="space-y-4">
          <button
            onClick={onCreateRoom}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            + Tạo phòng Planning Poker mới
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase">Hoặc tham gia phòng</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã phòng (6 ký tự)"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl uppercase focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleJoin}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 font-semibold rounded-xl transition cursor-pointer"
            >
              Vào
            </button>
          </div>
        </div>

        {/* Danh sách phòng đã tham gia gần đây */}
        {recentRooms.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Phòng gần đây</span>
              </div>
              <button
                onClick={onClearHistory}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Xóa lịch sử
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {recentRooms.map((r) => (
                <div
                  key={r.code}
                  onClick={() => onJoinRoom(r.code)}
                  className="flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition group"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded">
                      {r.code}
                    </span>
                    <span className="text-xs text-slate-300 ml-2">{r.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}