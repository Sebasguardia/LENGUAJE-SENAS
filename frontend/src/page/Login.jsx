import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ShieldCheck, Lock, ArrowRightCircle, GraduationCap,
  Eye, EyeOff, Mail, Key, Sparkles, BrainCircuit, Zap, ArrowLeft
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('usuario');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Crear partículas para el fondo
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 5
    }));
    setParticles(newParticles);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación básica
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, ingresa un email válido.');
      setIsLoading(false);
      return;
    }

    // Simulación de llamada a API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 1. Verificar credenciales hardcodeadas (Admin demo)
      if (role === 'admin' && email === 'admin@senas.com' && password === 'admin123') {
        navigate('/admin');
        return;
      }

      // 2. Verificar credenciales de Usuarios (Backend simulado con LocalStorage)
      if (role === 'usuario') {
        // Usuario demo por defecto
        if (email === 'usuario@senas.com' && password === 'user123') {
          navigate('/dashboard');
          return;
        }

        // Verificar usuarios registrados
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const validUser = users.find(u => u.email === email && u.password === password && u.role === 'usuario');

        if (validUser) {
          navigate('/dashboard');
          return;
        }
      }

      setError('Credenciales incorrectas o el rol seleccionado no coincide.');
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const RoleCard = ({ type, icon: Icon, title, description, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full p-5 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 ${isSelected
        ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-2xl shadow-blue-500/25'
        : 'border-white/20 bg-white/5 hover:border-white/40'
        } backdrop-blur-xl flex flex-col items-start text-left`}
    >
      <div className={`p-3 rounded-xl mb-4 ${isSelected
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
        : 'bg-white/10 text-white/60'
        }`}>
        <Icon size={24} />
      </div>
      <div className="mb-2">
        <span className={`text-base font-bold block ${isSelected ? 'text-white' : 'text-white/80'
          }`}>
          {title}
        </span>
      </div>
      <p className="text-white/60 text-xs leading-relaxed">{description}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Fondo animado con partículas */}
      <div className="absolute inset-0 z-0">
        {/* Gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/50 to-purple-900/50 animate-gradient-x"></div>

        {/* Partículas flotantes */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.id * 0.5}s`
            }}
          />
        ))}

        {/* Formas geométricas */}
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

        {/* Efecto de grid sutil */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Card de login mejorado */}
      <div className="relative z-10 w-full max-w-lg mx-4 my-8">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
          {/* Botón de Regresar dentro del modal */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white transition-all duration-300 group"
            title="Regresar al inicio"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/20 transition-all duration-300">
              <ArrowLeft size={18} />
            </div>
          </button>

          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-white/10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-75"></div>
                <GraduationCap size={40} className="text-white relative z-10" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Instituto Señas IA
              </span>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-2">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-white/80 text-sm font-semibold">Plataforma con IA</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Bienvenido de Vuelta</h2>
              <p className="text-white/60">Ingresa a tu cuenta para continuar aprendiendo</p>
            </div>
          </div>

          {/* Selector de rol */}
          <div className="p-8">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <RoleCard
                type="usuario"
                icon={User}
                title="Usuario"
                description="Accede a tus módulos y continúa aprendiendo"
                isSelected={role === 'usuario'}
                onClick={() => setRole('usuario')}
              />
              <RoleCard
                type="admin"
                icon={ShieldCheck}
                title="Administrador"
                description="Gestiona contenidos y configuración del sistema"
                isSelected={role === 'admin'}
                onClick={() => setRole('admin')}
              />
            </div>

            {/* Formulario */}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-white/40" />
                  </div>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={20} className="text-white/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-12 py-4 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-white/40 hover:text-white/60 transition-colors" />
                    ) : (
                      <Eye size={20} className="text-white/40 hover:text-white/60 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <Lock size={16} />
                    {error}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="flex items-center justify-center gap-3 relative z-10">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Ingresando...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>Ingresar al Sistema</span>
                      <ArrowRightCircle size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Links adicionales */}
            <div className="mt-6 text-center space-y-3">
              <div className="text-white/60 text-sm">
                ¿Olvidaste tu contraseña?{' '}
                <button className="text-blue-400 hover:text-blue-300 underline transition-colors">
                  Recupérala aquí
                </button>
              </div>
              <div className="text-white/60 text-sm">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  Regístrate gratis
                </button>
              </div>
            </div>
          </div>

          {/* Footer de la card mejorado */}
          <div className="bg-white/5 border-t border-white/10 p-6">
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-3 text-white/40 text-xs">
                <BrainCircuit size={14} />
                <span>Powered by Artificial Intelligence</span>
              </div>
              <p className="text-white/30 text-[10px] leading-tight">
                © 2024 Instituto de Lengua de Señas IA. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
          background-size: 200% 200%;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Login;