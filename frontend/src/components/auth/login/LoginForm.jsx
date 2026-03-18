import React from 'react';
import { Lock, ArrowRight, Eye, EyeOff, Mail, Key, AlertCircle, ShieldCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import AuthInput from '../AuthInput';

const GoogleIcon = () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const LoginForm = ({
    email, setEmail, password, setPassword,
    rememberMe, setRememberMe, showPassword, setShowPassword,
    error, isLoading,
    onSubmit, onForgot, onRegister, onGoogleSuccess, onGoogleError,
}) => {
    const loginWithGoogle = useGoogleLogin({
        onSuccess: tokenResponse => onGoogleSuccess(tokenResponse),
        onError: error => onGoogleError(error),
    });

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2.5">
                <AuthInput label="Identificador Institucional" type="email" icon={Mail}
                    placeholder="usuario@corporativo.com" value={email}
                    onChange={e => setEmail(e.target.value)} autoComplete="email" required />

                <div className="relative">
                    <AuthInput label="Clave de Seguridad" type={showPassword ? 'text' : 'password'}
                        icon={Key} placeholder="••••••••" value={password}
                        onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-[2.3rem] p-1 dark:text-white/15 text-slate-400 dark:hover:text-white/50 hover:text-blue-600 transition-colors">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-3.5 py-2.5 animate-shake">
                    <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative w-4 h-4 flex-shrink-0">
                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                            className="peer absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="absolute inset-0 rounded-md dark:bg-white/[0.04] dark:border-white/10 bg-slate-100 border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-all dark:bg-transparent" />
                        <ShieldCheck size={9} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[9px] font-black dark:text-white/25 text-slate-500 uppercase tracking-widest">Mantener sesión</span>
                </label>
                <button type="button" onClick={onForgot}
                    className="text-[9px] font-black dark:text-blue-400/70 text-blue-600 uppercase tracking-widest dark:hover:text-blue-400 hover:text-blue-700 transition-colors">
                    ¿Olvidó su clave?
                </button>
            </div>

            {/* CTA */}
            <div className="pt-2">
                <div className="rounded-xl p-px bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 shadow-[0_4px_24px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_32px_rgba(59,130,246,0.35)] transition-all duration-500 group/btn active:scale-[0.985]">
                    <button type="submit" disabled={isLoading}
                        className="w-full h-12 rounded-[calc(0.75rem-1px)] text-white font-black text-[11px] uppercase tracking-[0.25em] disabled:opacity-50 relative overflow-hidden flex items-center justify-center gap-3"
                        style={{ background: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <div className="relative z-10 flex items-center gap-3">
                            {isLoading
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><Lock size={13} className="group-hover/btn:scale-110 transition-transform" /><span>Acceso Seguro</span><ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" /></>
                            }
                        </div>
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px dark:bg-white/[0.04] bg-slate-200" />
                <span className="text-[7.5px] sm:text-[8px] font-black dark:text-white/10 text-slate-400 uppercase tracking-[0.5em]">Nexo de Identidad</span>
                <div className="flex-1 h-px dark:bg-white/[0.04] bg-slate-200" />
            </div>

            {/* Google Enterprise Button */}
            <div className="group/g relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/0 group-hover/g:bg-blue-500/5 blur-xl transition-all duration-500 rounded-xl" />
                <div className="relative rounded-xl p-px dark:bg-white/[0.04] bg-slate-200 dark:hover:bg-white/[0.12] hover:bg-slate-300 transition-colors">
                    <button
                        type="button"
                        onClick={() => loginWithGoogle()}
                        className="relative w-full h-11 rounded-[calc(0.75rem-1px)] dark:bg-[#080c14] bg-white flex items-center justify-center transition-transform group-active/g:scale-[0.99] shadow-sm dark:shadow-none"
                    >
                        <div className="relative z-10 flex items-center gap-3 pointer-events-none">
                            <GoogleIcon />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] dark:text-white/30 text-slate-500 dark:group-hover/g:text-white/60 group-hover/g:text-slate-800 transition-all">Acceso con Google</span>
                        </div>
                    </button>
                </div>
            </div>

            <p className="text-center dark:text-white/18 text-slate-400 text-[9px] uppercase tracking-widest font-black">
                ¿No posee cuenta?{' '}
                <button type="button" onClick={onRegister} className="dark:text-blue-400/70 text-blue-600 dark:hover:text-blue-400 hover:text-blue-700 transition-colors underline underline-offset-2">
                    Solicitar registro
                </button>
            </p>
        </form>
    );
};

export default LoginForm;
