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
    Trophy
} from 'lucide-react';

const DashboardHome = () => {
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

    // Datos simulados basados en el contexto del instituto
    const moduleStatusData = [
        { name: 'Activos', value: 12, color: '#10b981' },
        { name: 'Desactivados', value: 3, color: '#64748b' },
    ];

    const trainingProgressData = [
        { name: 'Vocales', capturado: 210, objetivo: 250 }, // 5 elementos * 50
        { name: 'Números', capturado: 420, objetivo: 500 }, // 10 elementos * 50
        { name: 'Abecedario', capturado: 1150, objetivo: 1350 }, // 27 elementos * 50
        { name: 'Saludos', capturado: 180, objetivo: 400 }, // 8 elementos * 50
        { name: 'Colores', capturado: 120, objetivo: 350 }, // 7 elementos * 50
    ];

    const modelAccuracyData = [
        { epoca: 'E1', precision: 65 },
        { epoca: 'E2', precision: 72 },
        { epoca: 'E3', precision: 78 },
        { epoca: 'E4', precision: 85 },
        { epoca: 'E5', precision: 89 },
        { epoca: 'E6', precision: 92 },
        { epoca: 'E7', precision: 94.8 },
    ];

    const stats = [
        {
            label: 'Imágenes Totales',
            value: '18,450',
            subValue: 'Meta: 50 por seña',
            icon: Camera,
            color: 'blue',
            trend: '+2.4k esta semana'
        },
        {
            label: 'Módulos Publicados',
            value: '12 / 15',
            subValue: '3 en borrador',
            icon: BookOpen,
            color: 'green',
            trend: '82% Activos'
        },
        {
            label: 'Usuarios Registrados',
            value: '842',
            subValue: 'Estudiantes activos',
            icon: Users,
            color: 'purple',
            trend: '+12 hoy'
        },
        {
            label: 'Precisión Promedio',
            value: '94.8%',
            subValue: 'Modelo v2.4',
            icon: Cpu,
            color: 'yellow',
            trend: 'Optimizado'
        }
    ];

    // Datos de logros / completados
    const completedActivities = [
        { id: 1, name: 'Ana García', module: 'Vocales', time: 'Hace 5 min', date: '24/12/2023' },
        { id: 2, name: 'María López', module: 'Números', time: 'Hace 25 min', date: '24/12/2023' },
        { id: 3, name: 'Jorge Castro', module: 'Vocales', time: 'Hace 2 horas', date: '24/12/2023' },
        { id: 4, name: 'Elena Méndez', module: 'Abecedario', time: 'Hace 4 horas', date: '24/12/2023' },
        { id: 5, name: 'Ricardo S.', module: 'Saludos', time: 'Hace 6 horas', date: '23/12/2023' },
        { id: 6, name: 'Sofía V.', module: 'Colores', time: 'Hace 8 horas', date: '23/12/2023' },
        { id: 7, name: 'Daniel P.', module: 'Vocales', time: 'Hace 1 día', date: '23/12/2023' },
        { id: 8, name: 'Marisol T.', module: 'Números', time: 'Hace 1 día', date: '23/12/2023' },
        { id: 9, name: 'Kevin B.', module: 'Abecedario', time: 'Hace 2 días', date: '22/12/2023' },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            green: 'bg-green-500/20 text-green-400 border-green-500/30',
            purple: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
            yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        };
        return colors[color];
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">

            {/* Modal de Progreso Completo */}
            {isProgressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        onClick={() => setIsProgressModalOpen(false)}
                    ></div>
                    <div className="bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-300 shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                            <div>
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Trophy className="text-yellow-400" />
                                    Historial de Módulos Completados
                                </h3>
                                <p className="text-white/40 text-sm mt-1">Registro histórico de todos los estudiantes aprobados.</p>
                            </div>
                            <button
                                onClick={() => setIsProgressModalOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="p-4 flex gap-4 bg-white/5">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar estudiante o módulo..."
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                            {completedActivities.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{user.name}</div>
                                            <div className="text-white/40 text-xs">Aprobó el módulo de <span className="text-blue-400 font-bold">{user.module}</span></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-400 text-[10px] font-black uppercase tracking-widest bg-green-400/10 px-2 py-0.5 rounded-lg mb-1 inline-block">Éxito</div>
                                        <div className="text-white/20 text-[10px] font-mono">{user.date} • {user.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-950/50 text-center">
                            <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Mostrando {completedActivities.length} registros recientes</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección de Bienvenida */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Panorama Académico</h2>
                    <p className="text-white/40 mt-1">Control de captura, entrenamiento y progreso de estudiantes.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-blink"></div>
                    <span className="text-white/80 text-sm font-medium uppercase tracking-wider">GPU Training Active</span>
                </div>
            </div>

            {/* Grid de Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:border-white/20 transition-all group cursor-default">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl border ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                                Live
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                            <p className="text-white/80 font-bold text-sm tracking-tight">{stat.label}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                <span className="text-white/40 text-[11px]">{stat.subValue}</span>
                                <span className="text-blue-400 text-[10px] font-bold uppercase tracking-tighter">{stat.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gráficas Principales */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Estado de Captura de Datos</h3>
                            <p className="text-white/40 text-sm italic">Progreso hacia el objetivo de 50 imágenes por seña</p>
                        </div>
                        <Activity className="text-blue-400 opacity-20" size={40} />
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trainingProgressData} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                />
                                <Bar dataKey="capturado" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="objetivo" fill="rgba(255,255,255,0.05)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 text-center">Gestión de Cursos</h3>
                    <p className="text-white/40 text-xs text-center mb-8 uppercase tracking-widest">Estado de Disponibilidad</p>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={moduleStatusData}
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={10}
                                        dataKey="value"
                                    >
                                        {moduleStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-white">15</span>
                                <span className="text-[10px] text-white/40 uppercase font-bold">Módulos</span>
                            </div>
                        </div>
                        <div className="w-full space-y-3 mt-6 text-white/80">
                            {moduleStatusData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Entrenamiento IA */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Curva de Precisión</h3>
                            <p className="text-white/40 text-sm">Éxito predictivo del modelo v2.4</p>
                        </div>
                        <div className="text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg text-xs font-bold border border-yellow-400/20 flex items-center gap-2">
                            <TrendingUp size={14} />
                            +2.1% Delta
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={modelAccuracyData}>
                                <defs>
                                    <linearGradient id="colorPrec" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="epoca" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Area type="monotone" dataKey="precision" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorPrec)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Actividad de Estudiantes - Logros */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Últimos Logros</h3>
                            <p className="text-white/40 text-xs mt-1 italic">Estudiantes que completaron módulos hoy</p>
                        </div>
                        <div className="p-2 bg-yellow-500/10 rounded-xl">
                            <Trophy className="text-yellow-400" size={24} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {completedActivities.slice(0, 4).map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm tracking-tight">{user.name}</h4>
                                        <p className="text-white/40 text-[11px]">
                                            <span className="text-green-400 font-bold">Completó</span> el módulo de <span className="text-blue-400 font-bold">{user.module}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white/20 text-[10px] flex items-center justify-end gap-1 font-medium">
                                        <Timer size={10} />
                                        {user.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsProgressModalOpen(true)}
                        className="w-full mt-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-all uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 active:scale-95"
                    >
                        Ver registro histórico de logros
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                .animate-blink { animation: blink 2s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
};

export default DashboardHome;
