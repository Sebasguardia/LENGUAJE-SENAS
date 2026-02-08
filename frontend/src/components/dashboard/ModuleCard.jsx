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
      case 'Completado': return { label: 'Finalizado', class: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'En progreso': return { label: 'Activo', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]' };
      case 'Pendiente': return { label: 'Próximamente', class: 'bg-white/5 text-white/30 border-white/5' };
      default: return { label: 'Bloqueado', class: 'bg-white/5 text-white/20 border-white/5' };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className={`relative group/card p-8 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 transition-all duration-500 ${isLearnEnabled
      ? 'hover:border-white/20 hover:bg-slate-900/60 cursor-pointer shadow-xl hover:shadow-2xl'
      : 'opacity-50 cursor-not-allowed'
      }`}>
      {/* Decorative Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover/card:opacity-[0.03] rounded-[2.5rem] transition-opacity duration-500`} />

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
          <h3 className="text-2xl font-black text-white tracking-tight group-hover/card:text-blue-400 transition-colors">{title}</h3>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{elements}</p>
        </div>

        {/* Progress System */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Maestría</span>
            <span className="text-white font-mono text-xs">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Technical Stats Block */}
        <div className="grid grid-cols-2 gap-3 pt-4 pb-6">
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-1 border border-white/5 group-hover/card:bg-white/[0.08] transition-colors">
            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={10} className="text-blue-400" /> Tiempo
            </span>
            <span className="text-white font-bold text-sm tracking-tight">{timeSpent}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-1 border border-white/5 group-hover/card:bg-white/[0.08] transition-colors">
            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Target size={10} className="text-green-400" /> Precisión
            </span>
            <span className="text-white font-bold text-sm tracking-tight">{accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Dynamic Action Button */}
      <div className="relative z-10 pt-4 overflow-hidden rounded-2xl">
        <button
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 ${isLearnEnabled
            ? `bg-white/5 text-white hover:bg-white/10 group-hover/card:bg-blue-600 group-hover/card:text-white group-hover/card:shadow-xl group-hover/card:shadow-blue-600/20`
            : 'bg-white/5 text-white/20'
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