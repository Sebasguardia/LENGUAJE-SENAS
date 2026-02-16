import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Users, BookOpen, Database, TrendingUp,
    Award, Camera, Cpu, Activity,
    CheckCircle2, AlertCircle, Timer, X, Search,
    Trophy, MousePointer2, Zap, Clock, ChevronRight, Server, HardDrive, LayoutGrid, CalendarDays
} from 'lucide-react';

import { adminService } from '../../api/adminService';
import { moduleService } from '../../api/moduleService';

const DashboardHome = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [moduleDistribution, setModuleDistribution] = useState([]);

    // Nuevas métricas funcionales reales
    const [topStudents, setTopStudents] = useState([]);
    const [weeklyProgress, setWeeklyProgress] = useState([]);

    const fetchDashboardData = async () => {
        const hasCache = localStorage.getItem('api_cache_/admin/stats/general');
        if (hasCache) {
            setIsLoading(false);
        }

        try {
            // OPTIMIZACIÓN: Lanzar todas las peticiones al mismo tiempo
            const fetchDist = adminService.getModuleDistribution();
            const fetchTop = adminService.getTopStudents();
            const fetchWeekly = adminService.getWeeklyProgress();
            const fetchGen = adminService.getGeneralStats();

            // 1. Distribución
            fetchDist.then(val => {
                setModuleDistribution(val.map(d => ({
                    name: d.label,
                    capturado: d.value,
                    objetivo: 250
                })));
            }).catch(() => { });

            // 2. Top Estudiantes
            fetchTop.then(val => setTopStudents(val)).catch(() => { });

            // 3. Progreso Semanal
            fetchWeekly.then(val => setWeeklyProgress(val)).catch(() => { });

            // 4. Estadísticas Generales
            fetchGen.then(genStats => {
                setStats([
                    {
                        label: 'Imágenes Totales',
                        value: genStats.total_captures.toLocaleString(),
                        subValue: `${genStats.captures_today || 0} capturadas hoy`,
                        icon: Camera,
                        color: 'blue',
                        trend: 'Dataset Real'
                    },
                    {
                        label: 'Módulos Publicados',
                        value: `${genStats.published_modules} / ${genStats.total_modules}`,
                        subValue: `${genStats.total_modules - genStats.published_modules} módulos en borrador`,
                        icon: BookOpen,
                        color: 'green',
                        trend: 'En Vivo'
                    },
                    {
                        label: 'Usuarios Activos',
                        value: genStats.total_users,
                        subValue: 'Estudiantes en plataforma',
                        icon: Users,
                        color: 'purple',
                        trend: 'Crecimiento'
                    },
                    {
                        label: 'Precisión Motor IA',
                        value: `${genStats.avg_accuracy}%`,
                        subValue: 'Promedio global histórico',
                        icon: Cpu,
                        color: 'yellow',
                        trend: 'Optimizado'
                    }
                ]);
            }).catch(() => { });

            // Si no hay cache, esperamos a las críticas para quitar el loader
            if (!hasCache) {
                setIsLoading(true);
                await Promise.allSettled([fetchGen, fetchDist]);
            }

        } catch (error) {
            console.error("Error cargando dashboard admin:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const handleCacheUpdate = (e) => {
            if (e.detail.url.includes('/admin/')) {
                fetchDashboardData();
            }
        };
        window.addEventListener('api-cache-updated', handleCacheUpdate);
        return () => window.removeEventListener('api-cache-updated', handleCacheUpdate);
    }, []);

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            green: 'bg-green-500/20 text-green-400 border-green-500/30',
            purple: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
            yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        };
        return colors[color];
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/40 animate-pulse font-medium tracking-tight">Sincronizando métricas de red neuronal...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12">

            {/* Header de Bienvenida */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                        <Activity className="text-white" size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Panel Maestro IA</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Sincronizado • Tiempo Real</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                    <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-center">
                        <span className="block text-2xl font-black text-white leading-none mb-1">94%</span>
                        <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Salud Sistema</span>
                    </div>
                    <div className="bg-blue-500 px-6 py-4 rounded-2xl text-center shadow-lg shadow-blue-500/20">
                        <span className="block text-2xl font-black text-white leading-none mb-1">∞</span>
                        <span className="text-[10px] text-white/80 uppercase font-black tracking-widest">Uptime IA</span>
                    </div>
                </div>
            </div>

            {/* Grid de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-white/20 hover:bg-slate-900/60 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl border ${getColorClasses(stat.color)} group-hover:scale-105 transition-transform shadow-inner`}>
                                    <stat.icon size={24} />
                                </div>
                                <Activity size={16} className={`${stat.color === 'green' ? 'text-green-400' : 'text-blue-400'} opacity-30`} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                                <p className="text-white/80 font-bold text-sm tracking-tight">{stat.label}</p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                    <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">{stat.subValue}</span>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp size={10} className="text-blue-400" />
                                        <span className="text-blue-400 text-[10px] font-black uppercase">{stat.trend}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. CHART DE BARRAS: Dataset por Módulo (Mantiene) */}
                <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-8 sm:p-10 border border-white/10 shadow-2xl overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Densidad del Dataset por Módulo</h3>
                            <p className="text-white/40 text-sm font-medium mt-1">Muestras acumuladas para el entrenamiento neuronal</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <Cpu className="text-blue-400" size={24} />
                        </div>
                    </div>

                    {!isLoading && moduleDistribution.length > 0 && (
                        <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={moduleDistribution} margin={{ left: -10, right: 10 }}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="rgba(255,255,255,0.2)"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontWeight: 700 }}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.2)"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.5)' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                        itemStyle={{ color: '#fff', fontWeight: 800 }}
                                    />
                                    <Bar dataKey="capturado" fill="url(#barGradient)" radius={[10, 10, 4, 4]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* 2. TOP ESTUDIANTES (Nuevo Requerimiento - Reemplaza Radar) */}
                <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white/10 shadow-2xl flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white tracking-tight">Líderes de Aprendizaje</h3>
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                            <Trophy className="text-purple-400" size={20} />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        {topStudents.length > 0 ? topStudents.map((user, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-600'} shadow-lg`}>
                                    {user.avatar || user.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm truncate">{user.name}</p>
                                    <p className="text-white/40 text-[10px] font-bold uppercase">Nivel {user.level}</p>
                                </div>
                                <div className="text-purple-400 font-black text-sm">{user.xp} XP</div>
                            </div>
                        )) : (
                            <div className="text-center text-white/40 text-sm py-10">Esperando datos de estudiantes...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. CHART DE PROGRESO SEMANAL (Nuevo Requerimiento - Reemplaza Infraestructura) */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <CalendarDays className="text-emerald-400" size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Actividad de Práctica Semanal</h3>
                        </div>
                        <p className="text-white/40 text-sm font-medium">Volumen de sesiones de práctica realizadas en los últimos 7 días</p>
                    </div>
                    <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                        <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">+ Live Data</span>
                    </div>
                </div>

                {!isLoading && weeklyProgress.length > 0 && (
                    <div className="h-[250px] w-full" style={{ minHeight: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyProgress} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#064e3b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    labelStyle={{ color: '#a7f3d0' }}
                                />
                                <Area type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                .animate-blink { animation: blink 2s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default DashboardHome;

