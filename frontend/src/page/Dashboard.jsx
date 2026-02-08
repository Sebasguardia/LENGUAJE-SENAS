import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/dashboard/Header';
import ChatWidget from '../components/dashboard/ChatWidget';
import HeroVisual from '../components/dashboard/HeroVisual';
import Footer from '../components/dashboard/Footer';
import RankingModal from '../components/dashboard/RankingModal';
import HistoryModal from '../components/dashboard/HistoryModal';
import {
  BookText, MessageSquare, Hash, Calculator, BookOpen, Plus,
  Target, Trophy, Zap, Award, Activity, Cpu,
  History, Clock, Star, PlayCircle, BarChart3, Medal, Crown, Calendar,
  ArrowUpRight, Users, ChevronRight, X, Flame, Sparkles, Lock as LockIcon, Check
} from 'lucide-react';

import { authService } from '../api/authService';
import { moduleService } from '../api/moduleService';
import { progressService } from '../api/progressService';
import { getGlobalRank } from '../data/achievements';

const iconMap = {
  BookText, MessageSquare, Hash, Calculator, BookOpen, Plus, Sparkles, Cpu
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Estado Global ---
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('userData')) || usersData[0];
  });
  const [topRanking, setTopRanking] = useState([]);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('app_muted') === 'true');
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  // Modal States
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // 1. Obtener User Actualizado
      const user = await authService.getMe();
      setCurrentUser(user);

      // 2. Obtener Ranking Real
      const ranking = await progressService.getRanking(5);
      setTopRanking(ranking.map((u, idx) => ({
        ...u,
        name: u.full_name,
        avatar: u.avatar_initials || u.full_name.charAt(0).toUpperCase(),
        color: idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-300' : idx === 2 ? 'bg-orange-500' : 'bg-blue-500/20'
      })));

      // 3. Obtener Estadísticas Reales
      const stats = await progressService.getDashboardStats();
      setDashboardStats(stats);

      // 4. Obtener Historial Real (Aumentamos el límite para el modal completo)
      const history = await progressService.getHistory(50);
      setUserHistory(history);

      // 5. Obtener Módulos Reales
      const modsData = await moduleService.getModules();
      setModules(modsData.sort((a, b) => a.order_index - b.order_index).map(m => {
        const modProgress = stats.module_progress?.find(p => p.module_id == m.id);
        return {
          id: m.id,
          slug: m.slug,
          title: m.title,
          description: m.description,
          difficulty: m.difficulty,
          elementsCount: m.elements_count,
          duration: m.duration,
          tags: m.tags ? m.tags.split(',') : [],
          progress: modProgress ? Number(modProgress.progress) : 0,
          precision: modProgress ? Number(modProgress.precision) : 0, // Nueva precisión persistente
          is_locked: m.is_locked,
          icon: iconMap[m.icon_name] || BookText
        };
      }));

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    localStorage.setItem('app_muted', isMuted);
  }, [isMuted]);

  // --- Datos derivados ---
  const userStats = dashboardStats ? {
    totalXP: dashboardStats.total_xp,
    currentStreak: dashboardStats.current_streak,
    globalAccuracy: Math.round(dashboardStats.global_accuracy),
    globalPrecision: Math.round(dashboardStats.global_precision), // Promedio de mejores precisiones
    globalProgress: Math.round(dashboardStats.global_progress),  // Promedio de progreso real
    completedModules: dashboardStats.completed_modules,
    totalSessions: dashboardStats.total_sessions
  } : { totalXP: 0, currentStreak: 0, globalAccuracy: 0, globalPrecision: 0, completedModules: 0, totalSessions: 0, globalProgress: 0 };

  const globalRank = getGlobalRank(currentUser.xp);

  // Limitar a solo las últimas 4 sesiones para la vista previa del dashboard
  const recentHistory = userHistory.slice(0, 4);

  // Helper para tiempo relativo
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 172800) return 'ayer';
    return `hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  // --- Handlers ---
  const handleModuleClick = (module) => {
    if (module.is_locked) return;
    // Usar el slug para navegación SEO-friendly
    navigate(`/module/${module.slug}`);
  };

  const speak = (text) => {
    if (!isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.onstart = () => setIsBotSpeaking(true);
      utterance.onend = () => setIsBotSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-400 font-bold animate-pulse">Sincronizando con la red neuronal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 overflow-x-hidden text-white flex flex-col">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse duration-[5s]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '35px 35px' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-12 flex-1 w-full">
        <Header user={currentUser} isMuted={isMuted} setIsMuted={setIsMuted} />

        <main className="space-y-12">
          {/* IA CHAT WIDGET */}
          <ChatWidget
            userStats={userStats}
            currentUser={currentUser}
            allModules={modules}
            onSpeak={speak}
            isMuted={isMuted}
          />

          {/* HERO SECTION */}
          <section className="relative overflow-hidden rounded-[4rem] bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-8 lg:p-14 shadow-2xl">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
              <div className="flex-1 space-y-8 text-center xl:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Target size={12} className="animate-pulse" /> Sistema de Aprendizaje Adaptativo
                  <span className="ms-2 opacity-50">v2.4.0</span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white tracking-tight leading-[0.85]">
                    Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">{currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'Estudiante'}</span>
                  </h1>
                  <p className="text-xl text-white/50 font-medium max-w-xl mx-auto xl:mx-0 pt-4 leading-relaxed">
                    Has recolectado <strong className="text-white text-2xl">{userStats.totalXP} XP</strong>. Sigue así para subir en el <span className="text-blue-400">ranking global</span>.
                  </p>

                  {/* BARRA DE PROGRESO GENERAL */}
                  <div className="max-w-md mx-auto xl:mx-0 pt-6 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Progreso de Maestría</span>
                      <span className="text-2xl font-black text-white">{userStats.globalProgress}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full border border-white/5 overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        style={{ width: `${userStats.globalProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-4">
                  <button onClick={() => document.getElementById('modules-section').scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black flex items-center gap-3 shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all group">
                    <PlayCircle size={24} className="group-hover:rotate-12 transition-transform" /> EMPEZAR A PRACTICAR
                  </button>
                  <button onClick={() => navigate('/practice')} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black border border-white/10 backdrop-blur-md transition-all">
                    TRADUCTOR IA
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full max-w-md xl:max-w-none flex justify-center scale-110">
                <HeroVisual userName={currentUser.name || currentUser.full_name} userStats={userStats} onVoiceWelcome={speak} />
              </div>
            </div>
          </section>

          {/* DASHBOARD STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Flame, value: userStats.currentStreak, label: 'Días de Racha', color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { icon: Award, value: userStats.completedModules, label: 'Módulos Listos', color: 'text-green-400', bg: 'bg-green-400/10' },
              { icon: Zap, value: userStats.totalXP, label: 'XP Total', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { icon: Target, value: `${userStats.globalPrecision}%`, label: 'Precisión General', color: 'text-blue-400', bg: 'bg-blue-400/10' },
            ].map((stat, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all font-sans">
                <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                  <stat.icon size={120} />
                </div>
                <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-white leading-none mb-1">{stat.value}</p>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MODULES SECTION */}
          <section id="modules-section" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-5xl font-black text-white mb-2 tracking-tight">Tu Ruta Maestra</h2>
                <p className="text-white/40 font-medium text-lg">Domina el lenguaje de señas paso a paso.</p>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2 p-1 sm:p-1.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 backdrop-blur-md">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'Básico', label: 'Básico' },
                  { id: 'Intermedio', label: 'Intermedio' },
                  { id: 'Avanzado', label: 'Avanzado' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Featured Card: Practice IA */}
              {filter === 'all' && (
                <div className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 overflow-hidden shadow-2xl shadow-blue-600/20 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => navigate('/practice')}>
                  <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                    <Sparkles size={180} />
                  </div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-8 border border-white/20 shadow-xl">
                      <Sparkles size={32} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 leading-tight">Traductor en Tiempo Real</h3>
                    <p className="text-blue-100/70 text-sm mb-10 leading-relaxed font-medium">Usa nuestra IA de visión computacional para traducir tus señas a voz al instante.</p>
                    <div className="mt-auto">
                      <button className="w-full py-5 rounded-2.5rem bg-white text-blue-600 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                        ABRIR CÁMARA <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modules
                .filter(m => filter === 'all' || m.difficulty === filter)
                .map((module) => (
                  <div key={module.id} className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 overflow-hidden hover:border-blue-500/30 transition-all duration-500 flex flex-col shadow-xl">
                    <div className="flex items-start justify-between mb-8 relative">
                      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl bg-blue-600/10 border border-blue-500/10 shadow-lg group-hover:bg-blue-600/20 transition-all ${module.progress >= 95 ? 'bg-green-500/10 border-green-500/20' : ''}`}>
                        <module.icon size={28} className={module.progress >= 95 ? 'text-green-400' : ''} />
                        {module.progress >= 95 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-lg">
                            <Check size={12} className="text-white fill-current" strokeWidth={4} />
                          </div>
                        )}
                      </div>
                      {module.progress >= 95 && (
                        <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                          <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">COMPLETADO</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">{module.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest border border-white/5">
                        {module.difficulty}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/10">
                        {module.elementsCount || 0} SEÑAS
                      </span>
                      {module.duration && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest border border-purple-500/10">
                          <Clock size={10} /> {module.duration}
                        </span>
                      )}
                      {/* Tags integrados en la misma fila */}
                      {module.tags && module.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-white/5 text-white/20 text-[9px] font-bold lowercase border border-white/5 before:content-['#']">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-white/40 text-sm leading-relaxed mb-10 font-medium">
                      {module.description.substring(0, 100)}...
                    </p>

                    <div className={`mt-auto space-y-4 ${module.is_locked ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex justify-between items-end mb-2 px-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em]">Maestría</span>
                          <span className="text-xl font-black text-white">{module.progress}%</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-black text-blue-400/40 uppercase tracking-[0.15em]">Precisión</span>
                          <span className="text-xl font-black text-blue-400">{module.precision}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                      <button
                        onClick={() => handleModuleClick(module)}
                        disabled={module.is_locked}
                        className={`w-full mt-4 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all border border-white/5 ${module.is_locked
                          ? 'bg-slate-800 text-white/20 cursor-not-allowed'
                          : 'bg-white/5 hover:bg-blue-600 text-white'
                          }`}
                      >
                        {module.is_locked ? (
                          <><LockIcon size={18} /> BLOQUEADO (SIN DATOS)</>
                        ) : (
                          <>CONTINUAR <ChevronRight size={18} /></>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* RANKING & HISTORY SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">

            {/* Ranking Global */}
            <section className="lg:col-span-4 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[3.5rem] p-10 flex flex-col h-full shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">Ranking Global</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Podio de Estudiantes</p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500 shadow-lg">
                  <Trophy size={24} />
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {topRanking.map((topUser) => (
                  <div key={topUser.id} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group cursor-pointer relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-md bg-slate-800 text-white border border-white/10 group-hover:scale-110 transition-transform shadow-lg`}>
                          {topUser.avatar}
                        </div>
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${topUser.color} text-slate-900 shadow-xl border-2 border-slate-900`}>
                          {topUser.rank}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{topUser.name}</p>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{topUser.xp} XP</p>
                      </div>
                    </div>
                    {topUser.rank === 1 && <Crown className="text-yellow-500 relative z-10 animate-bounce" size={18} />}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsRankingOpen(true)}
                className="mt-10 w-full py-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                MI POSICIÓN EN LA TABLA
              </button>
            </section>

            {/* Progreso Reciente */}
            <section className="lg:col-span-8 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[3.5rem] p-10 flex flex-col h-full shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 shadow-lg">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Progreso Reciente</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Actividad del día</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest shadow-xl">
                  <Flame size={14} className="animate-pulse" /> {userStats.currentStreak} Días de Racha
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {recentHistory.map((session, idx) => (
                  <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col justify-between">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/10 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity animate-pulse`} />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={10} className="text-white/20" />
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                            {formatRelativeTime(session.created_at)}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">Módulo</p>
                        <h4 className="font-black text-white text-2xl leading-none">{session.module_title}</h4>
                      </div>
                      <div className="px-4 py-1.5 rounded-xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest border border-white/5">
                        {session.duration}
                      </div>
                    </div>

                    <div className="flex items-end justify-between relative z-10">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black text-white">{session.accuracy}</span>
                          <span className="text-xl font-black text-white/40">%</span>
                        </div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Precisión Lograda</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-blue-600 transition-all shadow-xl">
                        <ArrowUpRight size={24} />
                      </div>
                    </div>
                  </div>
                ))}
                {recentHistory.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-6 rounded-full bg-white/5 border border-dashed border-white/20 text-white/20">
                      <BarChart3 size={48} />
                    </div>
                    <p className="text-white/40 font-bold">Aún no hay sesiones registradas hoy.<br />¡Empieza tu primera práctica!</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsHistoryOpen(true)}
                className="mt-10 w-full py-5 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all"
              >
                VER HISTORIAL COMPLETO
              </button>
            </section>
          </div>
        </main>
        <Footer />
      </div>

      {/* MODALS */}
      <RankingModal
        isOpen={isRankingOpen}
        onClose={() => setIsRankingOpen(false)}
        currentUserId={currentUser.id}
        usersData={topRanking}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        userHistory={userHistory}
      />
    </div>
  );
};

export default Dashboard;