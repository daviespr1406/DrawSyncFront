import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { getAuthHeaders, isAuthenticated, logout } from '../services/authService';

interface JoinGameModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGameJoined?: (gameCode: string) => void;
    username: string;
}

export function JoinGameModal({ open, onOpenChange, onGameJoined, username }: JoinGameModalProps) {
    const [gameCode, setGameCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async () => {
        if (!gameCode.trim()) return;

        // Check if user is authenticated
        if (!isAuthenticated()) {
            console.error('User not authenticated');
            logout();
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/games/join', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ gameCode: gameCode.toUpperCase(), player: username }),
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
                onOpenChange(false);
                onGameJoined?.(gameCode.toUpperCase());
            } else {
                toast.error('Error al unirse', {
                    description: 'Código de partida inválido o partida llena',
                });
            }
        } catch (error) {
            console.error('Error joining game:', error);
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-orange-100">
                <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                        Unirse a partida
                    </DialogTitle>
                    <DialogDescription>
                        Ingresa el código de la partida para unirte
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="gameCode">Código de partida</Label>
                        <div className="relative">
                            <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                            <Input
                                id="gameCode"
                                placeholder="Ej: ABCD"
                                value={gameCode}
                                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                                className="pl-10 bg-white border-orange-200 focus:border-orange-300 focus:ring-orange-200 font-mono uppercase tracking-widest"
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleJoin}
                            disabled={isLoading || !gameCode}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                            {isLoading ? 'Uniéndose...' : 'Unirse'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
