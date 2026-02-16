import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ShieldCheck, Lock, ArrowRightCircle, GraduationCap,
  Eye, EyeOff, Mail, Key, Sparkles, BrainCircuit, Zap, ArrowLeft,
  Hammer, Clock, X
} from 'lucide-react';
import { authService } from '../api/authService';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('usuario');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

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

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempTokenData, setTempTokenData] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Obtener Token
      const loginData = await authService.loginNoSave(email, password);
      const tempToken = loginData.access_token;

      // 2. Obtener Perfil
      const userData = await authService.getMeWithToken(tempToken);

      // Helper para validar si es administrador real
      const checkIsAdmin = (u) => {
        const r = u?.role?.toLowerCase();
        return r === 'admin' || r === 'super_admin' || r === 'superadmin';
      };

      const isAdminUser = checkIsAdmin(userData);

      // --- RESTRICCIÓN DE ACCESO SEGÚN ROL SELECCIONADO ---

      // 1. Si eligió ADMINISTRADOR pero es un usuario normal -> BLOQUEAR
      if (role === 'admin' && !isAdminUser) {
        setError(`Acceso denegado. La cuenta ${email} no tiene privilegios administrativos.`);
        setIsLoading(false);
        return;
      }

      // Check Maintenance
      const config = JSON.parse(localStorage.getItem('public_config') || '{}');
      const isMaint = String(config.maintenance_mode).toLowerCase() === 'true';

      if (isMaint && !isAdminUser) {
        setShowMaintenanceModal(true);
        setIsLoading(false);
        return;
      }

      // --- LOGICA DE SEGURIDAD ---

      // A. Check Password Rotation
      if (loginData.password_change_required) {
        localStorage.setItem('token', tempToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        navigate('/change-password?reason=expired');
        return;
      }

      // B. Check 2FA
      if (userData.is_2fa_enabled) {
        setTempTokenData({ token: tempToken, user: userData, selectedRole: role });
        setShow2FAModal(true);
        setIsLoading(false);
        return;
      }

      // 3. Login Exitoso - Guardar sesión
      localStorage.setItem('token', tempToken);
      localStorage.setItem('userData', JSON.stringify(userData));

      // Notificar a la App para disparar Prefetch de datos pesados inmediatamente
      window.dispatchEvent(new Event('login-success'));

      // Redirección inteligente: 
      // Si eligió admin y lo es -> /admin
      // Si eligió usuario (siendo admin o no) -> /dashboard
      if (role === 'admin' && isAdminUser) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail;
      setError(detail || 'Credenciales incorrectas o error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = (e) => {
    e.preventDefault();
    // Simulación funcional de 2FA
    if (twoFACode === '123456') { // Código de demo
      localStorage.setItem('token', tempTokenData.token);
      localStorage.setItem('userData', JSON.stringify(tempTokenData.user));

      // Aplicar misma lógica de redirección que en el login normal
      const isAdminUser = tempTokenData.user.role === 'admin' || tempTokenData.user.role === 'super_admin' || tempTokenData.user.role === 'superadmin';

      if (tempTokenData.selectedRole === 'admin' && isAdminUser) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError("Código 2FA incorrecto. Prueba con 123456");
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden font-sans selection:bg-blue-500/30 text-white">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse duration-[5s]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '35px 35px' }}></div>
      </div>

      {/* Partículas flotantes sutiles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-float blur-[1px]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.id * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4 my-8">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white transition-all duration-300 group"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/20 transition-all duration-300">
              <ArrowLeft size={18} />
            </div>
          </button>

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

            <div className="mt-6 text-center space-y-3">
              <div className="text-white/60 text-sm">
                ¿Olvidaste tu contraseña?{' '}
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                >
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowMaintenanceModal(false)}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowMaintenanceModal(false)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mb-6 relative">
                <Hammer size={40} className="text-blue-500 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                  <Clock size={12} className="text-white" />
                </div>
              </div>

              <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Sistema en Mantenimiento
              </h3>

              <p className="text-white/60 leading-relaxed mb-8">
                Estamos realizando mejoras técnicas en el módulo de aprendizaje. Por favor, intenta ingresar más tarde.
              </p>

              <div className="w-full space-y-3">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Acceso Limitado</p>
                    <p className="text-[10px] text-white/40">Solo personal autorizado puede ingresar.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="mt-8 w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-blue-50 transition-all active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300" />
          <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-6">
                <ShieldCheck size={40} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Verificación en 2 Pasos</h3>
              <p className="text-white/40 text-sm mb-8">
                Ingresa el código de seguridad enviado a tu correo o app de autenticación.
              </p>

              <form onSubmit={verify2FA} className="w-full space-y-6">
                <div className="relative">
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={twoFACode}
                    onChange={e => setTwoFACode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em] text-blue-400 outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  Verificar Código
                </button>

                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="text-white/20 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Cancelar Inicio
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;