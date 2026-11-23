import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Bot, Send } from 'lucide-react';

export default function DiscussionChat({
  messages,
  aiTyping,
  currentUserDisplayName,
  disabled,
  onSendMessage,
}) {
  const [chatInput, setChatInput] = useState('');
  const [askAi, setAskAi] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput, askAi);
    setChatInput('');
  };

  return (
    <div className="col-span-4 bg-slate-900/60 border-l border-slate-800 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>Thảo luận cùng Llama-3 Engineer</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => {
          const isAi = m.senderType === 'AI';
          const isSystem = m.senderType === 'SYSTEM';
          const isMe = m.senderName === currentUserDisplayName;

          if (isSystem) {
            return (
              <div
                key={idx}
                className="text-center text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 py-1.5 px-3 rounded-lg"
              >
                {m.content}
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-sm ${
                isAi
                  ? 'bg-purple-950/50 border border-purple-500/40 text-slate-100'
                  : isMe
                  ? 'bg-indigo-600/30 border border-indigo-500/30 ml-6'
                  : 'bg-slate-800 border border-slate-700 mr-6'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                {isAi && <Bot className="w-3.5 h-3.5 text-purple-400" />}
                <span className={isAi ? 'text-purple-300' : 'text-slate-300'}>{m.senderName}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
            </div>
          );
        })}

        {aiTyping && (
          <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/30 border border-purple-500/30 px-3 py-2 rounded-xl animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Llama-3 Engineer đang phân tích ngữ cảnh & lập luận...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900 space-y-2">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={askAi}
            onChange={(e) => setAskAi(e.target.checked)}
            className="rounded accent-purple-500"
          />
          <span>
            Yêu cầu <strong>Llama-3 AI</strong> phản hồi tin nhắn này (hoặc gõ <code>@AI</code>)
          </span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tranh luận kỹ thuật với nhóm & AI..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={disabled}
            className="flex-1 px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}