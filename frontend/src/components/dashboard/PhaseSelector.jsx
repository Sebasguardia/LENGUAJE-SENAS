import React from 'react';
import { BookOpen, CheckCircle, Clock, List } from 'lucide-react';

const PhaseSelector = ({ activePhase, onPhaseChange }) => {
  const phases = [
    { id: 'all', label: 'Todos', icon: List, count: 6 },
    { id: 'completed', label: 'Completados', icon: CheckCircle, count: 2 },
    { id: 'progress', label: 'En Progreso', icon: Clock, count: 2 },
    { id: 'pending', label: 'Pendientes', icon: BookOpen, count: 2 }
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center mb-12">
      {phases.map(phase => {
        const IconComponent = phase.icon;
        return (
          <button
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activePhase === phase.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 border border-blue-200 hover:shadow-md'
            }`}
          >
            <IconComponent size={20} />
            <span>{phase.label}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              activePhase === phase.id 
                ? 'bg-white/20 text-white' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {phase.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PhaseSelector;