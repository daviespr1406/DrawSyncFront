import { Crown, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
  isDrawing: boolean;
}

interface PlayersListProps {
  players: Player[];
}

export function PlayersList({ players }: PlayersListProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-orange-200 shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-200">
        <h3 className="text-orange-700">Jugadores</h3>
        <p className="text-sm text-gray-600">{players.length} en línea</p>
      </div>

      {/* Players list */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                player.isDrawing
                  ? 'bg-gradient-to-r from-orange-100 to-amber-100 ring-2 ring-orange-300'
                  : 'bg-gray-50 hover:bg-orange-50'
              }`}
            >
              <div className="relative">
                <Avatar className={`w-12 h-12 ${
                  player.isDrawing ? 'ring-2 ring-orange-400' : ''
                }`}>
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>{player.username[0]}</AvatarFallback>
                </Avatar>
                {player.isDrawing && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <Pencil className="w-3 h-3 text-white" />
                  </div>
                )}
                {index === 0 && !player.isDrawing && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-800 truncate">
                    {player.username}
                  </p>
                  {player.isDrawing && (
                    <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white border-none text-xs">
                      Dibujando
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-orange-600">
                    {player.score} pts
                  </p>
                  {index < 3 && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        index === 0
                          ? 'border-amber-400 text-amber-600'
                          : index === 1
                          ? 'border-gray-400 text-gray-600'
                          : 'border-orange-400 text-orange-600'
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
