import { useState } from 'react';
import { Users, Clock, Zap } from 'lucide-react';
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
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { getAuthHeaders, isAuthenticated, logout } from '../services/authService';

interface CreateGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameCreated?: (gameCode: string) => void;
  username: string;
}

export function CreateGameModal({ open, onOpenChange, onGameCreated, username }: CreateGameModalProps) {
  const [gameName, setGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState([6]);
  const [roundTime, setRoundTime] = useState([60]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.error('User not authenticated');
      logout();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/games/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ player: username }),
      });

      // If authentication fails, inform the user but do not redirect automatically
      if (response.status === 401 || response.status === 403) {
        console.error('Authentication failed - please login again');
        toast.error('Sesión expirada', {
          description: 'Por favor inicia sesión nuevamente',
        });
        return;
      }

      if (response.ok) {
        const game = await response.json();
        onOpenChange(false);
        onGameCreated?.(game.gameCode);
      } else {
        console.error('Failed to create game:', response.status);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-orange-100">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
            Crear nueva partida
          </DialogTitle>
          <DialogDescription>
            Configura tu partida y comienza a dibujar con amigos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Game name */}
          <div className="space-y-2">
            <Label htmlFor="gameName">Nombre de la partida</Label>
            <Input
              id="gameName"
              placeholder="Ej: Partida épica 🎨"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="bg-white border-orange-200 focus:border-orange-300 focus:ring-orange-200"
            />
          </div>

          {/* Max players */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Jugadores máximos
              </Label>
              <span className="text-orange-600">{maxPlayers[0]}</span>
            </div>
            <Slider
              value={maxPlayers}
              onValueChange={setMaxPlayers}
              min={2}
              max={12}
              step={1}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-orange-500 [&_[role=slider]]:to-amber-500"
            />
            <p className="text-sm text-gray-500">
              Entre 2 y 12 jugadores
            </p>
          </div>

          {/* Round time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Tiempo por ronda
              </Label>
              <span className="text-orange-600">{roundTime[0]}s</span>
            </div>
            <Slider
              value={roundTime}
              onValueChange={setRoundTime}
              min={30}
              max={120}
              step={10}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-orange-500 [&_[role=slider]]:to-amber-500"
            />
            <p className="text-sm text-gray-500">
              Entre 30 y 120 segundos
            </p>
          </div>

          {/* Private game toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <div>
                <Label htmlFor="private-mode" className="cursor-pointer">
                  Partida privada
                </Label>
                <p className="text-sm text-gray-600">
                  Solo con código de acceso
                </p>
              </div>
            </div>
            <Switch
              id="private-mode"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              {isLoading ? 'Creando...' : 'Crear partida'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}