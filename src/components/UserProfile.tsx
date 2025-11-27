import { Mail, Calendar, Trophy, Target, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { EditProfileModal } from './EditProfileModal';
import { useState } from 'react';

import { getUser } from '../services/authService';

export function UserProfile() {
  const currentUser = getUser();
  const [user, setUser] = useState({
    username: currentUser?.username || 'Usuario',
    email: currentUser?.email || 'usuario@email.com',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || 'Usuario'}`,
    joinDate: 'Octubre 2024',
    level: 12,
    xp: 3450,
    xpToNextLevel: 5000,
    stats: {
      totalGames: 81,
      wins: 52,
      totalScore: 10920,
      averageScore: 135,
      winRate: 64,
    },
    achievements: [
      { id: '1', name: 'Primera Victoria', icon: '🏆', unlocked: true },
      { id: '2', name: 'Racha de 5', icon: '🔥', unlocked: true },
      { id: '3', name: 'Artista Pro', icon: '🎨', unlocked: true },
      { id: '4', name: '100 Partidas', icon: '💯', unlocked: false },
      { id: '5', name: 'Maestro del Color', icon: '🌈', unlocked: false },
      { id: '6', name: 'Leyenda', icon: '⭐', unlocked: false },
    ],
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* User header card */}
        <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="w-24 h-24 border-4 border-orange-400">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-gray-800">
                      {user.username}
                    </h2>
                    <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white border-none">
                      Nivel {user.level}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Miembro desde {user.joinDate}
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experiencia</span>
                    <span className="text-orange-600">{user.xp} / {user.xpToNextLevel} XP</span>
                  </div>
                  <Progress value={(user.xp / user.xpToNextLevel) * 100} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Partidas jugadas</p>
                  <p className="text-2xl text-orange-600">{user.stats.totalGames}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Victorias</p>
                  <p className="text-2xl text-amber-600">{user.stats.wins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de victoria</p>
                  <p className="text-2xl text-rose-600">{user.stats.winRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Puntuación total</p>
                  <p className="text-2xl text-purple-600">{user.stats.totalScore.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {user.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${achievement.unlocked
                      ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className={achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}>
                        {achievement.name}
                      </p>
                      {achievement.unlocked && (
                        <Badge variant="outline" className="border-orange-300 text-orange-600 mt-1">
                          Desbloqueado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <EditProfileModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        currentUsername={user.username}
        currentEmail={user.email}
        currentAvatar={user.avatar}
      />
    </>
  );
}