import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, ArrowRightCircle, CheckCircle2,
    GraduationCap, Zap, BrainCircuit, ShieldCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // Opcional si usas toaster, pero usaré feedback in-ui para consistencia

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [particles, setParticles] = useState([]);

    // Efecto de partículas idéntico al Login
    useEffect(() => {
        const newParticles = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 10 + 5
        }));
        setParticles(newParticles);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validación básica
        if (!email) {
            setError('Por favor, ingresa tu correo electrónico.');
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
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Aquí iría la lógica real de recuperación
            // Por ahora simulamos éxito siempre
            setIsSuccess(true);
        } catch (err) {
            setError('Ocurrió un error al intentar enviar el correo. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

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

            {/* --- CARD PRINCIPAL --- */}
            <div className="relative z-10 w-full max-w-lg mx-4">
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative transition-all duration-500">

                    {/* Botón Regresar */}
                    <button
                        onClick={() => navigate('/login')}
                        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white transition-all duration-300 group"
                    >
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                            <ArrowLeft size={18} />
                        </div>
                    </button>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 pt-12 border-b border-white/10 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 relative group">
                            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                            <ShieldCheck size={40} className="text-white relative z-10" />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">Recuperar Acceso</h2>
                        <p className="text-white/60 text-sm max-w-sm mx-auto">
                            Te ayudaremos a restablecer tu contraseña de forma segura. Ingresa tu correo asociado.
                        </p>
                    </div>

                    <div className="p-8">
                        {!isSuccess ? (
                            /* --- FORMULARIO --- */
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Correo Electrónico</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail size={20} className="text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
                                            placeholder="ejemplo@instituto.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={20} className="text-red-400 shrink-0" />
                                        <span className="text-red-300 text-sm">{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    <div className="flex items-center justify-center gap-2 relative z-10">
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Enviando enlace...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Enviar Instrucciones</span>
                                                <ArrowRightCircle size={18} />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        ) : (
                            /* --- ESTADO DE ÉXITO --- */
                            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/50 shadow-[0_0_30px_-10px_rgba(34,197,94,0.4)]">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">¡Correo enviado!</h3>
                                <p className="text-white/60 text-sm mb-8 leading-relaxed">
                                    Hemos enviado las instrucciones de recuperación a <span className="text-white font-medium">{email}</span>. Revisa tu bandeja de entrada (y spam).
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/5 hover:border-white/20"
                                    >
                                        Volver al Login
                                    </button>
                                    <button
                                        onClick={() => { setIsSuccess(false); setEmail(''); }}
                                        className="text-white/40 text-xs hover:text-white transition-colors"
                                    >
                                        Intentar con otro correo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-900/40 border-t border-white/5 p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-white/20 text-xs font-medium">
                            <BrainCircuit size={12} />
                            <span>Seguridad potenciada por IA</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
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
        .animate-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
        </div>
    );
};

export default ForgotPassword;
