import React from 'react';
import {
  Home, Users, BookOpen, BarChart3, Award,
  Database, Settings, Camera, TrendingUp,
  LayoutDashboard, BrainCircuit, Activity
} from 'lucide-react';

const AdminSidebar = ({ activeSection, onSectionChange }) => {
  const menuGroups = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
      ]
    },
    {
      title: 'Contenido',
      items: [
        { id: 'modules', label: 'Gestión de Módulos', icon: BookOpen },
        { id: 'users', label: 'Gestión de Usuarios', icon: Users },
      ]
    },
    {
      title: 'Inteligencia Artificial',
      items: [
        { id: 'capture', label: 'Captura de Datos', icon: Camera },
        { id: 'training', label: 'Entrenamiento IA', icon: TrendingUp },

      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'database', label: 'Base de Datos', icon: Database },
        { id: 'settings', label: 'Configuración', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="bg-slate-900/40 backdrop-blur-2xl w-72 h-full p-6 border-r border-white/10 flex flex-col overflow-hidden">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-10 group cursor-pointer">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
          <BrainCircuit className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">Admin<span className="text-blue-400">IA</span></h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Control Center</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-3">
            <h3 className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black px-4">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${isActive
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    )}
                    <Icon
                      size={20}
                      className={`${isActive ? 'text-blue-400' : 'group-hover:text-white'} transition-colors duration-300`}
                    />
                    <span className="font-semibold text-sm">{item.label}</span>

                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status - Premium Card */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 opacity-10 group-hover:rotate-12 transition-transform duration-500">
            <Activity className="text-blue-400" size={60} />
          </div>

          <h4 className="text-white text-xs font-bold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Status
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/40">Core Engine</span>
              <span className="text-green-400 font-bold uppercase tracking-tighter">Running</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/40">Efficiency</span>
              <span className="text-white font-mono">98.4%</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;