import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Phone, CreditCard, Calendar,
    Award, Target, Flame, Edit2,
    Save, X, Lock, Shield, Medal, Crown, Zap, Play, Crosshair, Book, Clock, Trophy, Activity, History
} from 'lucide-react';
import { getGlobalRank } from '../data/achievements';
import { authService } from '../api/authService';
import { authStorage } from '../utils/authStorage';
import { achievementService } from '../api/achievementService';
import { progressService } from '../api/progressService';
import { moduleService } from '../api/moduleService';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    // --- Estado Inteligente (Carga desde Cache) ---
    const [userData, setUserData] = useState(() => {
        return authStorage.getUser() || {};
    });

    // Solo mostramos loader si NO hay nada en cache
    const [isLoading, setIsLoading] = useState(!authStorage.getUser());

    const [userStats, setUserStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [realModules, setRealModules] = useState([]);
    const [recentHistory, setRecentHistory] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        dni: ''
    });

    const fetchUserData = async () => {
        try {
            // El fetch inicial suele ser instantáneo gracias al nuevo apiClient con cache
            const results = await Promise.allSettled([
                authService.getMe(),
                achievementService.getUserAchievements(),
                moduleService.getModules(),
                progressService.getDashboardStats(),
                progressService.getHistory(20)
            ]);

            // 1. Datos de Usuario
            if (results[0].status === 'fulfilled') {
                const user = results[0].value;
                setUserData(user);
                setFormData({
                    name: user.full_name || user.name || '',
                    phone: user.phone || '',
                    dni: user.dni || ''
                });
            }

            // 2. Logros
            if (results[1].status === 'fulfilled' && results[1].value) {
                const achData = results[1].value;
                setUserStats(achData.stats);
                setCategories(achData.categories || []);
            }

            // 3. Módulos y Estadísticas de Progreso
            const allModules = results[2].status === 'fulfilled' ? results[2].value : [];
            const stats = results[3].status === 'fulfilled' ? results[3].value : null;

            if (allModules.length > 0 && stats?.module_progress) {
                const modulesWithProgress = allModules.map(m => {
                    const prog = stats.module_progress.find(p => p.module_id == m.id);
                    return {
                        ...m,
                        progress: prog ? Number(prog.progress) : 0
                    };
                });
                const sorted = [...modulesWithProgress].sort((a, b) => b.progress - a.progress);
                setRealModules(sorted.slice(0, 4));
            }

            // 4. Historial
            if (results[4].status === 'fulfilled') {
                setRecentHistory(results[4].value || []);
            }

        } catch (err) {
            console.error("Error loading profile:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();

        // Escuchar actualizaciones silenciosas de cache en background
        const handleCacheUpdate = (e) => {
            const { url, data } = e.detail;
            if (url.includes('/auth/me')) {
                setUserData(data);
            }
        };

        window.addEventListener('api-cache-updated', handleCacheUpdate);
        return () => window.removeEventListener('api-cache-updated', handleCacheUpdate);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            const updated = await authService.updateMe({
                full_name: formData.name,
                phone: formData.phone,
                dni: formData.dni
            });
            setUserData(updated);
            setIsEditing(false);
            toast.success("Perfil actualizado con éxito");
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Error al actualizar el perfil");
        }
    };

    const handleCancel = () => {
        setFormData({
            name: userData.full_name || userData.name || '',
            phone: userData.phone || '',
            dni: userData.dni || ''
        });
        setIsEditing(false);
    };

    if (isLoading) return (
        <div className="min-h-screen dark:bg-[#05070a] bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    // Visual calculations
    const globalRank = getGlobalRank(userData.xp || 0);
    const userName = userData.full_name || userData.name || 'Estudiante';
    const userAvatar = userData.avatar_initials || (userName ? userName.charAt(0).toUpperCase() : 'U');

    // Icon map for achievements
    const iconMap = {
        'play': Play,
        'target': Target,
        'award': Award,
        'crosshair': Crosshair,
        'book': Book,
        'crown': Crown,
        'flame': Flame,
        'zap': Zap
    };

    return (
        <div className="min-h-screen dark:bg-[#05070a] bg-[#f8fafc] dark:text-white text-slate-900 selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-500">
            {/* Background Ambient Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] dark:bg-blue-600/10 bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] dark:bg-purple-600/10 bg-purple-500/5 rounded-full blur-[120px] animate-pulse duration-[5s]"></div>
                <div className="absolute inset-0 dark:opacity-[0.02] opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(rgba(100,116,139,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-8">

                {/* 1. TOP NAV / ACTION BAR */}
                <div className="flex items-center justify-between px-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/50 hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Panel de Control</span>
                    </button>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-600/20 active:scale-95"
                    >
                        <Edit2 size={14} /> Editar Perfil
                    </button>
                </div>

                {/* 2. SYMMETRICAL HERO SECTION */}
                <section className="relative rounded-[3.5rem] dark:bg-[#0a0c10]/80 bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 p-12 lg:p-16 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] dark:shadow-none cursor-default transition-all duration-500 hover:dark:border-blue-500/20 hover:border-blue-500/30 group/hero">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">

                        {/* LEFT: Avatar Wrapper */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="absolute inset-x-0 inset-y-0 rounded-full blur-3xl opacity-20" style={{ backgroundColor: globalRank.color }}></div>
                                <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full dark:bg-[#05070a] bg-slate-50 border-[10px] dark:border-[#0a0c10] border-slate-100 flex items-center justify-center relative z-10 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <span className="text-6xl lg:text-7xl font-black dark:text-white text-slate-800 drop-shadow-xl">{userAvatar}</span>
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-white text-[#05070a] font-black text-[9px] uppercase tracking-[0.3em] shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 border-2 dark:border-[#0a0c10] border-slate-200 leading-none">
                                    NIVEL {userStats?.level || 1}
                                </div>
                            </div>
                        </div>

                        {/* MIDDLE: Info & Progress Card */}
                        <div className="flex-1 flex flex-col items-center lg:items-start space-y-6">
                            <div className="text-center lg:text-left">
                                <h1 className="text-4xl lg:text-6xl font-black dark:text-white text-slate-900 tracking-tighter leading-none mb-4 lowercase">
                                    {userName}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/10">
                                        <globalRank.icon size={12} style={{ color: globalRank.color }} />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: globalRank.color }}>{globalRank.tier}</span>
                                    </div>
                                    <span className="dark:text-white/30 text-slate-400 font-bold uppercase tracking-widest text-[10px]">{userData.email}</span>
                                </div>
                            </div>

                            <div className="w-full max-w-lg space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">{globalRank.name}</span>
                                    <span className="text-lg font-black dark:text-white text-slate-900">{userData.xp || 0} <span className="text-[10px] dark:text-white/30 text-slate-400 uppercase ml-1">xp</span></span>
                                </div>
                                <div className="h-2 w-full bg-slate-950/50 rounded-full border border-white/5 overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.max(5, ((userData.xp || 0) % 1000 / 1000) * 100 || (userData.xp / 10000) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Global Rank Metric */}
                        <div className="flex flex-col items-center lg:items-end justify-center px-10 dark:border-white/5 border-slate-200 lg:border-l min-w-[220px]">
                            <div className="flex flex-col items-center lg:items-end">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-5xl font-black dark:text-white text-slate-900 leading-none">#{userStats?.global_rank || '1'}</span>
                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                                        <Crown size={24} />
                                    </div>
                                </div>
                                <p className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.3em]">Global Rank</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. MAIN CONTENT SYSTEM */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">

                    {/* LEFT AREA: Salón de la Fama */}
                    <div className="lg:col-span-8">
                        <section className="h-full dark:bg-[#0a0c10]/60 bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[3.5rem] p-12 lg:p-14 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:shadow-none transition-all hover:dark:border-white/10 hover:border-slate-300">
                            {/* Large Background Trophy (as in screenshot) */}
                            <div className="absolute inset-0 flex items-center justify-center dark:opacity-[0.02] opacity-[0.05] pointer-events-none scale-150">
                                <Trophy size={500} strokeWidth={1} />
                            </div>

                            <div className="relative z-10 flex items-center gap-5 mb-16">
                                <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-600 dark:text-yellow-500 border border-yellow-500/10 shadow-lg shadow-yellow-500/5">
                                    <Medal size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black dark:text-white text-slate-900 tracking-tighter uppercase leading-none">Salón de la Fama</h3>
                                    <p className="dark:text-white/20 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2">Conquista insignias y domina el lenguaje</p>
                                </div>
                            </div>

                            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-12">
                                {categories.flatMap(cat =>
                                    cat.tiers.map(tier => ({ ...tier, iconSlug: cat.icon, isUnlocked: tier.unlocked }))
                                ).sort((a, b) => (b.isUnlocked ? 1 : 0) - (a.isUnlocked ? 1 : 0))
                                    .slice(0, 8)
                                    .map((badge, idx) => {
                                        const Icon = badge.isUnlocked ? (iconMap[badge.iconSlug] || Award) : Lock;
                                        return (
                                            <div key={idx} className={`flex flex-col items-center gap-5 transition-all duration-700 ${!badge.isUnlocked ? 'opacity-30' : 'hover:scale-105'}`}>
                                                <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 relative ${!badge.isUnlocked ? 'dark:bg-white/5 bg-slate-100 dark:border-white/5 border-slate-200 dark:text-white/10 text-slate-300' :
                                                    badge.tier === 'platinum' ? 'border-cyan-400 text-cyan-500 dark:text-cyan-400 ring-4 ring-cyan-400/20' :
                                                        badge.tier === 'gold' ? 'border-yellow-400 text-yellow-600 dark:text-yellow-400 ring-4 ring-yellow-400/20' :
                                                            badge.tier === 'silver' ? 'border-slate-400 text-slate-500 dark:text-slate-300 ring-4 ring-slate-400/20' :
                                                                'border-orange-500 text-orange-600 dark:text-orange-400 ring-4 ring-orange-500/20'
                                                    }`}>
                                                    <Icon size={badge.isUnlocked ? 40 : 24} />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-[10px] font-black dark:text-white/80 text-slate-700 uppercase tracking-widest leading-none mb-1">{badge.title}</h4>
                                                    <span className="text-[8px] font-black dark:text-white/10 text-slate-300 uppercase tracking-[0.2em]">{badge.isUnlocked ? badge.tier : 'Objetivo'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT AREA: Metrics & Expediente */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Metrics Grid 2x2 */}
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: Flame, val: userStats?.current_streak || 0, label: 'Racha', color: 'text-orange-500' },
                                { icon: Award, val: userStats?.completed_modules || 0, label: 'Módulos', color: 'text-green-600 dark:text-green-400' },
                                { icon: Clock, val: userStats?.total_time || '0m', label: 'Tiempo', color: 'text-purple-600 dark:text-purple-400' },
                                { icon: Target, val: `${userStats?.avg_accuracy || 0}%`, label: 'Puntería', color: 'text-blue-600 dark:text-blue-400' },
                            ].map((s, i) => (
                                <div key={i} className="dark:bg-[#0a0c10]/60 bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center text-center group hover:dark:bg-[#0a0c10]/90 hover:bg-slate-50 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:shadow-none hover:dark:border-white/10 hover:border-slate-300">
                                    <div className={`${s.color} mb-6 group-hover:scale-110 transition-transform`}><s.icon size={28} /></div>
                                    <p className="text-3xl font-black dark:text-white text-slate-900 leading-none mb-1">{s.val}</p>
                                    <p className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Expediente Section - FULL DATA */}
                        <section className="dark:bg-[#0a0c10]/60 bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[3.5rem] p-10 space-y-8 group shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:shadow-none hover:dark:border-white/10 hover:border-slate-300 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 dark:opacity-[0.03] opacity-[0.05] pointer-events-none transition-transform group-hover:scale-110 duration-700"><Shield size={120} /></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-2.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-xl border border-blue-400/20"><Shield size={20} /></div>
                                <h4 className="text-xl font-black dark:text-white text-slate-900 uppercase tracking-tight">Expediente Digit@l</h4>
                            </div>

                            <div className="space-y-5 relative z-10">
                                {[
                                    { label: 'Nombre Completo', icon: User, val: userName },
                                    { label: 'Correo Electrónico', icon: Mail, val: userData.email },
                                    { label: 'Documento de Identidad', icon: CreditCard, val: userData.dni || 'No registrado' },
                                    { label: 'Teléfono Móvil', icon: Phone, val: userData.phone || 'No registrado' },
                                    { label: 'Rol de Sistema', icon: Crown, val: userData.role === 'admin' ? 'Administrador' : 'Estudiante' },
                                ].map((field, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center gap-2 mb-1 dark:opacity-40 opacity-60">
                                            <field.icon size={10} className="text-blue-500 dark:text-blue-400" />
                                            <p className="text-[8px] font-black dark:text-white text-slate-500 uppercase tracking-[0.2em]">{field.label}</p>
                                        </div>
                                        <div className="dark:bg-[#05070a]/50 bg-slate-50 border dark:border-white/5 border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between group/item dark:hover:bg-white/[0.08] hover:bg-slate-100 transition-all">
                                            <span className="text-xs font-bold dark:text-white/80 text-slate-700">{field.val}</span>
                                            <Lock size={12} className="dark:text-white/10 text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ID Metadata */}
                            <div className="mt-8 pt-8 border-t dark:border-white/5 border-slate-200 flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-1">Registro</span>
                                    <span className="text-[10px] font-black dark:text-white text-slate-900">{new Date(userData.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[7px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-1">ID Único</span>
                                    <span className="text-[10px] font-black dark:text-blue-500 text-blue-600">#{userData.id?.toString().padStart(5, '0')}</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-12">
                        <section className="dark:bg-[#0a0c10]/60 bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 hover:dark:border-white/10 hover:border-slate-300 transition-all rounded-[3.5rem] p-12 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:shadow-none relative group">
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400 border border-blue-500/10 shadow-lg shadow-blue-500/5">
                                        <History size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black dark:text-white text-slate-900 tracking-tighter uppercase leading-none">Historial de Traducciones</h3>
                                        <p className="dark:text-white/20 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2">Registros del traductor en tiempo real</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.2em]">
                                            <th className="px-6 pb-2">Fecha y Hora</th>
                                            <th className="px-6 pb-2">Palabras</th>
                                            <th className="px-6 pb-2">Duración</th>
                                            <th className="px-6 pb-2">Recompensa</th>
                                            <th className="px-6 pb-2">Traducción Generada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentHistory
                                            .filter(h => !h.module_id)
                                            .map((session, idx) => (
                                                <tr key={idx} className="group/row transition-all">
                                                    <td className="px-6 py-5 dark:bg-white/[0.02] bg-slate-50 group-hover/row:dark:bg-white/[0.05] group-hover/row:bg-slate-100 border-y border-l dark:border-white/5 border-slate-200 group-hover/row:border-blue-500/30 rounded-l-2xl transition-all">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold dark:text-white/80 text-slate-700">{new Date(session.created_at).toLocaleDateString()}</span>
                                                            <span className="text-[9px] font-black dark:text-white/20 text-slate-400 mt-1">{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 dark:bg-white/[0.02] bg-slate-50 group-hover/row:dark:bg-white/[0.05] group-hover/row:bg-slate-100 border-y dark:border-white/5 border-slate-200 group-hover/row:border-blue-500/30 transition-all font-mono text-xs text-blue-600 dark:text-blue-400">
                                                        {session.score || 0} señas
                                                    </td>
                                                    <td className="px-6 py-5 dark:bg-white/[0.02] bg-slate-50 group-hover/row:dark:bg-white/[0.05] group-hover/row:bg-slate-100 border-y dark:border-white/5 border-slate-200 group-hover/row:border-blue-500/30 transition-all text-xs dark:text-white/60 text-slate-600">
                                                        {session.duration || '0s'}
                                                    </td>
                                                    <td className="px-6 py-5 dark:bg-white/[0.02] bg-slate-50 group-hover/row:dark:bg-white/[0.05] group-hover/row:bg-slate-100 border-y dark:border-white/5 border-slate-200 group-hover/row:border-blue-500/30 transition-all">
                                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 w-fit">
                                                            <Zap size={10} className="text-yellow-500" />
                                                            <span className="text-[10px] font-black text-yellow-500">+{Math.min(50, (session.score || 0) * 2)} XP</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 dark:bg-white/[0.02] bg-slate-50 group-hover/row:dark:bg-white/[0.05] group-hover/row:bg-slate-100 border-y border-r dark:border-white/5 border-slate-200 group-hover/row:border-blue-500/30 rounded-r-2xl transition-all">
                                                        <p className="text-xs font-medium dark:text-white/50 text-slate-500 italic group-hover/row:text-blue-600 dark:group-hover/row:text-blue-200 transition-colors truncate max-w-xs">
                                                            "{session.module_title === 'Práctica Libre' ? (JSON.parse(session.details || '[]').map(d => d.status).join(' ') || 'Sin texto') : session.module_title}"
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        {recentHistory.filter(h => !h.module_id).length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                                        <History size={48} />
                                                        <p className="text-sm font-black uppercase tracking-[0.2em]">No hay traducciones guardadas aún</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Optional additional sections */}
                <div className="pt-10 border-t dark:border-white/5 border-slate-200">
                    <p className="text-center dark:text-white/10 text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">Finalización de Expediente — Sistema de Seguridad IA</p>
                </div>
            </div>

            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 dark:bg-[#05070a]/80 bg-slate-900/40 backdrop-blur-xl transition-all animate-in fade-in duration-300">
                    <div className="relative w-full max-w-2xl dark:bg-[#0a0c10] bg-white border dark:border-white/10 border-slate-200 rounded-[3.5rem] p-12 lg:p-16 shadow-[0_0_100px_rgba(30,58,138,0.3)] shadow-2xl overflow-hidden">
                        {/* Background Ambiance */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                        <div className="relative z-10 flex flex-col items-center gap-10">
                            <div className="flex items-center gap-6 w-full mb-4">
                                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-3xl border border-blue-500/20">
                                    <Edit2 size={32} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-4xl font-black dark:text-white text-slate-900 tracking-tighter uppercase leading-none">Editar Perfil</h2>
                                    <p className="dark:text-white/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Actualiza tu identidad digital y seguridad</p>
                                </div>
                                <button onClick={handleCancel} className="p-3 dark:bg-white/5 bg-slate-100 hover:dark:bg-white/10 hover:bg-slate-200 rounded-2xl border dark:border-white/5 border-slate-200 transition-all dark:text-white text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                {/* BASIC DATA */}
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] border-b dark:border-white/5 border-slate-200 pb-3">Datos Básicos</p>
                                    <div className="space-y-5">
                                        {[
                                            { label: 'Nombre Completo', icon: User, name: 'name', type: 'text' },
                                            { label: 'DNI / Documento', icon: CreditCard, name: 'dni', type: 'text' },
                                            { label: 'Teléfono', icon: Phone, name: 'phone', type: 'tel' },
                                        ].map((input) => (
                                            <div key={input.name} className="group">
                                                <label className="text-[8px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{input.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type={input.type}
                                                        name={input.name}
                                                        value={formData[input.name]}
                                                        onChange={handleChange}
                                                        className="w-full dark:bg-[#05070a]/50 bg-slate-50 border dark:border-white/10 border-slate-200 group-hover:dark:border-white/20 group-hover:border-slate-300 focus:border-blue-600 rounded-2xl px-5 py-4 text-xs font-bold dark:text-white text-slate-900 focus:outline-none transition-all"
                                                    />
                                                    <input.icon size={14} className="absolute right-5 top-1/2 -translate-y-1/2 dark:text-white/10 text-slate-300 group-hover:dark:text-white/20 group-hover:text-slate-500 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SECURITY DATA */}
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] border-b dark:border-white/5 border-slate-200 pb-3">Seguridad</p>
                                    <div className="space-y-5">
                                        {[
                                            { label: 'Contraseña Actual', icon: Lock, name: 'currentPassword', type: 'password' },
                                            { label: 'Nueva Contraseña', icon: Zap, name: 'newPassword', type: 'password' },
                                            { label: 'Confirmar Nueva', icon: Shield, name: 'confirmPassword', type: 'password' },
                                        ].map((input) => (
                                            <div key={input.name} className="group">
                                                <label className="text-[8px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{input.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type={input.type}
                                                        name={input.name}
                                                        value={formData[input.name] || ''}
                                                        onChange={handleChange}
                                                        placeholder="••••••••"
                                                        className="w-full dark:bg-[#05070a]/50 bg-slate-50 border dark:border-white/10 border-slate-200 group-hover:dark:border-white/20 group-hover:border-slate-300 focus:border-purple-600 rounded-2xl px-5 py-4 text-xs font-bold dark:text-white text-slate-900 dark:placeholder:text-white/10 placeholder:text-slate-300 focus:outline-none transition-all"
                                                    />
                                                    <input.icon size={14} className="absolute right-5 top-1/2 -translate-y-1/2 dark:text-white/10 text-slate-300 group-hover:dark:text-white/20 group-hover:text-slate-500 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full mt-4">
                                <button onClick={handleCancel} className="flex-1 py-5 rounded-[2rem] bg-white/5 hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.3em] text-white/50 border border-white/5 transition-all">
                                    Descartar
                                </button>
                                <button onClick={async () => {
                                    try {
                                        // 1. Update basic info
                                        const updated = await authService.updateMe({
                                            full_name: formData.name,
                                            phone: formData.phone,
                                            dni: formData.dni
                                        });

                                        // 2. Handle password change if filled
                                        if (formData.currentPassword && formData.newPassword) {
                                            if (formData.newPassword !== formData.confirmPassword) {
                                                toast.error("Las nuevas contraseñas no coinciden");
                                                return;
                                            }
                                            await authService.changePassword({
                                                old_password: formData.currentPassword,
                                                new_password: formData.newPassword
                                            });
                                        }

                                        setUserData(updated);
                                        setIsEditing(false);
                                        toast.success("Perfil y seguridad actualizados con éxito");

                                        // Clear security fields
                                        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                                    } catch (err) {
                                        console.error("Error updating profile:", err);
                                        toast.error(err.response?.data?.detail || "Error al actualizar el perfil");
                                    }
                                }} className="flex-[2] py-5 rounded-[2rem] bg-blue-600 hover:bg-blue-500 font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-2xl shadow-blue-600/30 transition-all active:scale-95">
                                    Aplicar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .shadow-3xl {
                    box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.7);
                }
                .drop-shadow-glow {
                    filter: drop-shadow(0 0 10px currentColor);
                }
            `}</style>
        </div>
    );
};

export default UserProfile;
