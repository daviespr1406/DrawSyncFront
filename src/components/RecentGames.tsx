import { useState } from 'react';
import { Clock, Users, Eye, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MemoryModal } from './MemoryModal';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Game {
  id: string;
  title: string;
  players: number;
  score: number;
  duration: string;
  date: string;
  winner: boolean;
  memoryImage: string;
}

const mockGames: Game[] = [
  {
    id: '1',
    title: 'Partida épica 🎨',
    players: 6,
    score: 850,
    duration: '25 min',
    date: '13 Nov 2024',
    winner: true,
    memoryImage: 'https://images.unsplash.com/photo-1541490288758-8813db7ca235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGRyYXdpbmclMjBza2V0Y2h8ZW58MXx8fHwxNzYzMDg4MjA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '2',
    title: 'Noche de diversión 🌙',
    players: 4,
    score: 620,
    duration: '18 min',
    date: '12 Nov 2024',
    winner: false,
    memoryImage: 'https://images.unsplash.com/photo-1683223584921-544e5dd8d076?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMGNhbnZhcyUyMGFydHxlbnwxfHx8fDE3NjMwMzg0NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '3',
    title: 'Batalla artística 🖌️',
    players: 8,
    score: 1020,
    duration: '32 min',
    date: '10 Nov 2024',
    winner: true,
    memoryImage: 'https://images.unsplash.com/photo-1705254613735-1abb457f8a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwYXJ0fGVufDF8fHx8MTc2MzA2MDcwMnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function RecentGames() {
  const [selectedMemory, setSelectedMemory] = useState<Game | null>(null);

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockGames.map((game) => (
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

        {/* Empty state message */}
        {mockGames.length === 0 && (
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
