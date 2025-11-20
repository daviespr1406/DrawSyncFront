import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Player {
  id: string;
  username: string;
  score: number;
  wins: number;
  gamesPlayed: number;
  avatar?: string;
}

const mockRankings: Player[] = [
  {
    id: '1',
    username: 'ArtistaPro',
    score: 15420,
    wins: 87,
    gamesPlayed: 124,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtistaPro',
  },
  {
    id: '2',
    username: 'DibujoMaster',
    score: 14850,
    wins: 79,
    gamesPlayed: 115,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DibujoMaster',
  },
  {
    id: '3',
    username: 'ColorfulKing',
    score: 13920,
    wins: 71,
    gamesPlayed: 108,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ColorfulKing',
  },
  {
    id: '4',
    username: 'SketchHero',
    score: 12760,
    wins: 65,
    gamesPlayed: 98,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SketchHero',
  },
  {
    id: '5',
    username: 'PaintGenius',
    score: 11840,
    wins: 58,
    gamesPlayed: 89,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PaintGenius',
  },
  {
    id: '6',
    username: 'TúMismo',
    score: 10920,
    wins: 52,
    gamesPlayed: 81,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Usuario',
  },
  {
    id: '7',
    username: 'DrawNinja',
    score: 9850,
    wins: 45,
    gamesPlayed: 73,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrawNinja',
  },
  {
    id: '8',
    username: 'ArtLover',
    score: 8920,
    wins: 39,
    gamesPlayed: 65,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtLover',
  },
];

const getRankIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Crown className="w-6 h-6 text-amber-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-orange-600" />;
    default:
      return null;
  }
};

const getRankBadgeColor = (position: number) => {
  switch (position) {
    case 1:
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
    case 2:
      return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700';
    case 3:
      return 'bg-gradient-to-r from-orange-400 to-amber-500 text-white';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function Rankings() {
  return (
    <div className="space-y-6">
      {/* Top 3 podium */}
      <div className="grid md:grid-cols-3 gap-4">
        {mockRankings.slice(0, 3).map((player, index) => {
          const position = index + 1;
          const isFirst = position === 1;
          
          return (
            <Card
              key={player.id}
              className={`border-orange-100 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                isFirst ? 'md:col-start-2 md:row-start-1 ring-2 ring-amber-400' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Avatar className={`${isFirst ? 'w-24 h-24' : 'w-20 h-20'} border-4 ${
                      isFirst ? 'border-amber-400' : position === 2 ? 'border-gray-300' : 'border-orange-400'
                    }`}>
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback>{player.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      {getRankIcon(position)}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-800 mb-1">
                      {player.username}
                    </h3>
                    <Badge className={`${getRankBadgeColor(position)} border-none`}>
                      #{position}
                    </Badge>
                  </div>
                  
                  <div className="w-full space-y-2 pt-2 border-t border-orange-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Puntos</span>
                      <span className="text-orange-600">{player.score.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Victorias</span>
                      <span className="text-orange-600">{player.wins}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Partidas</span>
                      <span className="text-orange-600">{player.gamesPlayed}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rest of rankings */}
      <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-orange-100">
            {mockRankings.slice(3).map((player, index) => {
              const position = index + 4;
              const isCurrentUser = player.username === 'TúMismo';
              const winRate = Math.round((player.wins / player.gamesPlayed) * 100);
              
              return (
                <div
                  key={player.id}
                  className={`p-4 hover:bg-orange-50/50 transition-colors ${
                    isCurrentUser ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 text-center">
                      <Badge variant="outline" className="border-orange-300 text-orange-600">
                        #{position}
                      </Badge>
                    </div>
                    
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback>{player.username[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-gray-800 truncate">
                          {player.username}
                        </h4>
                        {isCurrentUser && (
                          <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white border-none text-xs">
                            Tú
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>{winRate}% victorias</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-orange-600">
                        <Trophy className="w-4 h-4" />
                        <span>{player.score.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {player.wins} victorias
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
