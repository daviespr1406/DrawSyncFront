import { useState } from 'react';
import { Copy, Play, Users, Check, LogOut, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

interface GameLobbyProps {
    gameCode: string;
    players: string[];
    isCreator: boolean;
    onStartGame: () => void;
    onLeave?: () => void;
    onAbort?: () => void;
}

export function GameLobby({ gameCode, players, isCreator, onStartGame, onLeave, onAbort }: GameLobbyProps) {
    const [copied, setCopied] = useState(false);

    const copyGameCode = () => {
        navigator.clipboard.writeText(gameCode);
        setCopied(true);
        toast.success('Código copiado!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent mb-2">
                        Sala de Espera
                    </h1>
                    <p className="text-gray-600">Esperando a que todos los jugadores se unan...</p>
                </div>

                {/* Game Code */}
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-6 mb-8">
                    <p className="text-sm text-gray-600 text-center mb-2">Código de la Partida</p>
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-5xl font-mono font-bold tracking-widest text-orange-600">
                            {gameCode}
                        </div>
                        <Button
                            onClick={copyGameCode}
                            size="icon"
                            variant="outline"
                            className="border-orange-300 hover:bg-orange-200"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-orange-600" />}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Comparte este código con tus amigos
                    </p>
                </div>

                {/* Players List */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-orange-600" />
                        <h2 className="text-xl font-bold text-gray-800">
                            Jugadores ({players.length})
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {players.map((player, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-orange-100 shadow-sm"
                            >
                                <Avatar className="w-12 h-12 border-2 border-orange-300">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player}`} />
                                    <AvatarFallback>{player[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{player}</p>
                                    {index === 0 && (
                                        <p className="text-xs text-orange-600">Creador</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                {isCreator ? (
                    <div className="space-y-3">
                        <Button
                            onClick={onStartGame}
                            disabled={players.length < 1}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg py-6 rounded-xl shadow-lg"
                        >
                            <Play className="w-6 h-6 mr-2" />
                            Iniciar Juego
                        </Button>
                        <Button
                            onClick={onAbort}
                            variant="destructive"
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl"
                        >
                            <XCircle className="w-5 h-5 mr-2" />
                            Abortar Partida
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="text-center p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                            <p className="text-gray-700">
                                Esperando a que el creador inicie la partida...
                            </p>
                            <div className="flex justify-center gap-2 mt-4">
                                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                        <Button
                            onClick={onLeave}
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50 py-4 rounded-xl"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Salir de la Partida
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
