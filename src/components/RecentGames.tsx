import { useState, useEffect } from 'react';
import { Clock, Users, Eye, Trophy, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MemoryModal } from './MemoryModal';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getUser } from '../services/authService';

interface Game {
  gameCode: string;
  players: string[];
  scores: Record<string, number>;
  currentWord: string;
  status: string;
  winner: string | null;
  gameDuration: number;
  createdAt: string;
  timeRemaining: number;
  drawings?: Record<string, string>; // Player -> Base64
}

interface DisplayGame {
  id: string;
  title: string;
  players: number;
  score: number;
  duration: string;
  date: string;
  winner: boolean;
  memoryImage: string;
}

export function RecentGames() {
  const [selectedMemory, setSelectedMemory] = useState<DisplayGame | null>(null);
  const [games, setGames] = useState<DisplayGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        const user = getUser();
        if (!user?.username) {
          console.log('No user logged in');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/games/recent/${user.username}`);
        if (response.ok) {
          const data: Game[] = await response.json();

          // Transform backend games to display format
          const displayGames: DisplayGame[] = data.map((game) => {
            const userScore = game.scores[user.username] || 0;
            const isWinner = game.winner === user.username;
            const date = new Date(game.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            // Calculate actual duration played (gameDuration - timeRemaining)
            const durationPlayed = game.gameDuration - game.timeRemaining;
            const minutes = Math.floor(durationPlayed / 60);
            const seconds = durationPlayed % 60;
            const durationStr = minutes > 0 ? `${minutes} min` : `${seconds} seg`;

            // Determine image to show: user's drawing -> any drawing -> fallback
            let memoryImage = 'https://images.unsplash.com/photo-1541490288758-8813db7ca235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

            if (game.drawings) {
              const userDrawing = game.drawings[user.username];
              if (userDrawing) {
                memoryImage = `data:image/png;base64,${userDrawing}`;
              } else {
                // Fallback to any drawing
                const anyDrawing = Object.values(game.drawings)[0];
                if (anyDrawing) {
                  memoryImage = `data:image/png;base64,${anyDrawing}`;
                }
              }
            }

            return {
              id: game.gameCode,
              title: `Palabra: ${game.currentWord} 🎨`,
              players: game.players.length,
              score: userScore,
              duration: durationStr,
              date: date,
              winner: isWinner,
              memoryImage: memoryImage,
            };
          });

          setGames(displayGames);
        } else {
          console.error('Failed to fetch recent games');
        }
      } catch (error) {
        console.error('Error fetching recent games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentGames();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando partidas...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              Aquí puedes ver tus últimas 3 partidas jugadas
            </p>
          </div>
        </div>

        {games.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Card
                key={game.id}
                className="border-orange-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {game.title}
                        {game.winner && (
                          <Trophy className="w-4 h-4 text-amber-500" />
                        )}
                      </CardTitle>
                      <CardDescription>{game.date}</CardDescription>
                    </div>
                    {game.winner && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-none">
                        Ganador
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Preview image */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                    <ImageWithFallback
                      src={game.memoryImage}
                      alt={`Recuerdo de ${game.title}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{game.players}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{game.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600">
                      <Trophy className="w-4 h-4" />
                      <span>{game.score} pts</span>
                    </div>
                  </div>

                  {/* View memory button */}
                  <Button
                    onClick={() => setSelectedMemory(game)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver recuerdo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty state message */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <Palette className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-gray-700 mb-2">
              Aún no has jugado partidas
            </h3>
            <p className="text-gray-500 mb-4">
              ¡Crea tu primera partida y comienza a dibujar!
            </p>
          </div>
        )}
      </div>

      <MemoryModal
        game={selectedMemory}
        open={!!selectedMemory}
        onOpenChange={(open) => !open && setSelectedMemory(null)}
      />
    </>
  );
}
