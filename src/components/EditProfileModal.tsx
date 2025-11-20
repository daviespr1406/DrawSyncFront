import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  currentEmail: string;
  currentAvatar: string;
}

export function EditProfileModal({
  open,
  onOpenChange,
  currentUsername,
  currentEmail,
  currentAvatar,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [email, setEmail] = useState(currentEmail);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = () => {
    // Generar un nuevo avatar aleatorio
    const seeds = ['Usuario', 'Player', 'Gamer', 'Artist', 'Creator', 'Designer', 'Painter', 'Drawer'];
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)] + Date.now();
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  const handleSave = () => {
    setIsLoading(true);

    // Validaciones
    if (!username || username.length < 3) {
      toast.error('Nombre de usuario inválido', {
        description: 'El nombre debe tener al menos 3 caracteres',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    if (!email || !email.includes('@')) {
      toast.error('Correo electrónico inválido', {
        description: 'Por favor ingresa un correo válido',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    // Simular guardado
    setTimeout(() => {
      toast.success('Perfil actualizado', {
        description: 'Tus cambios han sido guardados exitosamente',
        duration: 2000,
      });
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-orange-200">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
            Editar perfil
          </DialogTitle>
          <DialogDescription>
            Actualiza tu información personal y foto de perfil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-orange-300">
                <AvatarImage src={avatar} />
                <AvatarFallback>{username[0]}</AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarChange}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Haz clic en el ícono de cámara para cambiar tu avatar
            </p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_usuario"
              className="bg-white border-orange-200 focus:border-orange-300 focus:ring-orange-200"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="bg-white border-orange-200 focus:border-orange-300 focus:ring-orange-200"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
