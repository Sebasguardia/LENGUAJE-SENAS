import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Key, ShieldCheck, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authService } from '../api/authService';
import { authStorage } from '../utils/authStorage';
import { toast } from 'react-hot-toast';

import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import { getStrength } from '../components/auth/PasswordStrength';

const PasswordChange = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const isExpired = params.get('reason') === 'expired';

    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confPwd, setConfPwd] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { score } = getStrength(newPwd);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPwd !== confPwd) { toast.error('Las contraseñas no coinciden.'); return; }
        if (score < 50) { toast.error('La contraseña es demasiado débil.'); return; }

        setIsLoading(true);
        try {
            await authService.changePassword({ old_password: oldPwd, new_password: newPwd });
            toast.success('Contraseña actualizada con éxito.');
            const user = authStorage.getUser() || {};
            navigate(['admin', 'super_admin'].includes(user.role) ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al cambiar la contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Cambiar Contraseña"
            subtitle={isExpired ? 'Credencial Expirada — Renovación Obligatoria' : 'Actualización de Seguridad de Cuenta'}
            onBack={() => navigate(-1)}
            sideContent={{
                title: 'Seguridad de Cuenta Avanzada',
                description: isExpired
                    ? 'Tu contraseña ha expirado. Por seguridad, establece una nueva credencial para continuar accediendo a la plataforma.'
                    : 'Actualiza tu contraseña regularmente para mantener el máximo nivel de protección sobre tu cuenta y datos.',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Expired banner */}
                {isExpired && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3 text-yellow-400 text-[11px] font-black uppercase tracking-widest">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        Credencial expirada — renovación requerida
                    </div>
                )}

                {/* Current password */}
                <fieldset className="space-y-4">
                    <legend className="text-[8px] font-black text-white/15 uppercase tracking-[0.4em] flex items-center gap-3">
                        <span>Credencial Actual</span>
                        <div className="h-px flex-1 bg-white/[0.05]" />
                    </legend>
                    <div className="relative">
                        <AuthInput
                            label="Contraseña Actual"
                            type={showOld ? 'text' : 'password'}
                            icon={Lock}
                            placeholder="••••••••"
                            value={oldPwd}
                            onChange={e => setOldPwd(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowOld(v => !v)}
                            className="absolute right-4 top-[2.4rem] p-1.5 text-white/20 hover:text-white/60 transition-colors">
                            {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </fieldset>

                {/* New password */}
                <fieldset className="space-y-4">
                    <legend className="text-[8px] font-black text-white/15 uppercase tracking-[0.4em] flex items-center gap-3">
                        <span>Nueva Credencial</span>
                        <div className="h-px flex-1 bg-white/[0.05]" />
                    </legend>

                    <div className="space-y-3">
                        <div className="relative">
                            <AuthInput
                                label="Nueva Contraseña"
                                type={showNew ? 'text' : 'password'}
                                icon={Key}
                                placeholder="Mín. 8 caracteres"
                                value={newPwd}
                                onChange={e => setNewPwd(e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowNew(v => !v)}
                                className="absolute right-4 top-[2.4rem] p-1.5 text-white/20 hover:text-white/60 transition-colors">
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {newPwd && <div className="px-1"><PasswordStrength password={newPwd} /></div>}
                    </div>

                    <div className="relative">
                        <AuthInput
                            label="Confirmar Nueva Contraseña"
                            type={showConf ? 'text' : 'password'}
                            icon={ShieldCheck}
                            placeholder="••••••••"
                            value={confPwd}
                            onChange={e => setConfPwd(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowConf(v => !v)}
                            className="absolute right-4 top-[2.4rem] p-1.5 text-white/20 hover:text-white/60 transition-colors">
                            {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </fieldset>

                {/* Submit */}
                <div className="pt-4">
                  <div className="rounded-xl p-px bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 shadow-[0_4px_24px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_32px_rgba(59,130,246,0.35)] transition-all duration-500 group/btn active:scale-[0.985]">
                    <button
                        type="submit"
                        disabled={isLoading || score < 50}
                        className="w-full h-12 rounded-[calc(0.75rem-1px)] text-white font-black text-[11px] uppercase tracking-[0.25em] disabled:opacity-50 relative overflow-hidden flex items-center justify-center gap-3"
                        style={{ background: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <div className="relative z-10 flex items-center gap-3">
                            {isLoading
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <>
                                    <span>Ejecutar Actualización</span>
                                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            }
                        </div>
                    </button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-3 text-white/20 text-[9px] leading-relaxed font-medium pt-2">
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    <p>La nueva contraseña debe diferir de las últimas utilizadas. Todas las sesiones activas serán cerradas al actualizar.</p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default PasswordChange;