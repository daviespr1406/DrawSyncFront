import { Toaster } from './components/ui/sonner';
import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Dashboard } from './components/Dashboard';
import { GameView } from './components/GameView';
import { VerificationCodeScreen } from './components/VerificationCodeScreen';
import { UserProvider } from './hooks/useUser';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState("");
  
  const [needsVerification, setNeedsVerification] =
    useState(false);

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

    const handleVerified = () => {
    setNeedsVerification(false);
    setIsLoggedIn(true);
  };

  const handleBackToWelcome = () => {
    setNeedsVerification(false);
    setUserEmail("");
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
    setIsLoggedIn(false);
    setInGame(false);
    setUsername('');
    setGameCode('');
  };

  // compute content to render depending on app state
  let content = (
    <>
        <WelcomeScreen
          onLogin={handleLogin}
          onRequireVerification={(payload: { email: string; username: string }) => {
            setUserEmail(payload.email);
            setUsername(payload.username);
            setNeedsVerification(true);
          }}
        />
      <Toaster position="top-center" richColors />
    </>
  );

  if (needsVerification) {
    content = (
      <>
        <VerificationCodeScreen
          email={userEmail}
          username={username}
          onVerified={handleVerified}
          onBack={handleBackToWelcome}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  } else if (!isLoggedIn) {
    // content already set to welcome
  } else if (inGame) {
    content = <GameView gameCode={gameCode} username={username} onLeaveGame={handleLeaveGame} />;
  } else {
    content = <Dashboard username={username} onJoinGame={handleJoinGame} onLogout={handleLogout} />;
  }

  return <UserProvider>{content}</UserProvider>;
}

