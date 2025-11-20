import { useState, useRef, useEffect } from 'react';
import { DrawingCanvas } from './DrawingCanvas';
import { GameToolbar } from './GameToolbar';
import { GameChat } from './GameChat';
import { GameHeader } from './GameHeader';
import { PlayersList } from './PlayersList';
import { Timer } from './Timer';
import { webSocketService } from '../services/WebSocketService';
import { GameLobby } from './GameLobby';
import { GameEndScreen } from './GameEndScreen';

interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
  isDrawing: boolean;
}

const mockPlayers: Player[] = [
  {
    id: '1',
    username: 'TúMismo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Usuario',
    score: 250,
    isDrawing: true,
  },
  {
    id: '2',
    username: 'ArtistaPro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtistaPro',
    score: 180,
    isDrawing: false,
  },
  {
    id: '3',
    username: 'DibujoMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DibujoMaster',
    score: 150,
    isDrawing: false,
  },
  {
    id: '4',
    username: 'ColorKing',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ColorKing',
    score: 120,
    isDrawing: false,
  },
];

interface GameViewProps {
  gameCode: string;
  username: string;
  onLeaveGame?: () => void;
}

export function GameView({ gameCode, username, onLeaveGame }: GameViewProps) {
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState<'pen' | 'marker' | 'highlighter' | 'pencil'>('pen');
  const [tool, setTool] = useState<'draw' | 'erase'>('draw');
  const [timeLeft, setTimeLeft] = useState(60);
  const [word, setWord] = useState('GUITARRA');
  const [isDrawer, setIsDrawer] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showPlayers, setShowPlayers] = useState(true);
  const [gameStatus, setGameStatus] = useState<'LOBBY' | 'PLAYING' | 'FINISHED'>('LOBBY');
  const [players, setPlayers] = useState<string[]>([]);
  const [isCreator, setIsCreator] = useState(false);

  // Fetch game state
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/games/${gameCode}`);
        if (response.ok) {
          const game = await response.json();
          setGameStatus(game.status);
          setPlayers(game.players || []);
          setIsCreator(game.players && game.players[0] === username);
        }
      } catch (error) {
        console.error('Error fetching game state:', error);
      }
    };

    fetchGameState();
    // Poll for game state updates every 2 seconds
    const interval = setInterval(fetchGameState, 2000);

    return () => clearInterval(interval);
  }, [gameCode, username]);

  // Subscribe to timer updates (WebSocketService handles connection)
  useEffect(() => {
    const subscription = webSocketService.subscribe(`/topic/${gameCode}/timer`, (time: number) => {
      setTimeLeft(time);
      if (time === 0) {
        console.log('Game finished!');
        setGameStatus('FINISHED');
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [gameCode]);

  const handleStartGame = async () => {
    try {
      await fetch(`http://localhost:8080/api/games/${gameCode}/start`, {
        method: 'POST',
      });
      setGameStatus('PLAYING');
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  // Show lobby if game is in LOBBY status
  if (gameStatus === 'LOBBY') {
    return (
      <GameLobby
        gameCode={gameCode}
        players={players}
        isCreator={isCreator}
        onStartGame={handleStartGame}
      />
    );
  }

  // Show end screen if game is FINISHED
  if (gameStatus === 'FINISHED') {
    return (
      <GameEndScreen
        gameCode={gameCode}
        onNewGame={() => {
          if (onLeaveGame) {
            onLeaveGame();
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col relative">
      {/* Header */}
      <GameHeader
        gameCode={gameCode}
        onLeaveGame={onLeaveGame}
        showChat={showChat}
        setShowChat={setShowChat}
        showPlayers={showPlayers}
        setShowPlayers={setShowPlayers}
      />

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Players list - Left side */}
        {showPlayers && <PlayersList players={mockPlayers} />}

        {/* Main game area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Timer and word */}
          <div className="flex items-center justify-center gap-8">
            {/* Timer is now in GameHeader or we can keep it here if synced via GameHeader logic, but plan said GameHeader. 
                Actually, let's keep Timer component here but controlled by GameView state which could be updated via WS.
                Wait, the plan said "Update GameHeader (Timer)". Let's move Timer to GameHeader or pass timeLeft to GameHeader?
                The current UI has Timer separate. Let's stick to current UI structure but update Timer component to listen to WS?
                Or better: GameView listens to Timer WS and updates state.
            */}
            <Timer timeLeft={timeLeft} />

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-orange-200 shadow-lg">
              {isDrawer ? (
                <div>
                  <p className="text-sm text-gray-600 text-center mb-1">Dibuja esta palabra:</p>
                  <p className="text-3xl tracking-wider text-center bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                    {word}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 text-center mb-1">Adivina la palabra:</p>
                  <p className="text-3xl tracking-[1em] text-center text-orange-400">
                    {'_ '.repeat(word.length)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Canvas area */}
          <div className="flex-1 relative min-h-0">
            <DrawingCanvas
              gameCode={gameCode}
              color={color}
              brushSize={brushSize}
              brushType={brushType}
              tool={tool}
            />
          </div>
        </div>

        {/* Chat - Bottom right corner (will be positioned absolutely) */}
        {showChat && (
          <div className="hidden lg:block w-80">
            <div className="h-full">
              <GameChat gameCode={gameCode} username={username} />
            </div>
          </div>
        )}
      </div>

      {/* Floating draggable toolbar - Outside canvas */}
      <GameToolbar
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushType={brushType}
        setBrushType={setBrushType}
        tool={tool}
        setTool={setTool}
      />

      {/* Mobile chat - Bottom left */}
      {showChat && (
        <div className="lg:hidden fixed bottom-4 left-4 w-80 max-w-[calc(100vw-2rem)] z-40">
          <GameChat gameCode={gameCode} username={username} />
        </div>
      )}
    </div>
  );
}