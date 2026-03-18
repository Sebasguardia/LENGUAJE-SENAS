import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, ShieldCheck, AlertCircle, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authService } from '../api/authService';
import { toast } from 'react-hot-toast';

import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import OTPInput from '../components/auth/OTPInput';
import StepIndicator from '../components/auth/StepIndicator';
import PasswordStrength from '../components/auth/PasswordStrength';
import { getStrength } from '../components/auth/PasswordStrength';

const STEPS = ['Solicitud', 'Token', 'Nueva Clave'];

const STEP_META = {
  request: { title: 'Recuperar Acceso', subtitle: 'Identificación de Usuario Requerida', idx: 0 },
  verify: { title: 'Validar Token', subtitle: 'Confirmación de Protocolo de Seguridad', idx: 1 },
  reset: { title: 'Nueva Credencial', subtitle: 'Actualización de Seguridad en Curso', idx: 2 },
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const meta = STEP_META[step];

  // ── Step 1 ──
  const handleRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Ingresa una dirección válida.'); setIsLoading(false); return; }
    try {
      await authService.recoverPassword(email);
      toast.success('Token de seguridad enviado.');
      setStep('verify');
    } catch (err) { setError(err.response?.data?.detail || 'Fallo en la solicitud.'); }
    finally { setIsLoading(false); }
  };

  // ── Step 2 ──
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    if (code.length !== 6) { setError('El token debe tener 6 dígitos.'); setIsLoading(false); return; }
    try {
      await authService.verifyRecoveryCode(email, code);
      setStep('reset');
    } catch (err) { setError(err.response?.data?.detail || 'Token inválido o expirado.'); }
    finally { setIsLoading(false); }
  };

  // ── Step 3 ──
  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    if (password.length < 6) { setError('La clave requiere mínimo 6 caracteres.'); setIsLoading(false); return; }
    if (password !== confirmPassword) { setError('Las claves no coinciden.'); setIsLoading(false); return; }
    try {
      await authService.resetPasswordWithCode(email, code, password);
      setIsSuccess(true);
    } catch (err) { setError(err.response?.data?.detail || 'No se pudo actualizar la credencial.'); }
    finally { setIsLoading(false); }
  };

  return (
    <AuthLayout
      title={isSuccess ? 'Credencial Actualizada' : meta.title}
      subtitle={isSuccess ? 'Acceso Restaurado Exitosamente' : meta.subtitle}
      onBack={() => step === 'request' ? navigate('/login') : setStep('request')}
      sideContent={{
        title: 'Protección de Identidad Avanzada',
        description: 'Protocolos de encriptación de grado empresarial garantizan que solo usted pueda retomar el control de su cuenta.',
      }}
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

        {/* Step indicator */}
        {!isSuccess && <StepIndicator steps={STEPS} currentStep={meta.idx} />}

        {/* Error */}
        {error && (
          <div className="dark:bg-red-500/10 bg-red-50 border dark:border-red-500/20 border-red-200 rounded-2xl p-4 flex items-center gap-3 dark:text-red-400 text-red-600 text-[11px] font-black uppercase tracking-widest animate-shake">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── SUCCESS ── */}
        {isSuccess && (
          <div className="text-center py-6 space-y-10 animate-in zoom-in duration-700">
            <div className="relative inline-block mx-auto">
              <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full animate-pulse" />
              <div className="relative dark:bg-[#080c14] bg-white dark:border dark:border-green-500/20 border-green-200 rounded-[2.5rem] w-32 h-32 flex items-center justify-center shadow-2xl mx-auto group">
                <div className="absolute inset-0 bg-green-500/5 rounded-[2.5rem] scale-90 group-hover:scale-100 transition-transform duration-700" />
                <CheckCircle2 size={56} className="dark:text-green-400 text-green-600 relative z-10" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-4xl font-black dark:text-white text-slate-900 uppercase tracking-tighter leading-none">Acceso Restaurado</h3>
              <p className="dark:text-white/20 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] max-w-[280px] mx-auto leading-relaxed">
                Protocolos de seguridad actualizados exitosamente en todos los nodos.
              </p>
            </div>
            
            <div className="pt-4">
               <div className="rounded-2xl p-px dark:bg-white/[0.06] bg-slate-200 dark:bg-transparent dark:hover:bg-transparent hover:bg-slate-300 transition-all">
                  <button onClick={() => navigate('/login')} 
                    className="w-full h-14 bg-[#0a0f1a] text-white font-black rounded-[calc(1rem-1px)] uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 group/nav">
                    <span>Reingresar al Ecosistema</span>
                    <ArrowRight size={14} className="group-hover/nav:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* ── REQUEST ── */}
        {!isSuccess && step === 'request' && (
          <form onSubmit={handleRequest} className="space-y-6">
            <AuthInput label="Identificador Institucional" type="email" icon={Mail}
              placeholder="ejemplo@corporativo.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
            <SubmitButton loading={isLoading} label="Iniciar Protocolo" />
          </form>
        )}

        {/* ── VERIFY ── */}
        {!isSuccess && step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="dark:bg-white/[0.02] bg-slate-100 dark:border dark:border-white/[0.04] border border-slate-200 rounded-2xl p-6 text-center space-y-2 dark:bg-transparent dark:border-white/[0.04]">
              <p className="text-[8px] font-black dark:text-white/10 text-slate-400 uppercase tracking-[0.4em]">Token de seguridad enviado a</p>
              <p className="dark:text-blue-400 text-blue-600 font-black text-sm tracking-tight">{email}</p>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.3em] text-center">Configuración de Token (6 Dígitos)</p>
              <OTPInput value={code} onChange={setCode} />
            </div>
            <SubmitButton loading={isLoading} label="Verificar Identidad" disabled={code.length !== 6} />
          </form>
        )}

        {/* ── RESET ── */}
        {!isSuccess && step === 'reset' && (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="relative">
              <AuthInput label="Nueva Clave Maestra" type={showPwd ? 'text' : 'password'}
                icon={Lock} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-4 top-[2.4rem] p-1.5 dark:text-white/20 text-slate-400 dark:hover:text-white/60 hover:text-blue-600 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && <div className="px-1"><PasswordStrength password={password} /></div>}

            <div className="relative">
              <AuthInput label="Confirmación de Protocolo" type={showCPwd ? 'text' : 'password'}
                icon={ShieldCheck} placeholder="••••••••" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowCPwd(v => !v)}
                className="absolute right-4 top-[2.4rem] p-1.5 dark:text-white/20 text-slate-400 dark:hover:text-white/60 hover:text-blue-600 transition-colors">
                {showCPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="pt-2">
              <SubmitButton loading={isLoading} label="Actualizar Credenciales"
                disabled={getStrength(password).score < 50} />
            </div>
          </form>
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

const SubmitButton = ({ loading, label, disabled }) => (
  <div className="rounded-xl p-px bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 shadow-[0_4px_24px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_32px_rgba(59,130,246,0.35)] transition-all duration-500 group/btn active:scale-[0.985]">
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full h-12 rounded-[calc(0.75rem-1px)] text-white font-black text-[11px] uppercase tracking-[0.25em] disabled:opacity-50 relative overflow-hidden flex items-center justify-center gap-3"
      style={{ background: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
      <div className="relative z-10 flex items-center gap-3">
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <>{label} <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" /></>
        }
      </div>
    </button>
  </div>
);

export default ForgotPassword;