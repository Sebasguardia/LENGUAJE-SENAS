import React from 'react';
import { PlayCircle, Clock, Target, Calendar } from 'lucide-react';

const ModuleCard = ({ 
  icon: Icon, 
  title, 
  elements, 
  status, 
  isLearnEnabled,
  progress,
  timeSpent,
  lastPractice,
  accuracy,
  color = 'from-blue-500 to-purple-500'
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En progreso': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Pendiente': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border-2 transition-all duration-500 group-hover:scale-105 ${
      isLearnEnabled 
        ? 'border-white/20 hover:border-blue-400/50 cursor-pointer shadow-2xl hover:shadow-3xl' 
        : 'border-white/10 opacity-60'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-r ${color}`}>
          <Icon className="text-white" size={28} />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm mb-4">{elements}</p>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock size={16} />
          <span>{timeSpent}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Target size={16} />
          <span>{accuracy}%</span>
        </div>
      </div>

      {/* Last Practice */}
      <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
        <Calendar size={14} />
        <span>Última práctica: {lastPractice}</span>
      </div>

      {/* Footer */}
      <button 
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
          isLearnEnabled
            ? `bg-gradient-to-r ${color} text-white hover:shadow-lg hover:scale-105`
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
        disabled={!isLearnEnabled}
      >
        <PlayCircle size={18} />
        {progress > 0 ? 'Continuar' : 'Comenzar'}
      </button>
    </div>
  );
};

export default ModuleCard;