import { Toaster } from './components/ui/sonner';
import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Dashboard } from './components/Dashboard';
import { GameView } from './components/GameView';

import { logout } from './services/authService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [username, setUsername] = useState('');

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleJoinGame = (code: string) => {
    setGameCode(code);
    setInGame(true);
  };

  const handleLeaveGame = () => {
    setInGame(false);
    setGameCode('');
  };

  const handleLogout = () => {
    logout(); // Clear token from storage
    setIsLoggedIn(false);
    setInGame(false);
    setUsername('');
    setGameCode('');
  };

  if (!isLoggedIn) {
    return (
      <>
        <WelcomeScreen onLogin={handleLogin} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (inGame) {
    return <GameView gameCode={gameCode} username={username} onLeaveGame={handleLeaveGame} />;
  }

  return <Dashboard username={username} onJoinGame={handleJoinGame} onLogout={handleLogout} />;
}

