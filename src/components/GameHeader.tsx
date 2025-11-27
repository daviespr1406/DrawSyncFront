import { useState, useEffect, useRef } from 'react';
import { Settings, Volume2, VolumeX, Mic, MicOff, LogOut, Palette, MessageSquare, Users, Phone, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { webSocketService } from '../services/WebSocketService';
import { getUser } from '../services/authService';
import { toast } from 'sonner';

interface GameHeaderProps {
  gameCode: string;
  onLeaveGame?: () => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  showPlayers: boolean;
  setShowPlayers: (show: boolean) => void;
}

export function GameHeader({ gameCode, onLeaveGame, showChat, setShowChat, showPlayers, setShowPlayers }: GameHeaderProps) {
  const { isMuted, isMicMuted, isConnected, toggleMute, toggleMic, remoteStream, startCall, leaveCall } = useVoiceChat(gameCode);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const currentUser = getUser();
  const username = currentUser?.username || 'Usuario';
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

  useEffect(() => {
    console.log('Remote stream updated:', remoteStream?.id);
    if (audioRef.current && remoteStream) {
      console.log('Setting audio srcObject');
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play()
        .then(() => console.log('Audio playing successfully'))
        .catch(e => console.error("Error playing audio:", e));
    }
  }, [remoteStream]);

  useEffect(() => {
    let subscription: any;
    webSocketService.connect(() => {
      subscription = webSocketService.subscribe(`/topic/${gameCode}/timer`, (time: number) => {
        setTimeLeft(time);
      });
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [gameCode]);

  const handleJoinCall = () => {
    startCall();
    toast.success('Te has unido al chat de voz');
  };

  const handleLeaveCall = () => {
    leaveCall();
    toast.info('Has salido del chat de voz');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b-2 border-orange-200 px-6 py-3 flex items-center justify-between">
      <audio ref={audioRef} autoPlay muted={isMuted} controls style={{ display: 'none' }} />
      {/* Left side - Logo and game name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
              Drawsync
            </h2>
            <p className="text-xs text-gray-500">Sala: {gameCode}</p>
          </div>
        </div>
      </div>

      {/* Center - Timer */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-orange-100 shadow-sm">
          <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
          <span className={`font-mono font-bold text-xl ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Right side - User and controls */}
      <div className="flex items-center gap-3">
        {/* Join/Leave Call Button */}
        {!isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleJoinCall}
            className="border-orange-200 hover:bg-orange-50 text-orange-600"
          >
            <Phone className="w-4 h-4 mr-2" />
            Unirse a Voz
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveCall}
            className="border-rose-200 hover:bg-rose-50 text-rose-600"
          >
            <Phone className="w-4 h-4 mr-2" />
            Salir de Voz
          </Button>
        )}

        {/* Toggle players list */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowPlayers(!showPlayers)}
          className={`border-orange-200 ${showPlayers ? 'bg-orange-50' : 'hover:bg-orange-50'}`}
        >
          <Users className={`w-5 h-5 ${showPlayers ? 'text-orange-600' : 'text-gray-600'}`} />
        </Button>

        {/* Toggle chat */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowChat(!showChat)}
          className={`border-orange-200 ${showChat ? 'bg-orange-50' : 'hover:bg-orange-50'}`}
        >
          <MessageSquare className={`w-5 h-5 ${showChat ? 'text-orange-600' : 'text-gray-600'}`} />
        </Button>

        {/* Voice Controls - Only visible when connected */}
        {isConnected && (
          <>
            {/* Microphone toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMic}
              className="border-orange-200 hover:bg-orange-50"
            >
              {isMicMuted ? (
                <MicOff className="w-5 h-5 text-gray-600" />
              ) : (
                <Mic className="w-5 h-5 text-orange-600" />
              )}
            </Button>

            {/* Sound toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="border-orange-200 hover:bg-orange-50"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-orange-600" />
              )}
            </Button>
          </>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-orange-50 px-3"
            >
              <Avatar className="w-8 h-8 border-2 border-orange-300">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm text-gray-800">{username}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border-orange-200">
            <DropdownMenuItem className="hover:bg-orange-50 cursor-pointer">
              <Settings className="w-4 h-4 mr-2 text-orange-600" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-orange-50 cursor-pointer"
              onClick={toggleMute}
            >
              {isMuted ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Activar sonido</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Silenciar</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-orange-50 cursor-pointer"
              onClick={toggleMic}
            >
              {isMicMuted ? (
                <>
                  <Mic className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Activar micrófono</span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Silenciar micrófono</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-orange-200" />
            <DropdownMenuItem
              onClick={onLeaveGame}
              className="hover:bg-rose-50 text-rose-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Salir de la partida</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}