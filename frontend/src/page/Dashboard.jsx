import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import { authStorage } from '../utils/authStorage';
import { moduleService } from '../api/moduleService';
import { progressService } from '../api/progressService';
import { getGlobalRank } from '../data/achievements';
import { useTheme } from '../context/ThemeContext';

const iconMap = {
  BookText, MessageSquare, Hash, Calculator, BookOpen, Plus, Sparkles, Cpu
};

// ─── Neural Canvas Engine ──────────────────────────────────────────────────────
const useNeuralCanvas = (canvasRef, theme) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.hue = theme === 'dark' ? Math.random() * 40 + 210 : Math.random() * 20 + 220;
        this.alpha = theme === 'dark' ? Math.random() * 0.18 + 0.04 : Math.random() * 0.4 + 0.2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = theme === 'dark' ? `hsl(${this.hue}, 70%, 60%)` : `hsl(${this.hue}, 80%, 40%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 80 }, () => new Particle());

    const drawNeural = () => {
      const layers = 4, perLayer = 6;
      const lw = canvas.width / (layers + 1);
      for (let l = 1; l <= layers; l++) {
        const x = l * lw;
        for (let n = 0; n < perLayer; n++) {
          const y = (n + 1) * (canvas.height / (perLayer + 1));
          const pulse = Math.sin(Date.now() * 0.002 + l * 0.5 + n * 0.2) * 0.3 + 0.7;
          ctx.save();
          ctx.globalAlpha = (theme === 'dark' ? 0.03 : 0.05) * pulse;
          ctx.fillStyle = theme === 'dark' ? `hsl(${220 + l * 10}, 70%, 60%)` : `hsl(${210 + l * 10}, 80%, 40%)`;
          ctx.beginPath();
          ctx.arc(x, y, 2 * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.save();
            ctx.globalAlpha = (150 - dist) / 150 * (theme === 'dark' ? 0.03 : 0.15);
            ctx.strokeStyle = theme === 'dark' ? 'hsl(220, 70%, 50%)' : 'hsl(220, 80%, 30%)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      drawNeural();
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, theme]);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const modulesRef = useRef(null);

  useNeuralCanvas(canvasRef, theme);

  // --- Estado Global ---
  const [currentUser, setCurrentUser] = useState(() => {
    return authStorage.getUser() || {};
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
    // Si tenemos datos en localStorage de la sesión anterior, los usamos como "placeholder" inmediato
    // El motor de cache de apiClient se encargará de devolver los datos frescos si están en memoria.
    const hasCache = localStorage.getItem('api_cache_/progress/stats');
    if (hasCache) {
      setIsLoading(false); // Desactivamos el spinner global si hay cache
    }

    try {
      // Para máxima rapidez, si ya tenemos algo en el estado (por ejemplo, desde authStorage en el constructor)
      // o si hay cache, desactivamos el loading casi de inmediato y dejamos que los datos lleguen por "streaming"
      if (hasCache || currentUser.id) {
        setIsLoading(false);
      }

      // Lanzamos las peticiones.
      const fetchME = authService.getMe();
      const fetchRank = progressService.getRanking(5);
      const fetchStats = progressService.getDashboardStats();
      const fetchHist = progressService.getHistory(50);
      const fetchMods = moduleService.getModules();

      // Procesamos cada una según llegue para máxima velocidad de renderizado (Reactivity)
      fetchME.then(val => {
        if (val) setCurrentUser(val);
      }).catch(() => { });

      fetchRank.then(ranking => {
        if (ranking) {
          setTopRanking(ranking.map((u, idx) => ({
            ...u,
            name: u.full_name,
            avatar: u.avatar_initials || u.full_name.charAt(0).toUpperCase(),
            color: idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-300' : idx === 2 ? 'bg-orange-500' : 'bg-blue-500/20'
          })));
        }
      }).catch(() => { });

      fetchStats.then(stats => {
        if (stats) setDashboardStats(stats);
      }).catch(() => { });

      fetchHist.then(history => {
        if (history) setUserHistory(history);
      }).catch(() => { });

      // Los módulos dependen un poco de los stats para el progreso visual
      Promise.allSettled([fetchStats, fetchMods]).then(([sRes, mRes]) => {
        if (mRes.status === 'fulfilled' && mRes.value) {
          const modsData = mRes.value;
          const stats = sRes.status === 'fulfilled' ? sRes.value : null;
          const moduleProgress = stats?.module_progress || [];

          setModules(modsData.sort((a, b) => a.order_index - b.order_index).map(m => {
            const modProgress = moduleProgress.find(p => p.module_id == m.id);
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
              precision: modProgress ? Number(modProgress.precision) : 0,
              is_locked: m.is_locked,
              icon: iconMap[m.icon_name] || BookText
            };
          }));
        }
      });

      // NO esperamos con await para que la interfaz se monte de inmediato
      // El finally se encargará de quitar el loading si aún estuviera activo
    } catch (err) {
      console.error("Error al sincronizar el Dashboard:", err);
    } finally {
      // Pequeño delay para asegurar que el primer render ocurra suavemente
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Suscribirse a actualizaciones de cache SWR para refrescar la UI en background
    const handleCacheUpdate = (e) => {
      console.log(`[Dashboard] Actualizando datos desde cache revalidado: ${e.detail.url}`);
      // Solo refrescamos los datos, no activamos el loading global
      fetchDashboardData();
    };

    window.addEventListener('api-cache-updated', handleCacheUpdate);
    return () => window.removeEventListener('api-cache-updated', handleCacheUpdate);
  }, []);

  // ── GSAP Orchestration ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;

    // Timeline para secuencia de entrada
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(heroRef.current, { opacity: 0, scale: 0.98, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1 })
      .fromTo(".hero-badge", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 }, "-=0.6")
      .fromTo(".hero-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
      .fromTo(".stat-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.4")
      .fromTo(".module-card-anim", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.2)" }, "-=0.2");

    return () => { tl.kill(); };
  }, [isLoading]);

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
      <div className="min-h-screen dark:bg-[#05070a] bg-slate-50 flex flex-col items-center justify-center space-y-6 transition-colors duration-500">
        <div className="relative">
          <div className="w-20 h-20 border-4 dark:border-blue-600/20 border-blue-600/10 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="dark:text-blue-400 text-blue-600 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Sincronizando Red Neuronal</p>
          <div className="flex gap-1.5">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-500/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05070a] font-sans selection:bg-blue-500/30 overflow-x-hidden text-slate-900 dark:text-white flex flex-col relative transition-colors duration-500">
      {/* ── Background Neural Infrastructure ──────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 dark:bg-indigo-600/5 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{ backgroundImage: theme === 'dark' ? 'radial-gradient(#ffffff 1px, transparent 1px)' : 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <canvas ref={canvasRef} className={`fixed inset-0 z-[-1] pointer-events-none opacity-40 ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-16 flex-1 w-full">
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

          {/* HERO SECTION ────────────────────────────────────────────────────────── */}
          <section ref={heroRef} className="relative overflow-hidden rounded-[3rem] sm:rounded-[4rem] bg-white/40 dark:bg-[#0a0c10]/60 backdrop-blur-3xl border border-slate-200/50 dark:border-white/10 p-8 lg:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] transition-colors duration-500">
            {/* Gradients decorativos internos */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px] -ml-64 -mb-64" />

            <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
              <div className="flex-1 space-y-10 text-center xl:text-left max-w-2xl">
                <div className="hero-badge inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                  <Sparkles size={14} className="animate-pulse" /> Sistema de Aprendizaje Adaptativo
                  <span className="ms-3 text-slate-400 dark:text-white/20">v2.4.0</span>
                </div>
                
                <div className="space-y-6">
                  <h1 className="hero-title text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85]">
                    Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 animate-gradient">{currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'Estudiante'}</span>
                  </h1>
                  <p className="text-lg lg:text-xl text-slate-500 dark:text-white/40 font-medium max-w-xl mx-auto xl:mx-0 pt-2 leading-relaxed">
                    Tu red neuronal ha registrado <strong className="text-slate-900 dark:text-white text-2xl tracking-tight">{userStats.totalXP} XP</strong>. Mantén el enfoque para dominar el <span className="text-blue-600 dark:text-blue-400 block sm:inline">ranking global</span>.
                  </p>

                  <div className="max-w-md mx-auto xl:mx-0 pt-8 space-y-4">
                    <div className="flex justify-between items-end px-2">
                      <span className="text-[10px] font-black text-blue-600/60 dark:text-blue-400/60 uppercase tracking-[0.3em]">Sincronización de Maestría</span>
                      <span className="text-3xl font-black text-slate-900 dark:text-white">{userStats.globalProgress}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-200 dark:bg-white/5 rounded-full border border-slate-300 dark:border-white/10 overflow-hidden p-1">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.3)] relative overflow-hidden"
                        style={{ width: `${userStats.globalProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center xl:justify-start gap-5 pt-6">
                  <button 
                    onClick={() => document.getElementById('modules-section').scrollIntoView({ behavior: 'smooth' })} 
                    className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all group"
                  >
                    <PlayCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" /> 
                    <span>INICIAR CURSO</span>
                  </button>
                  <button 
                    onClick={() => navigate('/practice')} 
                    className="px-12 py-5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-[2rem] font-black border border-slate-200 dark:border-white/10 backdrop-blur-xl transition-all hover:scale-105 active:scale-95"
                  >
                    TRADUCTOR IA
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full max-w-md xl:max-w-none flex justify-center scale-110 xl:scale-125">
                <HeroVisual userName={currentUser.name || currentUser.full_name} userStats={userStats} onVoiceWelcome={speak} />
              </div>
            </div>
          </section>

          {/* DASHBOARD STATS GRID ──────────────────────────────────────────────── */}
          <div id="stats-section" ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Flame, value: userStats.currentStreak, label: 'Días de Racha', color: 'text-orange-600 dark:text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/10' },
              { icon: Award, value: userStats.completedModules, label: 'Módulos Listos', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/10' },
              { icon: Zap, value: userStats.totalXP, label: 'XP Total', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/10' },
              { icon: Target, value: `${userStats.globalPrecision}%`, label: 'Precisión Media', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/10' },
            ].map((stat, i) => (
              <div key={i} className="stat-card group relative p-8 rounded-[2.5rem] bg-white/60 dark:bg-[#0a0c10]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 overflow-hidden hover:border-blue-500/30 dark:hover:border-white/20 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className={`absolute -right-8 -bottom-8 opacity-[0.05] dark:opacity-[0.02] group-hover:opacity-[0.1] dark:group-hover:opacity-[0.06] transition-opacity duration-700 text-slate-900 dark:text-white`}>
                  <stat.icon size={160} />
                </div>
                <div className="relative z-10 flex flex-col gap-5">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border ${stat.border} shadow-inner`}>
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-slate-900 dark:text-white leading-none mb-2 tracking-tighter">{stat.value}</p>
                    <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em]">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MODULES SECTION ────────────────────────────────────────────────────── */}
          <section id="modules-section" ref={modulesRef} className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-2">
                <h2 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Tu Ruta Maestra</h2>
                <p className="text-slate-500 dark:text-white/40 font-medium text-lg lg:text-xl">Domina el lenguaje de señas con precisión neuronal.</p>
              </div>
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-inner-white">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'Básico', label: 'Básico' },
                  { id: 'Intermedio', label: 'Intermedio' },
                  { id: 'Avanzado', label: 'Avanzado' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === f.id ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105' : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Featured Card: Practice IA ────────────────────────────────────────── */}
              {filter === 'all' && (
                <div className="group relative bg-white dark:bg-[#0a0c10] ring-1 ring-slate-200 dark:ring-white/10 rounded-[3rem] p-10 overflow-hidden shadow-[0_40px_80px_rgba(37,99,235,0.05)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)] cursor-pointer hover:ring-blue-500/50 transition-all duration-500 flex flex-col" onClick={() => navigate('/practice')}>
                  {/* Neural Glow */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] -mr-40 -mt-40 group-hover:bg-blue-500/20 transition-all" />
                  
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white mb-10 shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-white/20 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles size={32} />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-none">Traductor en <span className="text-blue-600 dark:text-blue-400">Tiempo Real</span></h3>
                    <p className="text-slate-500 dark:text-white/40 text-lg mb-12 leading-relaxed font-medium">Sincroniza tu lenguaje con nuestra IA de visión computacional y voz instantánea.</p>
                    <div className="mt-auto">
                      <button className="w-full py-5 rounded-[1.75rem] bg-slate-900 dark:bg-white text-white dark:text-[#05070a] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-600 dark:hover:bg-blue-50 transition-all shadow-xl group/btn">
                        INICIAR PROTOCOLO <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modules
                .filter(m => filter === 'all' || m.difficulty === filter)
                .map((module) => (
                  <div key={module.id} className="module-card-anim group relative bg-white/60 dark:bg-[#0a0c10]/80 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 overflow-hidden hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-700 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
                    {/* Inner highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="flex items-start justify-between mb-10 relative z-10">
                      <div className={`relative w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white text-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 ${module.progress >= 95 ? 'bg-emerald-500/10 border-emerald-500/20' : ''}`}>
                        <module.icon size={28} className={`transition-transform duration-500 group-hover:scale-110 ${module.progress >= 95 ? 'text-emerald-500 dark:text-emerald-400' : ''}`} />
                        {module.progress >= 95 && (
                          <div className="absolute -top-3 -right-3 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-xl">
                            <Check size={14} className="text-white fill-current" strokeWidth={4} />
                          </div>
                        )}
                      </div>
                      {module.progress >= 95 && (
                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">MAESTRÍA COMPLETADA</span>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{module.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-8">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/30 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/5">
                          {module.difficulty}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/10">
                          {module.elementsCount || 0} SEÑAS
                        </span>
                      </div>

                      <p className="text-slate-500 dark:text-white/30 text-base leading-relaxed mb-12 font-medium line-clamp-2 group-hover:text-slate-900 dark:group-hover:text-white/50 transition-colors">
                        {module.description}
                      </p>
                    </div>

                    <div className={`mt-auto space-y-6 relative z-10 ${module.is_locked ? 'opacity-40 grayscale' : ''}`}>
                      <div className="flex justify-between items-end px-1">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">Progreso</span>
                          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{module.progress}%</p>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-[10px] font-black text-blue-600/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">Mejor Precisión</span>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">{module.precision}%</p>
                        </div>
                      </div>
                      
                      <div className="h-2.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${module.progress >= 95 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>

                      <button
                        onClick={() => handleModuleClick(module)}
                        disabled={module.is_locked}
                        className={`w-full py-5 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-500 border overflow-hidden relative group/btn-mod ${module.is_locked
                          ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-300 dark:text-white/10 cursor-not-allowed'
                          : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-900 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white text-slate-900 dark:text-white shadow-xl dark:shadow-[0_10px_30px_rgba(37,99,235,0.2)]'
                          }`}
                      >
                        {module.is_locked ? (
                          <><LockIcon size={18} /> PROTOCOLO BLOQUEADO</>
                        ) : (
                          <>ACCEDER AL MÓDULO <ChevronRight size={18} className="group-hover/btn-mod:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* RANKING & HISTORY SECTION ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">

            {/* Ranking Global ── */}
            <section id="ranking-section" className="lg:col-span-4 bg-white dark:bg-[#0a0c10]/80 backdrop-blur-2xl ring-1 ring-slate-200 dark:ring-white/10 rounded-[3.5rem] p-10 flex flex-col h-full shadow-[0_40px_80px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative overflow-hidden group transition-colors duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 dark:bg-yellow-500/10 blur-[80px] -mr-32 -mt-32" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Ranking Global</h3>
                  <p className="text-slate-400 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Élite del Sistema</p>
                </div>
                <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl text-yellow-600 dark:text-yellow-500 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <Trophy size={24} />
                </div>
              </div>

              <div className="space-y-3 flex-1 relative z-10">
                {topRanking.map((topUser) => (
                  <div key={topUser.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:bg-white transition-all duration-300 group/rank cursor-pointer shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm bg-slate-900 text-white border border-white/10 group-hover/rank:scale-110 transition-transform duration-500`}>
                          {topUser.avatar}
                        </div>
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${topUser.color} text-slate-950 shadow-xl border-2 border-white dark:border-[#0a0c10]`}>
                          {topUser.rank}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-white group-hover/rank:text-blue-600 dark:group-hover/rank:text-blue-400 transition-colors uppercase tracking-tight text-sm">{topUser.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-white/20 font-black uppercase tracking-[0.2em]">{topUser.xp} NEURO-PUNTOS</p>
                      </div>
                    </div>
                    {topUser.rank === 1 && <Crown className="text-yellow-500 animate-[bounce_2s_infinite]" size={18} />}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsRankingOpen(true)}
                className="mt-12 w-full py-5 rounded-[1.75rem] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative z-10"
              >
                MI POSICIÓN EN LA RED
              </button>
            </section>

            {/* Progreso Reciente ── */}
            <section className="lg:col-span-8 bg-white dark:bg-[#0a0c10]/80 backdrop-blur-2xl ring-1 ring-slate-200 dark:ring-white/10 rounded-[3.5rem] p-10 flex flex-col h-full shadow-[0_40px_80px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative overflow-hidden group transition-colors duration-500">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] -mr-80 -mt-80" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <History size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Actividad Reciente</h3>
                    <p className="text-slate-400 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Registro de Sincronización</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl backdrop-blur-md">
                  <Flame size={14} className="animate-pulse" /> {userStats.currentStreak} DÍAS ACTIVO
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 relative z-10">
                {recentHistory.map((session, idx) => (
                  <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.05] hover:border-blue-500/40 transition-all duration-500 group/hist relative overflow-hidden flex flex-col justify-between h-full min-h-[220px] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover/hist:opacity-100 transition-opacity duration-700" />

                    <div className="flex justify-between items-start mb-6 relative">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-slate-400 dark:text-white/20" />
                          <span className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">
                            {formatRelativeTime(session.created_at)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-blue-600/40 dark:text-blue-400/40 font-black uppercase tracking-[0.3em]">Protocolo Módulo</p>
                          <h4 className="font-black text-slate-900 dark:text-white text-3xl tracking-tighter group-hover/hist:text-blue-600 dark:group-hover/hist:text-blue-400 transition-colors leading-none">{session.module_title}</h4>
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest border border-slate-300 dark:border-white/10 group-hover/hist:bg-slate-300 dark:group-hover/hist:bg-white/10 transition-colors">
                        {session.duration}
                      </div>
                    </div>

                    <div className="flex items-end justify-between relative mt-auto">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{session.accuracy}</span>
                          <span className="text-2xl font-black text-slate-400 dark:text-white/20">%</span>
                        </div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400/60 uppercase tracking-[0.3em]">Precisión Alcanzada</p>
                      </div>
                      <div className="w-14 h-14 rounded-[1.25rem] bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20 group-hover/hist:text-white group-hover/hist:bg-blue-600 group-hover/hist:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-500 border border-slate-300 dark:border-white/10">
                        <ArrowUpRight size={24} className="group-hover/hist:translate-x-1 group-hover/hist:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
                {recentHistory.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-300 dark:text-white/10">
                      <BarChart3 size={48} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-900 dark:text-white font-black uppercase tracking-[0.3em] text-sm">Sin registros detectados</p>
                      <p className="text-slate-400 dark:text-white/20 font-medium">Inicia un módulo para registrar tu actividad neuronal hoy.</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsHistoryOpen(true)}
                className="mt-12 w-full py-6 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 relative z-10"
              >
                DESBLOQUEAR HISTORIAL DE DATOS
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
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
        .shadow-inner-white {
          box-shadow: inset 0 1px 1px rgba(255,255,255,${theme === 'dark' ? '0.05' : '0.5'});
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${theme === 'dark' ? '#05070a' : '#f8fafc'}; }
        ::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#1e293b' : '#cbd5e1'}; border-radius: 10px; border: 2px solid ${theme === 'dark' ? '#05070a' : '#f8fafc'}; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#334155' : '#94a3b8'}; }
      `}</style>
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        userHistory={userHistory}
      />
    </div>
  );
};

export default Dashboard;