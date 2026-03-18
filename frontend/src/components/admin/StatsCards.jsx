import React from 'react';
import { Users, BookOpen, Database, TrendingUp, Award, Clock } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      icon: Users,
      label: 'Usuarios Totales',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: 'bg-blue-600/10'
    },
    {
      icon: BookOpen,
      label: 'Módulos Activos',
      value: '15',
      change: '+3',
      trend: 'up',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      glow: 'bg-green-600/10'
    },
    {
      icon: Database,
      label: 'Datos de Entrenamiento',
      value: '45.2K',
      change: '+2.1K',
      trend: 'up',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      glow: 'bg-purple-600/10'
    },
    {
      icon: Award,
      label: 'Precisión IA',
      value: '94.3%',
      change: '+2.5%',
      trend: 'up',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      glow: 'bg-yellow-600/10'
    },
    {
      icon: Clock,
      label: 'Tiempo Activo',
      value: '328h',
      change: '-5h',
      trend: 'down',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      glow: 'bg-orange-600/10'
    },
    {
      icon: TrendingUp,
      label: 'Completaciones Hoy',
      value: '89',
      change: '+15',
      trend: 'up',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'bg-emerald-600/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="relative dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-6 lg:p-8 h-full overflow-hidden dark:hover:bg-white/[0.04] hover:bg-slate-50 dark:hover:border-white/10 hover:border-slate-300 transition-all duration-500 group shadow-sm dark:shadow-none"
          >
             {/* Ambient glow */}
             <div className={`absolute -bottom-8 -right-8 w-32 h-32 ${stat.glow} blur-[40px] group-hover:opacity-150 transition-opacity`} />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`relative w-12 h-12 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                <Icon size={20} className={stat.color} />
              </div>
              <span className={`text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full border ${stat.trend === 'up' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                {stat.change}
              </span>
            </div>
            
            <h3 className="relative z-10 text-3xl sm:text-4xl font-black dark:text-white text-slate-900 mb-2 tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-400 dark:group-hover:from-white dark:group-hover:to-white/50 transition-all">
              {stat.value}
            </h3>
            <p className="relative z-10 dark:text-white/30 text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest truncate">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;