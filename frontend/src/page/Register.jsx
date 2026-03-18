import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../api/authService';
import { authStorage } from '../utils/authStorage';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';

import AuthLayout from '../components/auth/AuthLayout';
import StepIndicator from '../components/auth/StepIndicator';
import RegistrationForm from '../components/auth/RegistrationForm';
import VerificationForm from '../components/auth/VerificationForm';

const STEPS = ['Registro', 'Verificación', 'Acceso'];

const STEP_META = {
  register: { title: 'Crea tu Cuenta', subtitle: 'Iniciando Protocolo de Usuario', idx: 0 },
  verify: { title: 'Verificación', subtitle: 'Validación de Identidad Requerida', idx: 1 },
  success: { title: 'Éxito Total', subtitle: 'Perfil Institucional Activado', idx: 2 },
};



const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('register');
  const [formData, setFormData] = useState({ fullName: '', dni: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [regOpen, setRegOpen] = useState(true);
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        console.log("Google token:", tokenResponse);
        await authService.googleLogin(tokenResponse.access_token);
        
        const user = authStorage.getUser();
        window.dispatchEvent(new Event('login-success'));
        
        toast.success('Acceso concedido con Google.');
        navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
      } catch (err) {
        console.error("Google login error", err);
        setError('Error al vincular cuenta de Google.');
        toast.error('Error en la autenticación con Google.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Fallido');
      toast.error('El inicio de sesión con Google falló.');
    }
  });



  useEffect(() => {
    const cfg = JSON.parse(localStorage.getItem('public_config') || '{}');
    setRegOpen(cfg.public_registration === 'true' || cfg.public_registration === true);
  }, []);

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    const { fullName, dni, phone, email, password, confirmPassword } = formData;
    if (!fullName || !dni || !phone || !email || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios.'); setIsLoading(false); return;
    }
    if (password !== confirmPassword) { setError('Las claves no coinciden.'); setIsLoading(false); return; }
    if (password.length < 6) { setError('La clave debe tener al menos 6 caracteres.'); setIsLoading(false); return; }
    try {
      await authService.register({ email, password, full_name: fullName, dni, phone });
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error en el protocolo de registro.');
    } finally { setIsLoading(false); }
  };

  const handleVerify = async (code) => {
    setIsLoading(true); setError('');
    try {
      await authService.verifyRegistration(formData.email, code);
      setStep('success');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Token de verificación inválido.');
    } finally { setIsLoading(false); }
  };

  const handleResend = async () => {
    try {
      await authService.register({ email: formData.email, password: formData.password, full_name: formData.fullName, dni: formData.dni, phone: formData.phone });
      toast.success('Código reenviado. Revise su bandeja.');
    } catch { setError('Fallo en el reenvío de token.'); }
  };


  const meta = STEP_META[step];

  return (
    <AuthLayout
      title={meta.title}
      subtitle={meta.subtitle}
      onBack={() => step === 'verify' ? setStep('register') : navigate('/login')}
      sideContent={{
        title: 'Únete a la Élite de Comunicación IA',
        description: 'Regístrate para obtener acceso completo a nuestros módulos avanzados y herramientas de análisis biométrico de señas.',
      }}
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

        {/* Step indicator */}
        {step !== 'success' && (
          <StepIndicator steps={STEPS} currentStep={meta.idx} />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-[11px] font-black uppercase tracking-widest animate-shake">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── REGISTER ── */}
        {step === 'register' && (
          !regOpen ? (
            <div className="text-center py-10 space-y-6">
              <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                <Lock size={36} className="text-yellow-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black uppercase tracking-tight">Acceso Restringido</h4>
                <p className="text-white/30 text-sm font-medium">Las inscripciones están pausadas por mantenimiento.</p>
              </div>
              <button onClick={() => navigate('/login')} className="w-full py-4 bg-white/5 hover:bg-white/8 border border-white/8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                Volver al Portal
              </button>
            </div>
          ) : (
            <>
              <RegistrationForm
                formData={formData} errors={{}} isLoading={isLoading}
                showPassword={showPwd} setShowPassword={setShowPwd}
                showConfirmPassword={showCPwd} setShowConfirmPassword={setShowCPwd}
                handleChange={handleChange} handleSubmit={handleRegister}
              />

              {/* Google register */}
              <div className="relative flex items-center gap-4 pt-2">
                <div className="h-px flex-1 dark:bg-white/[0.05] bg-slate-200" />
                <span className="text-[9px] font-black dark:text-white/10 text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">O regístrate con</span>
                <div className="h-px flex-1 dark:bg-white/[0.05] bg-slate-200" />
              </div>

              <div className="group/google">
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="relative w-full h-[52px] rounded-2xl overflow-hidden border dark:border-white/[0.06] border-slate-200 dark:bg-white/[0.02] bg-white hover:dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:border-white/12 hover:border-slate-300 transition-all flex items-center justify-center cursor-pointer shadow-sm dark:shadow-none"
                >
                  <div className="relative z-10 flex items-center gap-3 pointer-events-none">
                    <GoogleIcon />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white/40 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white/70 transition-colors">
                      Registro con Google
                    </span>
                  </div>
                </button>
              </div>

              <p className="text-center dark:text-white/25 text-slate-400 text-[9px] uppercase tracking-widest font-black pt-2">
                ¿Ya tiene credenciales?{' '}
                <button type="button" onClick={() => navigate('/login')} className="dark:text-blue-400 text-blue-600 dark:hover:text-blue-300 hover:text-blue-700 underline underline-offset-4">
                  Iniciar Sesión
                </button>
              </p>
            </>
          )
        )}

        {/* ── VERIFY ── */}
        {step === 'verify' && (
          <VerificationForm
            email={formData.email}
            onVerify={handleVerify}
            onBack={() => setStep('register')}
            onResend={handleResend}
            isLoading={isLoading}
          />
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div className="text-center py-10 space-y-8 animate-in zoom-in duration-500">
            <div className="relative inline-block mx-auto">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative bg-[#05070a] border border-green-500/40 rounded-full w-24 h-24 flex items-center justify-center shadow-2xl">
                <CheckCircle2 size={50} className="text-green-400" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Acceso Otorgado</h3>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Identidad confirmada en los nodos locales.</p>
            </div>
            <div className="text-[10px] font-black text-blue-400 animate-pulse tracking-[0.3em] uppercase">
              Redirigiendo al terminal de acceso...
            </div>
          </div>
        )}
      </div>

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

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default Register;