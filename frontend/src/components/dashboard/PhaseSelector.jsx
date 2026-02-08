import React from 'react';
import { BookOpen, CheckCircle, Clock, List } from 'lucide-react';

const PhaseSelector = ({ activePhase, onPhaseChange }) => {
  const phases = [
    { id: 'all', label: 'Todos', icon: List, count: 6 },
    { id: 'completed', label: 'Finalizado', icon: CheckCircle, count: 2 },
    { id: 'progress', label: 'Activo', icon: Clock, count: 2 },
    { id: 'pending', label: 'Pendiente', icon: BookOpen, count: 2 }
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[1.5rem] w-fit shadow-2xl">
      {phases.map(phase => {
        const Icon = phase.icon;
        const isActive = activePhase === phase.id;
        return (
          <button
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-300 group relative ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
          >
            <Icon size={16} className={isActive ? 'text-white' : 'text-blue-500/60 group-hover:text-blue-400'} />
            <span className="text-xs font-black uppercase tracking-widest">{phase.label}</span>

            {/* Count Badge */}
            <span className={`flex items-center justify-center min-w-[1.5rem] h-5 rounded-lg text-[10px] font-black transition-colors ${isActive
                ? 'bg-white/10 text-white border border-white/10'
                : 'bg-white/5 text-white/20 group-hover:bg-white/10 group-hover:text-white/40 border border-transparent'
              }`}>
              {phase.count}
            </span>

            {/* Subtle indicator for active state */}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PhaseSelector;