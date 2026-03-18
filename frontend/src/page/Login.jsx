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

  // ── Standard login ──────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

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
      setError(err.response?.data?.detail || 'Error de autenticación: Acceso denegado.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google SSO ──────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
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
    } catch {
      setError('Fallo en la validación externa de identidad.');
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

      {showMaint && <MaintenanceModal onClose={() => setShowMaint(false)} />}
      {show2FA && <TwoFAModal onConfirm={handle2FA} onCancel={() => setShow2FA(false)} />}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </AuthLayout>
  );
};

export default Login;