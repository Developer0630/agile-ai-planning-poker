import React, { useState } from 'react';
import { Bot, Eye, Award, CheckCircle2, Sparkles } from 'lucide-react';

const FIBONACCI = [1, 2, 3, 5, 8, 13, 21];

export default function PokerTable({
  currentStory,
  votes,
  isRevealed,
  selectedCard,
  onVote,
  onReveal,
  onFinalize,
}) {
  const [finalPointInput, setFinalPointInput] = useState(5);

  if (!currentStory) {
    return (
      <div className="col-span-5 flex flex-col items-center justify-center text-slate-500 p-5">
        <Sparkles className="w-10 h-10 mb-2 text-indigo-500/50" />
        <p>Chọn một User Story ở cột bên trái để bắt đầu phiên Planning Poker</p>
      </div>
    );
  }

  return (
    <div className="col-span-5 flex flex-col overflow-y-auto p-5 space-y-5">
      {/* Chi tiết Story */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Đang ước lượng
          </span>
          <span
            className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
              isRevealed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {isRevealed ? 'Đã mở bài' : 'Đang bỏ phiếu kín'}
          </span>
        </div>
        <h2 className="text-lg font-bold mt-1">{currentStory.title}</h2>
        <p className="text-sm text-slate-300 mt-2">{currentStory.description}</p>
        {currentStory.acceptanceCriteria && (
          <div className="mt-3 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line">
            <strong className="text-slate-400 block mb-1">Acceptance Criteria:</strong>
            {currentStory.acceptanceCriteria}
          </div>
        )}
      </div>

      {/* Mặt bàn hiển thị các lá bài */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {votes.map((v, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-20 h-28 rounded-xl flex flex-col items-center justify-center border-2 shadow-lg transition-all ${
                  v.isAi ? 'border-purple-500 bg-purple-950/40' : 'border-indigo-500 bg-slate-800'
                }`}
              >
                {isRevealed ? (
                  <span className="text-2xl font-extrabold text-white">{v.points}</span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400">Đã chọn</span>
                )}
              </div>
              <span className="mt-2 text-xs font-medium flex items-center gap-1 text-slate-300">
                {v.isAi && <Bot className="w-3.5 h-3.5 text-purple-400" />}
                {v.participantName}
              </span>
            </div>
          ))}
          {votes.length === 0 && (
            <p className="text-sm text-slate-500">Chưa có ai chọn bài. Hãy chọn một lá bài bên dưới!</p>
          )}
        </div>

        {!isRevealed ? (
          <button
            onClick={onReveal}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Eye className="w-4 h-4" /> Lật bài (Reveal Cards)
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
            <Award className="w-4 h-4 text-amber-400 ml-2" />
            <span className="text-xs text-slate-300">Chốt điểm:</span>
            <select
              value={finalPointInput}
              onChange={(e) => setFinalPointInput(Number(e.target.value))}
              className="bg-slate-800 text-sm px-2 py-1 rounded-lg border border-slate-700"
            >
              {FIBONACCI.map((n) => (
                <option key={n} value={n}>{n} SP</option>
              ))}
            </select>
            <button
              onClick={() => onFinalize(finalPointInput)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Lưu kết quả
            </button>
          </div>
        )}
      </div>

      {/* Dãy bài Fibonacci */}
      <div>
        <p className="text-xs text-slate-400 mb-2 text-center">Chọn ước lượng Story Point của bạn:</p>
        <div className="flex justify-center gap-2">
          {FIBONACCI.map((pts) => (
            <button
              key={pts}
              onClick={() => onVote(pts)}
              className={`w-12 h-16 rounded-xl font-bold text-lg border transition cursor-pointer ${
                selectedCard === pts
                  ? 'bg-indigo-600 border-indigo-400 text-white -translate-y-2 shadow-lg'
                  : 'bg-slate-900 border-slate-700 hover:border-indigo-500 text-slate-200'
              }`}
            >
              {pts}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}