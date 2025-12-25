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
      color: 'blue'
    },
    {
      icon: BookOpen,
      label: 'Módulos Activos',
      value: '15',
      change: '+3',
      trend: 'up',
      color: 'green'
    },
    {
      icon: Database,
      label: 'Datos de Entrenamiento',
      value: '45.2K',
      change: '+2.1K',
      trend: 'up',
      color: 'purple'
    },
    {
      icon: Award,
      label: 'Precisión IA',
      value: '94.3%',
      change: '+2.5%',
      trend: 'up',
      color: 'yellow'
    },
    {
      icon: Clock,
      label: 'Tiempo Activo',
      value: '328h',
      change: '-5h',
      trend: 'down',
      color: 'orange'
    },
    {
      icon: TrendingUp,
      label: 'Completaciones Hoy',
      value: '89',
      change: '+15',
      trend: 'up',
      color: 'pink'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-400/30 text-blue-300',
      green: 'bg-green-500/20 border-green-400/30 text-green-300',
      purple: 'bg-purple-500/20 border-purple-400/30 text-purple-300',
      yellow: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300',
      orange: 'bg-orange-500/20 border-orange-400/30 text-orange-300',
      pink: 'bg-pink-500/20 border-pink-400/30 text-pink-300'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index}
            className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transition-all hover:scale-105 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                <Icon size={24} />
              </div>
              <span className={`text-sm font-semibold ${
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-white/60 text-sm">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;