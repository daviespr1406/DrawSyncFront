import { useEffect, useState } from 'react';
import { Users, Lock, Unlock, Play, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getAuthHeaders } from '../services/authService';
import { toast } from 'sonner';
import { JoinGameModal } from './JoinGameModal';
import { API_BASE_URL } from '../config';

interface Game {
    gameCode: string;
    players: string[];
    maxPlayers: number;
    isPrivate: boolean;
    gameDuration: number;
}

interface AvailableGamesProps {
    username: string;
    onJoinGame?: (gameCode: string) => void;
}

export function AvailableGames({ username, onJoinGame }: AvailableGamesProps) {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPrivateGame, setSelectedPrivateGame] = useState<string | null>(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const fetchGames = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/games/available`, {
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setGames(data);
            }
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchGames();
    };

    useEffect(() => {
        fetchGames();
        // Refresh every 3 seconds
        const interval = setInterval(fetchGames, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleJoinPublic = async (gameCode: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/games/join`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ gameCode, player: username }),
            });

            if (response.ok) {
                toast.success('¡Te has unido a la partida!', {
                    description: `Código: ${gameCode}`,
                });
                onJoinGame?.(gameCode);
            } else if (response.status === 409) {
                toast.error('Sala llena', {
                    description: 'Esta partida está llena',
                });
            } else {
                toast.error('Error', {
                    description: 'No se pudo unir a la partida',
                });
            }
        } catch (error) {
            console.error('Error joining game:', error);
            toast.error('Error de conexión');
        }
    };

    const handleJoinPrivate = (gameCode: string) => {
        setSelectedPrivateGame(gameCode);
        setIsJoinModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-12 pb-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                        <Users className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No hay salas disponibles
                    </h3>
                    <p className="text-gray-600">
                        ¡Sé el primero en crear una partida!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* Header with refresh button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">
                            {games.length} {games.length === 1 ? 'sala disponible' : 'salas disponibles'}
                        </span>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                </div>

                {/* Games grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {games.map((game) => (
                        <Card
                            key={game.gameCode}
                            className="border-orange-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
                        >
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {game.isPrivate ? (
                                                <Lock className="w-5 h-5 text-amber-600" />
                                            ) : (
                                                <Unlock className="w-5 h-5 text-green-600" />
                                            )}
                                            <h3 className="text-xl font-bold font-mono text-gray-800">
                                                {game.gameCode}
                                            </h3>
                                        </div>
                                        <Badge
                                            variant={game.isPrivate ? 'destructive' : 'default'}
                                            className={game.isPrivate ? 'bg-amber-500' : 'bg-green-500'}
                                        >
                                            {game.isPrivate ? 'Privada' : 'Pública'}
                                        </Badge>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                Jugadores
                                            </span>
                                            <span className="text-orange-600 font-semibold">
                                                {game.players.length}/{game.maxPlayers}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Duración</span>
                                            <span className="text-orange-600 font-semibold">
                                                {game.gameDuration}s
                                            </span>
                                        </div>
                                    </div>

                                    {/* Players list */}
                                    {game.players.length > 0 && (
                                        <div className="pt-2 border-t border-orange-100">
                                            <p className="text-xs text-gray-500 mb-2">En sala:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {game.players.map((player, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="outline"
                                                        className="border-orange-200 text-orange-700 text-xs"
                                                    >
                                                        {player}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Join button */}
                                    <Button
                                        onClick={() =>
                                            game.isPrivate
                                                ? handleJoinPrivate(game.gameCode)
                                                : handleJoinPublic(game.gameCode)
                                        }
                                        disabled={game.players.length >= game.maxPlayers}
                                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        {game.isPrivate ? 'Ingresar código' : 'Unirse'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modal for private games */}
            {selectedPrivateGame && (
                <JoinGameModal
                    open={isJoinModalOpen}
                    onOpenChange={setIsJoinModalOpen}
                    onGameJoined={onJoinGame}
                    username={username}
                />
            )}
        </>
    );
}
