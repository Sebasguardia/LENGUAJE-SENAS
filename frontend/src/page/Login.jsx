import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { authStorage } from '../utils/authStorage';
import { toast } from 'react-hot-toast';

import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/login/LoginForm';
import TwoFAModal from '../components/auth/login/TwoFAModal';
import MaintenanceModal from '../components/auth/login/MaintenanceModal';

const isAdmin = (u) => ['admin', 'super_admin', 'superadmin'].includes(u?.role?.toLowerCase());

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMaint, setShowMaint] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  
  // -- Estado para Modo Demo
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  // ── Standard login ──────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowDemoOptions(false);

    // Limpiar estado residual de Demo si el usuario intenta hacer un login real
    const currentUser = authStorage.getUser();
    if (currentUser?.is_demo) {
      authStorage.clearAuth();
    }

    if (!email || !password) {
      setError('Credenciales corporativas incompletas.');
      setIsLoading(false);
      return;
    }

    try {
      const loginData = await authService.login(email, password, rememberMe);
      
      if (loginData.welcome_back) {
        sessionStorage.setItem('show_welcome_back', 'true');
        sessionStorage.setItem('days_inactive', loginData.days_inactive || 0);
      }

      const user = authStorage.getUser();
      const config = JSON.parse(localStorage.getItem('public_config') || '{}');
      const isMaint = String(config.maintenance_mode).toLowerCase() === 'true';

      if (isMaint && !isAdmin(user)) { setShowMaint(true); setIsLoading(false); return; }
      if (loginData.password_change_required) { navigate('/change-password?reason=expired'); return; }
      if (user.is_2fa_enabled) {
        setTempToken({ token: authStorage.getToken(), user });
        setShow2FA(true);
        setIsLoading(false);
        return;
      }

      window.dispatchEvent(new Event('login-success'));
      navigate(isAdmin(user) ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error de conexión: El servidor no responde.');
      // Si no hay respuesta o es un error 5xx, asumimos que el servidor de Supabase/Render está inactivo
      if (!err.response || err.response.status >= 500 || err.message === 'Network Error') {
        setShowDemoOptions(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Demo Login ──────────────────────────────────────────────
  const handleDemoLogin = (role) => {
    const fakeToken = `demo-token-${role}-${Date.now()}`;
    const fakeUser = {
      id: `demo-${role}`,
      full_name: role === 'admin' ? 'Demo Administrador' : 'Demo Estudiante',
      email: role === 'admin' ? 'admin@demo.com' : 'estudiante@demo.com',
      role: role === 'admin' ? 'super_admin' : 'user',
      is_demo: true,
      status: 'active'
    };
    
    authStorage.saveAuth(fakeToken, fakeUser, true);
    window.dispatchEvent(new Event('login-success'));
    navigate(role === 'admin' ? '/admin' : '/dashboard');
    toast.success(`Entrando en Modo Demo (${role})`, { icon: '🎮' });
  };

  // ── Google SSO ──────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
    setShowDemoOptions(false);
    
    // Limpiar estado residual de Demo
    const currentUser = authStorage.getUser();
    if (currentUser?.is_demo) {
      authStorage.clearAuth();
    }

    try {
      // useGoogleLogin provides an access_token by default (Implicit Flow)
      const loginData = await authService.googleLogin(tokenResponse.access_token, rememberMe);
      
      if (loginData.welcome_back) {
        sessionStorage.setItem('show_welcome_back', 'true');
        sessionStorage.setItem('days_inactive', loginData.days_inactive || 0);
      }

      const user = authStorage.getUser();
      window.dispatchEvent(new Event('login-success'));
      navigate(isAdmin(user) ? '/admin' : '/dashboard');
      toast.success('Acceso validado con Google.');
    } catch (err) {
      setError('Fallo en la validación externa de identidad.');
      if (!err.response || err.response.status >= 500 || err.message === 'Network Error') {
        setShowDemoOptions(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── 2FA confirm ─────────────────────────────────────────────
  const handle2FA = (code) => {
    if (code === '123456') {
      authStorage.saveAuth(tempToken.token, tempToken.user, rememberMe);
      window.dispatchEvent(new Event('login-success'));
      navigate(isAdmin(tempToken.user) ? '/admin' : '/dashboard');
    } else {
      toast.error('Protocolo 2FA fallido. Verifique su token.');
    }
  };

  return (
    <AuthLayout
      title="Acceso al Portal"
      subtitle="Autenticación Maestra del Sistema"
      onBack={() => navigate('/')}
      sideContent={{
        title: 'Domine el Lenguaje de Señas con IA',
        description: 'Inicie sesión para acceder a su panel personalizado y continuar su formación con nuestro tutor de inteligencia artificial en tiempo real.',
      }}
    >
      <LoginForm
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        rememberMe={rememberMe} setRememberMe={setRememberMe}
        showPassword={showPwd} setShowPassword={setShowPwd}
        error={error}
        isLoading={isLoading}
        onSubmit={handleLogin}
        onForgot={() => navigate('/forgot-password')}
        onRegister={() => navigate('/register')}
        onGoogleSuccess={handleGoogleSuccess}
        onGoogleError={() => setError('Google Login fallido')}
      />

      {showDemoOptions && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center backdrop-blur-sm animate-fade-in">
          <p className="text-red-400 font-medium mb-3 text-sm">
            El servidor remoto está inactivo. ¿Deseas explorar en Modo Demo?
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 font-medium text-sm"
            >
              Ver Demo como Administrador
            </button>
            <button
              onClick={() => handleDemoLogin('user')}
              className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors border border-blue-500/30 font-medium text-sm"
            >
              Ver Demo como Estudiante
            </button>
          </div>
        </div>
      )}

      {showMaint && <MaintenanceModal onClose={() => setShowMaint(false)} />}
      {show2FA && <TwoFAModal onConfirm={handle2FA} onCancel={() => setShow2FA(false)} />}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </AuthLayout>
  );
};

export default Login;