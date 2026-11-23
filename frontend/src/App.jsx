import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Bot, Users, LogOut } from 'lucide-react';

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

  const [roomState, setRoomState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const stompClientRef = useRef(null);

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

  // Kết nối WebSocket & tải dữ liệu phòng
  useEffect(() => {
    if (!joined || !roomCode || !authUser) return;

    apiService
      .request(`/api/rooms/${roomCode}`, authUser.token)
      .then((data) => {
        setRoomState(data);
        setMessages(data.messages || []);
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
        body: JSON.stringify({ name: `Sprint Planning - ${authUser.fullName}` }),
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

  // Điều hướng màn hình theo trạng thái
  if (!authUser) {
    return <AuthPage onAuthSuccess={setAuthUser} />;
  }

  if (!joined) {
    return (
      <LobbyPage
        authUser={authUser}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={(code) => {
          setRoomCode(code);
          setJoined(true);
        }}
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
          <span className="px-2.5 py-0.5 text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
            Mã phòng: {roomCode}
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