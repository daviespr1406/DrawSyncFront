import { Mail, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import { getUser } from '../services/authService';

export function UserProfile() {
  const currentUser = getUser();

  const username = currentUser?.username || 'Usuario';
  const email = currentUser?.email || '';
  const picture = currentUser?.picture || '';
  const avatar = picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* User header card */}
      <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <Avatar className="w-32 h-32 border-4 border-orange-400">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-3xl">{username[0]}</AvatarFallback>
            </Avatar>

            <div className="space-y-3 w-full">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {username}
                </h2>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <UserIcon className="w-5 h-5" />
                  <span>Jugador de DrawSync</span>
                </div>
              </div>

              {email && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2">
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info section */}
      <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6 pb-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-orange-500" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Información del perfil
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Aquí puedes ver tu información básica de usuario.
                ¡Comienza a jugar para ganar puntos y competir con otros jugadores!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
