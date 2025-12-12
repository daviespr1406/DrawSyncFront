import { useState } from 'react';
import { Gamepad2, AlertCircle } from 'lucide-react';
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
import { API_BASE_URL } from '../config';

interface JoinGameModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGameJoined?: (gameCode: string) => void;
    username: string;
}

export function JoinGameModal({ open, onOpenChange, onGameJoined, username }: JoinGameModalProps) {
    const [gameCode, setGameCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleJoin = async () => {
        if (!gameCode.trim()) {
            setErrorMessage('Por favor ingresa un código de partida');
            return;
        }

        // Validate code format (4 characters, alphanumeric)
        if (gameCode.length !== 4) {
            setErrorMessage('El código debe tener exactamente 4 caracteres');
            return;
        }

        if (!/^[A-Z0-9]{4}$/.test(gameCode)) {
            setErrorMessage('El código solo puede contener letras y números');
            return;
        }

        // Check if user is authenticated
        if (!isAuthenticated()) {
            console.error('User not authenticated');
            logout();
            return;
        }

        setErrorMessage(''); // Clear previous errors
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/games/join`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ gameCode: gameCode.toUpperCase(), player: username }),
            });

            // If authentication fails, inform the user but do not redirect automatically
            if (response.status === 401 || response.status === 403) {
                console.error('Authentication failed - please login again');
                setErrorMessage('Tu sesión ha expirado. Por favor inicia sesión nuevamente');
                toast.error('Sesión expirada', {
                    description: 'Por favor inicia sesión nuevamente',
                });
                return;
            }

            if (response.ok) {
                const game = await response.json();
                // Check if game is null (means room is full or other error)
                if (!game) {
                    setErrorMessage('Esta partida está llena');
                    toast.error('Sala llena', {
                        description: 'Esta partida está llena',
                        duration: 4000,
                    });
                    return;
                }

                toast.success('¡Unido exitosamente!', {
                    description: `Te has unido a la partida ${gameCode}`,
                });
                onOpenChange(false);
                setGameCode(''); // Clear the input
                setErrorMessage('');
                onGameJoined?.(gameCode.toUpperCase());
            } else if (response.status === 409) {
                // Conflict - room is full
                setErrorMessage('🚫 Esta partida está llena');
                toast.error('Sala llena', {
                    description: 'Esta partida está llena',
                    duration: 5000,
                });
            } else if (response.status === 404) {
                // Not found
                setErrorMessage('❌ No existe ninguna partida con el código ' + gameCode);
                toast.error('Partida no encontrada', {
                    description: 'El código ingresado no corresponde a ninguna partida activa',
                    duration: 4000,
                });
            } else {
                setErrorMessage('No se pudo unir a la partida. Intenta nuevamente');
                toast.error('Error al unirse', {
                    description: 'No se pudo unir a la partida',
                });
            }
        } catch (error) {
            console.error('Error joining game:', error);
            setErrorMessage('Error de conexión con el servidor');
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeChange = (value: string) => {
        // Convert to uppercase for consistency
        setGameCode(value.toUpperCase());
        setErrorMessage(''); // Clear error when user types
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen: boolean) => {
            onOpenChange(isOpen);
            if (!isOpen) {
                setErrorMessage('');
                setGameCode('');
            }
        }}>
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
                    {/* Error Message Banner */}
                    {errorMessage && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800">Error</p>
                                <p className="text-sm text-red-700">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="gameCode">Código de partida</Label>
                        <div className="relative">
                            <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                            <Input
                                id="gameCode"
                                placeholder="Ej: AB12"
                                value={gameCode}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleJoin();
                                    }
                                }}
                                className={`pl-10 bg-white border-orange-200 focus:border-orange-300 focus:ring-orange-200 font-mono uppercase tracking-widest text-center text-2xl ${errorMessage ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                                    }`}
                                maxLength={4}
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            El código debe tener 4 caracteres (letras y números)
                        </p>
                    </div>

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
