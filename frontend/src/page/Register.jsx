import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Lock, ArrowRightCircle, GraduationCap,
    Eye, EyeOff, Mail, Key, Sparkles, BrainCircuit, Zap, ArrowLeft,
    UserPlus, CheckCircle2, Phone, CreditCard
} from 'lucide-react';
import { authService } from '../api/authService';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        dni: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [particles, setParticles] = useState([]);

    const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

    useEffect(() => {
        // Check registration status from storage (synced by App.jsx) or default open
        try {
            const config = JSON.parse(localStorage.getItem('public_config'));
            if (config && config.public_registration === 'false') {
                setIsRegistrationOpen(false);
            }
        } catch (e) { }

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const { fullName, dni, phone, email, password, confirmPassword } = formData;

        // Validaciones
        if (!fullName || !dni || !phone || !email || !password || !confirmPassword) {
            setError('Por favor, completa todos los campos.');
            setIsLoading(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Por favor, ingresa un email válido.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setIsLoading(false);
            return;
        }

        try {
            // Llamada real al backend
            await authService.register({
                email: email,
                password: password,
                full_name: fullName,
                dni: dni,
                phone: phone
            });

            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Registration error:', err);
            const detail = err.response?.data?.detail;
            setError(detail || 'Ocurrió un error inesperado. Inténtalo de nuevo.');
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

            {/* Card de registro */}
            <div className="relative z-10 w-full max-w-lg mx-4 my-8">
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">

                    {/* Botón de Regresar */}
                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white transition-all duration-300 group"
                        title="Regresar al inicio"
                    >
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                            <ArrowLeft size={18} />
                        </div>
                    </button>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 pt-12 border-b border-white/10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <GraduationCap size={44} className="text-white" />
                            <span className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Instituto Señas IA
                            </span>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Formulario de Inscripción</h2>
                            <p className="text-white/60">Datos del estudiante</p>
                        </div>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 size={48} className="text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">¡Registro Exitoso!</h3>
                                <p className="text-white/60">Redirigiéndote al inicio de sesión...</p>
                            </div>
                        ) : !isRegistrationOpen ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                                    <Lock size={48} className="text-yellow-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Registro Cerrado</h3>
                                <p className="text-white/60 max-w-xs mx-auto">El registro de nuevos usuarios está temporalmente deshabilitado por el administrador.</p>
                                <button onClick={() => navigate('/login')} className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-colors">
                                    Volver al Inicio
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-4" onSubmit={handleRegister}>
                                {/* Nombre Completo */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={20} className="text-white/40" />
                                    </div>
                                    <input
                                        name="fullName"
                                        type="text"
                                        className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="Nombre completo"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* DNI y Teléfono en Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard size={20} className="text-white/40" />
                                        </div>
                                        <input
                                            name="dni"
                                            type="text"
                                            className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="DNI"
                                            value={formData.dni}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone size={20} className="text-white/40" />
                                        </div>
                                        <input
                                            name="phone"
                                            type="tel"
                                            className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="Teléfono"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={20} className="text-white/40" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="Correo electrónico"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key size={20} className="text-white/40" />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="Contraseña"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} className="text-white/40 hover:text-white transition-colors" />
                                        ) : (
                                            <Eye size={20} className="text-white/40 hover:text-white transition-colors" />
                                        )}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CheckCircle2 size={20} className="text-white/40" />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="Confirmar contraseña"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={20} className="text-white/40 hover:text-white transition-colors" />
                                        ) : (
                                            <Eye size={20} className="text-white/40 hover:text-white transition-colors" />
                                        )}
                                    </button>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                                        <Lock size={16} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden group mt-4"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    <div className="flex items-center justify-center gap-3 relative z-10">
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <UserPlus size={20} />
                                                <span>Completar Inscripción</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        )}

                        {!success && (
                            <div className="mt-6 text-center">
                                <p className="text-white/60 text-sm">
                                    ¿Ya tienes cuenta?{' '}
                                    <button onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300 underline transition-colors">
                                        Inicia sesión aquí
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 border-t border-white/10 p-6">
                        <div className="space-y-2 text-center">
                            <div className="flex items-center justify-center gap-3 text-white/40 text-xs text-center">
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
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
        </div>
    );
};

export default Register;
