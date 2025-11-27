import { Trophy, Home, Medal } from 'lucide-react';
import { Button } from './ui/button';

interface GameEndScreenProps {
    gameCode: string;
    onNewGame: () => void;
    scores?: Record<string, number>;
}

export function GameEndScreen({ gameCode, onNewGame, scores = {} }: GameEndScreenProps) {
    const sortedPlayers = Object.entries(scores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200 p-12 text-center">
                {/* Trophy Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Trophy className="w-20 h-20 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent mb-4">
                    ¡Partida Terminada!
                </h1>

                {/* Message */}
                <p className="text-xl text-gray-600 mb-8">
                    La partida <span className="font-mono font-bold text-orange-600">{gameCode}</span> ha finalizado
                </p>

                {/* Leaderboard */}
                {sortedPlayers.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Top 3 Ganadores</h2>
                        <div className="space-y-4">
                            {sortedPlayers.map(([player, score], index) => (
                                <div key={player} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                                            ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-semibold text-lg text-gray-800">{player}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Medal className="w-5 h-5 text-orange-500" />
                                        <span className="font-bold text-orange-600">{score} pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={onNewGame}
                    className="w-full max-w-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg py-6 rounded-xl shadow-lg"
                >
                    <Home className="w-6 h-6 mr-2" />
                    Nueva Partida
                </Button>
            </div>
        </div>
    );
}
