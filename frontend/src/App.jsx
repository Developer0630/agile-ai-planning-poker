import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Bot, Users, LogOut, Copy, Check } from 'lucide-react';

import { apiService } from './services/api';
import AuthPage from './components/AuthPage';
import LobbyPage from './components/LobbyPage';
import StorySidebar from './components/StorySidebar';
import PokerTable from './components/PokerTable';
import DiscussionChat from './components/DiscussionChat';

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('agile_poker_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [roomCode, setRoomCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [aiStatus, setAiStatus] = useState({ online: false, mode: 'CHECKING' });

  const [roomState, setRoomState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const stompClientRef = useRef(null);

  // Lịch sử phòng theo từng tài khoản
  const historyKey = authUser ? `agile_poker_rooms_${authUser.username}` : null;
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    if (!historyKey) return setRecentRooms([]);
    const saved = localStorage.getItem(historyKey);
    setRecentRooms(saved ? JSON.parse(saved) : []);
  }, [historyKey]);

  const saveRecentRoom = (code, name) => {
    if (!historyKey) return;
    setRecentRooms((prev) => {
      const filtered = prev.filter((item) => item.code !== code);
      const updated = [{ code, name: name || 'Sprint Planning' }, ...filtered].slice(0, 6);
      localStorage.setItem(historyKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (!historyKey) return;
    localStorage.removeItem(historyKey);
    setRecentRooms([]);
  };

  const displayParticipantName = authUser
    ? `${authUser.fullName} (${
        authUser.role === 'SCRUM_MASTER' ? 'SM' : authUser.role === 'PRODUCT_OWNER' ? 'PO' : 'Dev'
      })`
    : '';

  const handleLogout = () => {
    localStorage.removeItem('agile_poker_user');
    setAuthUser(null);
    setJoined(false);
    setRoomCode('');
    setRoomState(null);
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Kiểm tra trạng thái AI Service khi vào phòng
  useEffect(() => {
    if (!joined || !authUser) return;
    apiService
      .request('/api/rooms/ai-status', authUser.token)
      .then(setAiStatus)
      .catch(() => setAiStatus({ online: false, mode: 'MOCK_FALLBACK' }));
  }, [joined, authUser]);

  // Kết nối WebSocket & tải dữ liệu phòng
  useEffect(() => {
    if (!joined || !roomCode || !authUser) return;

    apiService
      .request(`/api/rooms/${roomCode}`, authUser.token)
      .then((data) => {
        setRoomState(data);
        setMessages(data.messages || []);
        saveRecentRoom(roomCode, data.room?.name);
      })
      .catch((err) => {
        if (err.message === 'UNAUTHORIZED') return handleLogout();
        alert(err.message);
        setJoined(false);
      });

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${authUser.token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/room/${roomCode}/state`, (msg) => {
          const updated = JSON.parse(msg.body);
          setRoomState(updated);
          if (updated.messages) setMessages(updated.messages);
        });

        client.subscribe(`/topic/room/${roomCode}/chat`, (msg) => {
          setMessages((prev) => [...prev, JSON.parse(msg.body)]);
        });

        client.subscribe(`/topic/room/${roomCode}/ai-typing`, (msg) => {
          setAiTyping(JSON.parse(msg.body));
        });
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, [joined, roomCode, authUser]);

  const sendWs = (destination, body = {}) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: `/app/room/${roomCode}/${destination}`,
        body: JSON.stringify(body),
      });
    }
  };

  const handleCreateRoom = async () => {
    try {
      const room = await apiService.request('/api/rooms', authUser.token, {
        method: 'POST',
        body: JSON.stringify({ name: `Sprint - ${authUser.fullName}` }),
      });
      setRoomCode(room.roomCode);
      setJoined(true);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') return handleLogout();
      alert(err.message);
    }
  };

  const handleAddStory = async (storyData) => {
    await apiService.request(`/api/rooms/${roomCode}/stories`, authUser.token, {
      method: 'POST',
      body: JSON.stringify(storyData),
    });
  };

  if (!authUser) {
    return <AuthPage onAuthSuccess={setAuthUser} />;
  }

  if (!joined) {
    return (
      <LobbyPage
        authUser={authUser}
        recentRooms={recentRooms}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={(code) => {
          setRoomCode(code);
          setJoined(true);
        }}
        onClearHistory={handleClearHistory}
        onLogout={handleLogout}
      />
    );
  }

  const room = roomState?.room;
  const stories = roomState?.stories || [];
  const currentStory = roomState?.currentStory;
  const votes = roomState?.votes || [];
  const isRevealed = room?.status === 'REVEALED';

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-indigo-400" />
          <span className="font-bold text-lg">Agile AI Poker</span>

          {/* Badge Mã phòng + Nút Copy nhanh */}
          <button
            onClick={handleCopyRoomCode}
            className="px-2.5 py-1 text-xs font-mono bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-md flex items-center gap-1.5 cursor-pointer transition"
            title="Bấm để sao chép mã phòng"
          >
            <span>Mã: {roomCode}</span>
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Đèn báo trạng thái AI */}
          <span
            className={`px-2.5 py-0.5 text-[11px] rounded-full flex items-center gap-1.5 border ${
              aiStatus.online
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {aiStatus.online ? 'Llama-3 Live' : 'AI Mock Mode'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span><strong>{displayParticipantName}</strong></span>
          </div>
          <button
            onClick={() => setJoined(false)}
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
          >
            Rời phòng
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        <StorySidebar
          roomCode={roomCode}
          stories={stories}
          currentStory={currentStory}
          onSelectStory={(storyId) => {
            setSelectedCard(null);
            sendWs('select-story', { storyId });
          }}
          onAddStory={handleAddStory}
        />

        <PokerTable
          currentStory={currentStory}
          votes={votes}
          isRevealed={isRevealed}
          selectedCard={selectedCard}
          userRole={authUser.role}
          onVote={(pts) => {
            setSelectedCard(pts);
            sendWs('vote', { participantName: displayParticipantName, points: pts });
          }}
          onReveal={() => sendWs('reveal')}
          onFinalize={(finalPoints) => sendWs('finalize', { finalPoints })}
        />

        <DiscussionChat
          messages={messages}
          aiTyping={aiTyping}
          currentUserDisplayName={displayParticipantName}
          disabled={!currentStory}
          onSendMessage={(content, askAi) =>
            sendWs('chat', { senderName: displayParticipantName, content, askAi })
          }
        />
      </div>
    </div>
  );
}