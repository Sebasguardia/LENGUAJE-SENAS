import React from 'react';
import { Settings, ShieldAlert, Clock, RefreshCw, Hammer, Zap } from 'lucide-react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Background Animations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl px-6 text-center">
                {/* Orbital Gear Animation */}
                <div className="relative mb-16 inline-block">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="relative p-10 bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
                        <Settings className="text-blue-500 animate-[spin_8s_linear_infinite]" size={80} />
                        <div className="absolute -top-2 -right-2 bg-amber-500 p-3 rounded-2xl shadow-lg animate-bounce">
                            <Hammer className="text-slate-950" size={24} />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md mb-4">
                        <ShieldAlert className="text-amber-500" size={18} />
                        <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.3em]">Protocolo de Mantenimiento Activo</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none">
                        SISTEMA EN <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">OPTIMIZACIÓN</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">
                        Estamos inyectando nuevos modelos de procesamiento neuronal y ajustando los núcleos persistentes del sistema. Volveremos a estar en línea en unos minutos.
                    </p>
                </div>

                {/* Navigation Actions */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        Regresar al Inicio
                    </button>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <ShieldAlert size={18} />
                        Acceso Administrativo
                    </button>
                </div>

                {/* Progress Indicators */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                <Clock size={20} />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Tiempo Estimado</span>
                        </div>
                        <div className="text-2xl font-black text-white tracking-tight">15 MINUTOS</div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                                <Zap size={20} />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Estado Núcleo</span>
                        </div>
                        <div className="text-2xl font-black text-white tracking-tight">DEEP LEARNING</div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] group hover:border-purple-500/30 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                                <RefreshCw size={20} className="animate-spin" />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sincronización</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-2">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full w-[85%] animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-20 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-30">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Cluster v.4.0.2</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white">© 2026 LENGUAJE SEÑAS IA • DATA CENTER MOD</div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 8s ease infinite;
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default MaintenancePage;
