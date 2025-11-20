import { Download, Share2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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

interface MemoryModalProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemoryModal({ game, open, onOpenChange }: MemoryModalProps) {
  if (!game) return null;

  const handleDownload = () => {
    console.log('Descargando recuerdo...');
  };

  const handleShare = () => {
    console.log('Compartiendo recuerdo...');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-sm border-orange-100">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {game.title}
              </DialogTitle>
              <DialogDescription>
                Recuerdo de la partida del {game.date}
              </DialogDescription>
            </div>
            {game.winner && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-none">
                Ganador
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
            <ImageWithFallback
              src={game.memoryImage}
              alt={`Recuerdo de ${game.title}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Game stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Jugadores</p>
              <p className="text-orange-600">{game.players}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Duración</p>
              <p className="text-orange-600">{game.duration}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Puntuación</p>
              <p className="text-orange-600">{game.score} pts</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
