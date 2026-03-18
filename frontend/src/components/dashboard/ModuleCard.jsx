import React from 'react';
import { PlayCircle, Clock, Target, Calendar, ArrowRight, Zap } from 'lucide-react';

const ModuleCard = ({
  icon: Icon,
  title,
  elements,
  status,
  isLearnEnabled,
  progress = 0,
  timeSpent = '0m',
  accuracy = 0,
  color = 'from-blue-500 to-indigo-600'
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completado': return { label: 'Finalizado', class: 'dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-600 dark:border-green-500/20 border-green-200' };
      case 'En progreso': return { label: 'Activo', class: 'dark:bg-blue-500/10 bg-blue-50 dark:text-blue-400 text-blue-600 dark:border-blue-500/20 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.1)]' };
      case 'Pendiente': return { label: 'Próximamente', class: 'dark:bg-white/5 bg-slate-50 dark:text-white/30 text-slate-400 dark:border-white/5 border-slate-200' };
      default: return { label: 'Bloqueado', class: 'dark:bg-white/5 bg-slate-50 dark:text-white/20 text-slate-300 dark:border-white/5 border-slate-200' };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className={`relative group/card p-8 rounded-[2.5rem] dark:bg-slate-900/40 bg-white backdrop-blur-xl dark:border-white/5 border-slate-200 transition-all duration-500 shadow-sm dark:shadow-none ${isLearnEnabled
      ? 'dark:hover:border-white/20 hover:border-blue-500/30 dark:hover:bg-slate-900/60 hover:bg-slate-50 cursor-pointer hover:shadow-2xl'
      : 'opacity-50 cursor-not-allowed'
      }`}>
      {/* Decorative Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover/card:opacity-[0.03] dark:group-hover/card:opacity-[0.03] rounded-[2.5rem] transition-opacity duration-500`} />

      {/* Header Area */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-blue-500/20 group-hover/card:scale-110 transition-transform duration-500`}>
          <Icon className="text-white" size={24} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${statusConfig.class}`}>
          {status === 'En progreso' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
          {statusConfig.label}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 relative z-10">
        <div>
          <h3 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors uppercase">{title}</h3>
          <p className="dark:text-white/40 text-slate-500 text-xs font-black uppercase tracking-widest mt-1">{elements}</p>
        </div>

        {/* Progress System */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="dark:text-white/30 text-slate-400 text-[10px] font-black uppercase tracking-widest">Maestría</span>
            <span className="dark:text-white text-slate-700 font-mono text-xs">{progress}%</span>
          </div>
          <div className="h-1.5 dark:bg-white/5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Technical Stats Block */}
        <div className="grid grid-cols-2 gap-3 pt-4 pb-6">
          <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 dark:border-white/5 border-slate-100 group-hover/card:dark:bg-white/[0.08] group-hover/card:bg-white transition-colors">
            <span className="dark:text-white/20 text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={10} className="text-blue-500" /> Tiempo
            </span>
            <span className="dark:text-white text-slate-800 font-bold text-sm tracking-tight">{timeSpent}</span>
          </div>
          <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 dark:border-white/5 border-slate-100 group-hover/card:dark:bg-white/[0.08] group-hover/card:bg-white transition-colors">
            <span className="dark:text-white/20 text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Target size={10} className="text-green-500" /> Precisión
            </span>
            <span className="dark:text-white text-slate-800 font-bold text-sm tracking-tight">{accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Dynamic Action Button */}
      <div className="relative z-10 pt-4 overflow-hidden rounded-2xl">
        <button
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 ${isLearnEnabled
            ? `dark:bg-white/5 bg-slate-100 dark:text-white text-slate-800 hover:dark:bg-white/10 hover:bg-slate-200 group-hover/card:bg-blue-600 group-hover/card:text-white group-hover/card:shadow-xl group-hover/card:shadow-blue-600/20`
            : 'dark:bg-white/5 bg-slate-100 dark:text-white/20 text-slate-400'
            }`}
          disabled={!isLearnEnabled}
        >
          {progress > 0 ? 'Continuar Ruta' : 'Iniciar Módulo'}
          <ArrowRight size={16} className={`transition-transform duration-500 ${isLearnEnabled ? 'group-hover/card:translate-x-1' : ''}`} />
        </button>
      </div>

      {/* Decorative corner tag */}
      <div className={`absolute -top-1 px-4 py-1 rounded-b-xl text-[8px] font-black uppercase tracking-widest left-1/2 -translate-x-1/2 transition-opacity duration-300 ${status === 'En progreso' ? 'bg-blue-600 text-white opacity-100' : 'opacity-0'
        }`}>
        <Zap size={8} className="inline mr-1" />
        Prioridad
      </div>
    </div>
  );
};

export default ModuleCard;