import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, Hash, Book, MessageSquare, Mic, Users2, ChevronRight, Lock, Unlock, ArrowRight, Sparkles } from 'lucide-react';

const modules = [
  {
    title: 'Fundamentos IA', icon: Shield, level: 'Nivel 01', lessons: 15,
    color: 'text-blue-500', bg: 'bg-blue-400/10', border: 'border-blue-400/20',
    glow: 'rgba(59,130,246,0.12)', accent: '#3b82f6', progress: 100, available: true, tag: 'Más popular',
  },
  {
    title: 'Sintaxis & Números', icon: Hash, level: 'Nivel 02', lessons: 12,
    color: 'text-indigo-500', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20',
    glow: 'rgba(99,102,241,0.12)', accent: '#6366f1', progress: 60, available: true, tag: null,
  },
  {
    title: 'Dactilología Pro', icon: Book, level: 'Nivel 03', lessons: 20,
    color: 'text-purple-500', bg: 'bg-purple-400/10', border: 'border-purple-400/20',
    glow: 'rgba(168,85,247,0.12)', accent: '#a855f7', progress: 0, available: false, tag: null,
  },
  {
    title: 'Semántica Avanzada', icon: MessageSquare, level: 'Nivel 04', lessons: 25,
    color: 'text-pink-500', bg: 'bg-pink-400/10', border: 'border-pink-400/20',
    glow: 'rgba(236,72,153,0.12)', accent: '#ec4899', progress: 0, available: false, tag: null,
  },
  {
    title: 'Análisis Kinésico', icon: Mic, level: 'Nivel 05', lessons: 18,
    color: 'text-cyan-500', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20',
    glow: 'rgba(6,182,212,0.12)', accent: '#06b6d4', progress: 0, available: false, tag: null,
  },
  {
    title: 'Intérprete Senior', icon: Users2, level: 'Nivel 06', lessons: 22,
    color: 'text-emerald-500', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20',
    glow: 'rgba(16,185,129,0.12)', accent: '#10b981', progress: 0, available: false, tag: 'Elite',
  },
];

const LandingModules = ({ modulesRef }) => {
  const navigate = useNavigate();

  return (
    <section ref={modulesRef} id="modulos" className="w-full max-w-7xl mx-auto px-6 mb-36 z-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 text-blue-500 mb-4 font-black uppercase tracking-[0.3em] text-[10px]">
            <BookOpen size={13} /> Currículo Profesional
          </div>
          <h2 className="text-4xl sm:text-6xl font-black dark:text-white text-slate-900 uppercase tracking-tighter leading-none">
            PROGRAMA DE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
              ALTO RENDIMIENTO
            </span>
          </h2>
        </div>
        <div className="md:max-w-xs space-y-4">
          <p className="dark:text-white/25 text-slate-400 font-medium text-sm leading-relaxed">
            Ruta de aprendizaje diseñada por expertos en lingüística y neurociencia aplicada.
          </p>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-[9px] font-black dark:text-white/30 text-slate-500 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Disponible
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black dark:text-white/15 text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full dark:bg-white/10 bg-slate-300" /> Bloqueado
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            Ver todos <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Module cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {modules.map((mod, i) => (
          <div
            key={i}
            className={`module-card group relative rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer ${
              mod.available
                ? 'dark:bg-white/[0.03] bg-white dark:border dark:border-white/8 border border-slate-200 dark:hover:bg-white/[0.06] hover:bg-slate-50 hover:shadow-xl dark:hover:shadow-none shadow-sm'
                : 'dark:bg-white/[0.01] bg-slate-50 dark:border dark:border-white/[0.04] border border-slate-100'
            }`}
            onClick={() => mod.available && navigate('/login')}
          >
            {/* Ambient glow on hover */}
            {mod.available && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[1.75rem] sm:rounded-[2rem] hidden dark:block"
                style={{ background: `radial-gradient(ellipse at bottom right, ${mod.glow.replace('0.12', '0.15')}, transparent 70%)` }}
              />
            )}
            {mod.available && (
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${mod.accent}50, transparent)` }} />
            )}

            <div className="p-6 sm:p-7">
              {/* Top row */}
              <div className="flex items-start justify-between mb-5 sm:mb-7">
                <div className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl ${mod.bg} border ${mod.border} ${!mod.available ? 'opacity-40' : ''} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <mod.icon size={22} sm:size={24} className={mod.color} />
                </div>
                <div className="flex flex-col items-end gap-1.5 sm:gap-2">
                  <div className="px-2.5 py-1 rounded-full dark:bg-white/5 bg-slate-100 dark:border dark:border-white/5 border border-slate-200 text-[8px] sm:text-[9px] font-black uppercase tracking-widest dark:text-white/25 text-slate-400">
                    {mod.level}
                  </div>
                  {mod.tag ? (
                    <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest border ${
                      mod.tag === 'Elite' ? `${mod.bg} ${mod.border} ${mod.color}` : 'bg-blue-500/15 border-blue-500/25 text-blue-500'
                    }`}>
                      {mod.tag === 'Más popular' && <Sparkles size={8} className="inline mr-1" />}
                      {mod.tag}
                    </div>
                  ) : mod.available ? (
                    <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-green-500">
                      <Unlock size={8} /> Disponible
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-black uppercase tracking-widest dark:text-white/10 text-slate-300">
                      <Lock size={8} /> Bloqueado
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight mb-1 transition-colors duration-300 ${
                mod.available ? `dark:text-white text-slate-900 group-hover:${mod.color}` : 'dark:text-white/25 text-slate-300'
              }`}>{mod.title}</h3>
              <p className="dark:text-white/15 text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-5 sm:mb-6">
                {mod.lessons} Sesiones de Entrenamiento
              </p>

              {/* Progress */}
              <div className="mb-5 sm:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black dark:text-white/15 text-slate-400 uppercase tracking-widest">Progreso</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${mod.progress > 0 ? mod.color : 'dark:text-white/10 text-slate-300'}`}>
                    {mod.progress}%
                  </span>
                </div>
                <div className="h-1 dark:bg-white/5 bg-slate-100 rounded-full overflow-hidden">
                  {mod.progress > 0 && (
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${mod.progress}%`, background: mod.progress === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : `linear-gradient(90deg, ${mod.accent}, ${mod.accent}99)` }}
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 sm:pt-5 dark:border-t dark:border-white/[0.06] border-t border-slate-100">
                <span className="text-[9px] font-black uppercase tracking-widest dark:text-white/15 text-slate-400">
                  {mod.available ? 'Acceso completo' : 'Completar nivel anterior'}
                </span>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  mod.available ? 'dark:bg-white/5 bg-slate-100 dark:text-white/25 text-slate-400 group-hover:text-blue-500 group-hover:scale-110' : 'dark:bg-white/[0.02] bg-slate-50 dark:text-white/10 text-slate-300'
                }`}>
                  {mod.available ? <ChevronRight size={16} sm:size={18} className="group-hover:translate-x-0.5 transition-transform" /> : <Lock size={12} sm:size={13} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingModules;