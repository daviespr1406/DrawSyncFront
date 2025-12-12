import { useState, useRef, useEffect } from 'react';
import { Mail, Lock, User, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import mockUser from '../mocks/mockUser';
import { saveToken, saveUser, getToken, getUser, logout } from '../services/authService';
import { API_BASE_URL } from '../config';

interface WelcomeScreenProps {
  onLogin?: (username: string) => void;
}

declare global {
  interface Window {
    hasProcessedCognitoCode?: boolean;
  }
}

export function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-login if token already stored
  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user?.username) {
      onLogin?.(user.username);
    }
  }, []);

  // Module-level variable to prevent double execution in Strict Mode
  // This needs to be outside the component or use a more persistent state if the module reloads
  // But for simple remounts, a ref inside the component is reset.
  // Actually, let's use a ref but ensure we don't reset it on simple remounts if possible? 
  // No, in dev, the component is recreated.
  // Let's use a static property or window property if needed, but a simple check might be enough.

  // Better approach: Check if we are already verifying.
  // But let's try to be robust.

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // Check a global flag to prevent double-processing in React Strict Mode
    if (code && !window.hasProcessedCognitoCode) {
      window.hasProcessedCognitoCode = true;
      // Exchange code for token
      handleCognitoCallback(code);
    }
  }, []);

  const handleCognitoCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request/test?code=${code}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Cognito callback response data:', data); // Debug log

        // Save token
        if (data.response) {
          console.log('Saving token from response:', data.response); // Debug log
          // Save the complete token object (not just access_token string)
          saveToken(data.response);

          // Extract username from token - supports both traditional and Google login
          const username = data.response.username || data.response.name || 'User';
          const email = data.response.email || '';
          const picture = data.response.picture || '';

          saveUser({ username, email, picture });

          toast.success('¡Autenticación exitosa!', {
            description: `Bienvenido ${username}`,
          });

          // Clean URL and redirect
          window.history.replaceState({}, document.title, window.location.pathname);
          onLogin?.(username);
        }
      } else {
        toast.error('Error de autenticación', {
          description: 'No se pudo completar el inicio de sesión',
        });
      }
    } catch (error) {
      console.error('Error during Cognito callback:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login response:', data);

        if (data.response) {
          saveToken(data.response);
          // Use username from response if available, otherwise fallback to email part or "User"
          const username = data.response.username || formData.email.split('@')[0];
          saveUser({ username, email: formData.email });

          toast.success('¡Bienvenido!', {
            description: 'Has iniciado sesión correctamente',
          });

          onLogin?.(username);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error:', errorData);
        toast.error('Error de inicio de sesión', {
          description: 'Verifica tus credenciales e inténtalo de nuevo',
        });
      }
    } catch (error) {
      console.error('Login connection error:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          confirmationCode: verificationCode,
        }),
      });

      if (response.ok) {
        toast.success('¡Cuenta verificada!', {
          description: 'Ahora puedes iniciar sesión',
        });
        setIsVerifying(false);
        setIsLogin(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Verification error:', errorData);
        toast.error('Error de verificación', {
          description: 'Código inválido o expirado',
        });
      }
    } catch (error) {
      console.error('Verification connection error:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast.success('¡Registro exitoso!', {
          description: 'Revisa tu correo para el código de verificación',
        });
        setIsVerifying(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration error:', errorData);
        toast.error('Error de registro', {
          description: 'No se pudo crear la cuenta. Intenta con otro usuario o correo.',
        });
      }
    } catch (error) {
      console.error('Registration connection error:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHostedUILogin = () => {
    // Redirect directly to Google via Cognito without showing the Hosted UI
    const cognitoUrl = 'https://us-east-2lexburybs.auth.us-east-2.amazoncognito.com';
    const clientId = '4redvlq1u4ur9kjlvopso1cgvt';
    const redirectUri = encodeURIComponent('https://draw-sync-front.vercel.app');
    const responseType = 'code';
    const scope = encodeURIComponent('email openid');

    // The key is adding identity_provider=Google to bypass the Cognito Hosted UI
    const authUrl = `${cognitoUrl}/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&scope=${scope}&redirect_uri=${redirectUri}&identity_provider=Google`;

    toast.success('Redirigiendo a Google...', {
      description: 'Iniciando sesión con tu cuenta de Google',
      duration: 1500,
    });

    setTimeout(() => {
      window.location.href = authUrl;
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) {
      handleVerify();
    } else if (isLogin) {
      handleCustomLogin();
    } else {
      handleRegister();
    }
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
              {isVerifying
                ? 'Verifica tu cuenta'
                : (isLogin ? '¡Bienvenido de vuelta!' : '¡Únete a la diversión!')}
            </p>
            {getToken() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  setIsLogin(true);
                  setFormData({ username: '', email: '', password: '' });
                  window.location.reload(); // Reload to clear any state/context
                }}
                className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Cerrar sesión
              </Button>
            )}
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {isVerifying ? (
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700">
                  Código de Verificación
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el código enviado a {formData.email}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-xl hover:shadow-orange-300"
              disabled={isLoading}
            >
              {isLoading
                ? 'Cargando...'
                : (isVerifying ? 'Verificar' : (isLogin ? 'Iniciar sesión' : 'Registrarse'))}
            </Button>
          </form>

          {/* Google Sign In */}
          {!isVerifying && (
            <>
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

              <Button
                type="button"
                variant="outline"
                onClick={handleHostedUILogin}
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
            </>
          )}

          {isVerifying && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsVerifying(false)}
                className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>

        {/* Fun subtitle */}
        <p className="text-center mt-6 text-gray-600">
          🎨 Dibuja, adivina y diviértete con amigos
        </p>
      </div>
    </div>
  );
}