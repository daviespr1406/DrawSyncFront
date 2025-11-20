import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { webSocketService } from '../services/WebSocketService';

interface Message {
  id: string;
  username: string;
  avatar: string;
  message: string;
  isGuess?: boolean;
  isCorrect?: boolean;
  timestamp: string;
}

interface GameChatProps {
  gameCode: string;
  username: string;
}

export function GameChat({ gameCode, username }: GameChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to chat messages (WebSocketService handles connection)
    const subscription = webSocketService.subscribe(`/topic/${gameCode}/chat`, (msg: any) => {
      const newMessage: Message = {
        id: msg.id || Date.now().toString(),
        username: msg.username || 'Unknown',
        avatar: msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username || 'Unknown'}`,
        message: msg.message,
        timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGuess: msg.isGuess || false,
        isCorrect: msg.isCorrect || false,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [gameCode]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      username: username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      message: inputValue,
      isGuess: false,
      isCorrect: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    webSocketService.send(`/app/chat/${gameCode}`, newMessage);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-orange-100 shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-200">
        <h3 className="font-bold text-orange-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Chat del juego
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.isCorrect ? 'bg-green-50 p-2 rounded-lg border border-green-200' : ''}`}
          >
            <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
              <AvatarImage src={msg.avatar} />
              <AvatarFallback>{msg.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-sm text-gray-700 truncate">
                  {msg.username}
                </span>
                <span className="text-[10px] text-gray-400">
                  {msg.timestamp}
                </span>
              </div>
              <p className={`text-sm break-words ${msg.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'
                }`}>
                {msg.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-orange-100">
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="pr-12 border-orange-200 focus:border-orange-400 focus:ring-orange-200 bg-orange-50/30"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
