import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Lock, Key, ShieldCheck, ArrowRight, Eye, EyeOff,
    AlertCircle, CheckCircle2, Shield, TrendingUp,
    Check, X, Sparkles
} from 'lucide-react';
import { authService } from '../api/authService';
import { toast } from 'react-hot-toast';

const PasswordChange = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [strength, setStrength] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState('Muy Débil');

    // Check if we are here because of expiration (passed via query param perhaps)
    const reason = searchParams.get('reason');

    const calculateStrength = (pass) => {
        let s = 0;
        if (pass.length >= 8) s += 25;
        if (/[A-Z]/.test(pass)) s += 25;
        if (/[0-9]/.test(pass)) s += 25;
        if (/[^A-Za-z0-9]/.test(pass)) s += 25;

        setStrength(s);
        if (s <= 25) setStrengthLabel('Débil');
        else if (s <= 50) setStrengthLabel('Regular');
        else if (s <= 75) setStrengthLabel('Fuerte');
        else setStrengthLabel('Muy Segura');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'new_password') calculateStrength(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.new_password !== formData.confirm_password) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        if (strength < 50) {
            toast.error("La contraseña es demasiado débil");
            return;
        }

        setIsLoading(true);
        try {
            await authService.changePassword({
                old_password: formData.old_password,
                new_password: formData.new_password
            });
            toast.success("¡Contraseña actualizada con éxito!");

            // Redirect based on role or back to where they were
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData.role === 'admin' || userData.role === 'super_admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error(error);
            const detail = error.response?.data?.detail || "Error al cambiar la contraseña";
            toast.error(detail);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Background Ambient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-white/10 text-center">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white">Seguridad de la Cuenta</h2>
                        <p className="text-white/40 text-sm mt-1">
                            {reason === 'expired' ? 'Tu contraseña ha expirado. Por favor, renuévala.' : 'Actualiza tu contraseña para mayor seguridad.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-4">
                            {/* Old Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-1">Contraseña Actual</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        required
                                        type={showOld ? "text" : "password"}
                                        name="old_password"
                                        value={formData.old_password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOld(!showOld)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                                        <Key size={18} />
                                    </div>
                                    <input
                                        required
                                        type={showNew ? "text" : "password"}
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors"
                                        placeholder="Min. 8 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Strength Meter */}
                                <div className="px-1 pt-2 space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-white/20">Nivel de Seguridad</span>
                                        <span className={`${strength <= 25 ? 'text-red-400' :
                                                strength <= 50 ? 'text-yellow-400' :
                                                    strength <= 75 ? 'text-blue-400' : 'text-green-400'
                                            }`}>
                                            {strengthLabel}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                                        <div className={`h-full transition-all duration-500 ${strength > 0 ? (strength <= 25 ? 'bg-red-500' : strength <= 50 ? 'bg-yellow-500' : strength <= 75 ? 'bg-blue-500' : 'bg-green-500') : 'bg-transparent'}`} style={{ width: `${strength}%` }}></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                                        <Requirement met={formData.new_password.length >= 8} label="8+ caracteres" />
                                        <Requirement met={/[A-Z]/.test(formData.new_password)} label="Mayúscula" />
                                        <Requirement met={/[0-9]/.test(formData.new_password)} label="Número" />
                                        <Requirement met={/[^A-Za-z0-9]/.test(formData.new_password)} label="Símbolo" />
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                                        <Shield size={18} />
                                    </div>
                                    <input
                                        required
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors"
                                        placeholder="Repite la contraseña"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || strength < 50}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Actualizar Contraseña</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="bg-white/5 p-6 border-t border-white/10">
                        <div className="flex items-start gap-3 text-white/40 text-[10px] leading-relaxed">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <p>Tu nueva contraseña debe ser diferente a las últimas utilizadas. Una vez actualizada, se cerrará cualquier otra sesión activa.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Requirement = ({ met, label }) => (
    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${met ? 'text-green-400' : 'text-white/20'}`}>
        {met ? <CheckCircle2 size={10} /> : <X size={10} />}
        <span>{label}</span>
    </div>
);

export default PasswordChange;
