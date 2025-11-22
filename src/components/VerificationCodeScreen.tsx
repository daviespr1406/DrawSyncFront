import { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface VerificationCodeScreenProps {
  email: string;
  username?: string;
  onVerified?: () => void;
  onBack?: () => void;
}

export function VerificationCodeScreen({ email, username, onVerified, onBack }: VerificationCodeScreenProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus on first input when component mounts
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error('Código inválido', {
        description: 'El código debe contener solo números',
        duration: 3000,
      });
      return;
    }

    const newCode = pastedData.split('');
    while (newCode.length < 6) {
      newCode.push('');
    }
    setCode(newCode.slice(0, 6));
    
    // Focus on the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(c => !c);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      toast.error('Código incompleto', {
        description: 'Por favor ingresa los 6 dígitos del código',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = { username: (username || email.split('@')[0]), code: verificationCode };
      const res = await fetch('/api/auth/users/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch (e) {
        body = null;
      }

      if (!res.ok) {
        const serverMessage = body?.message || body?.error || body?.detail || body?.description || (body && JSON.stringify(body)) || res.statusText;
        toast.error(serverMessage || 'Código incorrecto', {
          description: typeof serverMessage === 'string' ? serverMessage : undefined,
          duration: 3000,
        });
        setIsLoading(false);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // success
      toast.success('¡Código verificado!', {
        description: 'Tu cuenta ha sido activada exitosamente',
        duration: 2000,
      });
      setIsLoading(false);
      onVerified?.();
    } catch (err: any) {
      toast.error(err?.message || 'Error verificando código');
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setIsResending(true);
    
    // Simular reenvío de código
    setTimeout(() => {
      toast.success('Código reenviado', {
        description: `Hemos enviado un nuevo código a ${email}`,
        duration: 3000,
      });
      setIsResending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 mb-4 shadow-lg">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent mb-2">
            Drawsync
          </h1>
          <p className="text-gray-600">Verifica tu cuenta</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-orange-200/50 p-8 border border-orange-100">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl text-gray-800 mb-2">
              Revisa tu correo
            </h2>
            <p className="text-gray-600 text-sm">
              Hemos enviado un código de verificación de 6 dígitos a
            </p>
            <p className="text-orange-600 font-medium mt-1">{email}</p>
          </div>

          {/* Code Input */}
          <div className="mb-8">
            <div className="flex gap-2 justify-center mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all bg-white"
                  disabled={isLoading}
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading || code.some(d => !d)}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-xl hover:shadow-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Verificar código
                </div>
              )}
            </Button>
          </div>

          {/* Resend code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              ¿No recibiste el código?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </div>

          {/* Helper text */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800 text-center">
              💡 <strong>Tip para desarrollo:</strong> Usa el código <strong>123456</strong> o <strong>999999</strong> para verificar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
