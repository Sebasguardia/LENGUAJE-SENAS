import React, { useEffect, useState } from 'react';
import { X, Award, Target, Flame, Zap, Star, Trophy, Crown, Medal, BookOpen, Play, Crosshair, Book, Lock, ChevronRight } from 'lucide-react';
import { achievementService } from '../../api/achievementService';
import toast from 'react-hot-toast';

const AchievementsModal = ({ isOpen, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAchievements();
        }
    }, [isOpen]);

    const fetchAchievements = async () => {
        try {
            setIsLoading(true);
            const data = await achievementService.getUserAchievements();
            setCategories(data.categories || []);
            setStats(data.stats || null);
        } catch (err) {
            console.error("Error fetching achievements:", err);
            toast.error("No se pudieron cargar los logros");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const iconMap = {
        'book': BookOpen,
        'play': Play,
        'flame': Flame,
        'crosshair': Crosshair,
        'target': Target,
        'award': Award,
        'crown': Crown,
        'zap': Zap
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#050a12] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-purple-600/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                            <Award size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Sala de Logros</h2>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Tu progreso y medallas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Cargando tus hazañas...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {categories.map((cat) => {
                                const Icon = iconMap[cat.icon] || Award;
                                const progressPct = Math.min(100, (cat.current_value / cat.max_value) * 100);

                                return (
                                    <div key={cat.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 relative group overflow-hidden">
                                        {/* BG Category Icon */}
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                                            <Icon size={160} />
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl text-blue-400 group-hover:scale-110 transition-transform duration-500">
                                                    <Icon size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-white tracking-tight">{cat.title}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-2xl font-black text-blue-400">{cat.current_value}</span>
                                                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{cat.unit} logrados</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tiers Preview */}
                                            <div className="flex items-center gap-2">
                                                {cat.tiers.map((t, idx) => (
                                                    <div key={idx} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${t.unlocked
                                                        ? `${t.tier === 'gold' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' :
                                                            t.tier === 'silver' ? 'bg-slate-300/20 border-slate-300/50 text-slate-300' :
                                                                t.tier === 'platinum' ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400' :
                                                                    'bg-orange-500/20 border-orange-500/50 text-orange-500'}`
                                                        : 'bg-white/5 border-white/10 text-white/10'
                                                        }`}>
                                                        {t.unlocked ? <Star size={18} fill="currentColor" /> : <Lock size={16} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Progress Bar with markers */}
                                        <div className="relative pt-4 pb-12 z-10">
                                            {/* Track */}
                                            <div className="h-3 w-full bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                                    style={{ width: `${progressPct}%` }}
                                                />
                                            </div>

                                            {/* Markers */}
                                            {cat.tiers.map((t, idx) => {
                                                const markerPct = Math.min(100, (t.threshold / cat.max_value) * 100);
                                                const isLast = markerPct > 90;
                                                const isFirst = markerPct < 10;

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="absolute top-0 flex flex-col items-center group/marker"
                                                        style={{
                                                            left: `${markerPct}%`,
                                                            transform: isLast ? 'translateX(-100%)' : isFirst ? 'translateX(0)' : 'translateX(-50%)'
                                                        }}
                                                    >
                                                        <div className="h-6 w-px bg-white/20 mb-2 group-hover/marker:bg-white/50 transition-colors" />
                                                        <div className={`text-[9px] font-black px-2 py-0.5 rounded-full border transition-all ${t.unlocked
                                                                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-glow'
                                                                : 'bg-slate-900 border-white/5 text-white/20'
                                                            }`}>
                                                            {t.threshold}{cat.unit === '%' ? '%' : ''}
                                                        </div>
                                                        <div className={`mt-2 text-[8px] font-bold uppercase tracking-widest text-center whitespace-nowrap transition-colors ${t.unlocked ? 'text-white' : 'text-white/10'
                                                            }`}>
                                                            {t.tier}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
                    {stats && (
                        <div className="flex items-center gap-12">
                            <div>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] mb-1">Módulos</p>
                                <p className="text-xl font-black text-white">{stats.completed_modules}<span className="text-white/20 ml-1">/ {stats.total_modules}</span></p>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] mb-1">XP Total</p>
                                <p className="text-xl font-black text-yellow-500">{stats.total_xp}</p>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] mb-1">Racha</p>
                                <p className="text-xl font-black text-orange-500">{stats.current_streak} <span className="text-xs text-white/20">días</span></p>
                            </div>
                        </div>
                    )}
                    <button onClick={onClose} className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5">
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;
