import { useState, useRef } from 'react';
import { Mail, Lock, User, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import mockUser from '../mocks/mockUser';

interface WelcomeScreenProps {
  onLogin?: (username: string) => void;
}

export function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // ... (keep existing validation logic)

    // Si todo está bien, hacer login
    toast.success('¡Bienvenido!', {
      description: isLogin ? 'Has iniciado sesión correctamente' : 'Cuenta creada exitosamente',
      duration: 2000,
    });

    setTimeout(() => {
      setIsLoading(false);
      // Use form username or extract from email for demo
      const user = formData.username || formData.email.split('@')[0];
      onLogin?.(user);
    }, 500);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    toast.success('Iniciando sesión con Google...', {
      description: 'Redirigiendo...',
      duration: 2000,
    });
    setTimeout(() => {
      setIsLoading(false);
      onLogin?.('GoogleUser');
    }, 1000);
  };

  const autofillDemo = () => {
    setFormData({
      username: mockUser.username,
      email: mockUser.email,
      password: mockUser.password,
    });
  };

  const autologinDemo = () => {
    // Fill the form and request submit programmatically
    autofillDemo();
    setTimeout(() => {
      // requestSubmit is modern; fallback to dispatching submit event
      const form = formRef.current as HTMLFormElement | null;
      if (form) {
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative paint splashes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-rose-200/30 rounded-full blur-2xl animate-pulse delay-500"></div>

      {/* Paintbrush decoration */}
      <div className="absolute top-8 right-8 opacity-20">
        <Palette className="w-16 h-16 text-orange-400 rotate-12" />
      </div>
      <div className="absolute bottom-8 left-8 opacity-20">
        <Palette className="w-20 h-20 text-amber-400 -rotate-12" />
      </div>

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-orange-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <h1 className="text-5xl tracking-tight mb-2 relative">
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                  Drawsync
                </span>
              </h1>
              <div className="absolute -top-2 -right-8 w-8 h-8 bg-orange-400 rounded-full opacity-60"></div>
              <div className="absolute -bottom-1 -left-6 w-6 h-6 bg-amber-400 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 -right-4 w-4 h-4 bg-rose-400 rounded-full opacity-60"></div>
            </div>
            <p className="text-gray-600 mt-2">
              {isLogin ? '¡Bienvenido de vuelta!' : '¡Únete a la diversión!'}
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">
                  Nombre de usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="tu_usuario"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10 bg-white border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-white border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 bg-white border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-xl hover:shadow-orange-300"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : (isLogin ? 'Iniciar sesión' : 'Registrarse')}
            </Button>
          </form>

          {/* Development helpers: autofill / autologin demo user */}
          {((import.meta as any).env?.DEV) && (
            <div className="mt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={autofillDemo} className="text-sm">
                Autofill demo
              </Button>
              <Button type="button" variant="outline" onClick={autologinDemo} className="text-sm">
                Autologin demo
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500">
                O continúa con
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-200"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          {/* Toggle between login/register */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              {isLogin ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <span className="text-orange-500">Regístrate aquí</span>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <span className="text-orange-500">Inicia sesión</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fun subtitle */}
        <p className="text-center mt-6 text-gray-600">
          🎨 Dibuja, adivina y diviértete con amigos
        </p>
      </div>
    </div>
  );
}