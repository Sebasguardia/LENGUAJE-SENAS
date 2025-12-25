import React from 'react';
import { 
  Home, Users, BookOpen, BarChart3,Award ,
  Database, Settings, Camera, TrendingUp 
} from 'lucide-react';

const AdminSidebar = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'modules', label: 'Gestión de Módulos', icon: BookOpen },
    { id: 'capture', label: 'Captura de Datos', icon: Camera },
    { id: 'training', label: 'Entrenamiento IA', icon: TrendingUp },
    { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
    { id: 'users', label: 'Gestión de Usuarios', icon: Users },
    { id: 'database', label: 'Base de Datos', icon: Database },
    { id: 'settings', label: 'Configuración', icon: Settings },
    { id: 'validation', label: 'Validación IA', icon: Award }
  ];

  return (
    <aside className="bg-white/10 backdrop-blur-xl w-64 min-h-screen p-4 border-r border-white/20">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Información del sistema */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
        <h4 className="text-white font-semibold mb-2">Estado del Sistema</h4>
        <div className="space-y-1 text-sm text-white/60">
          <div className="flex justify-between">
            <span>IA:</span>
            <span className="text-green-400">Activa</span>
          </div>
          <div className="flex justify-between">
            <span>Base de datos:</span>
            <span className="text-green-400">Conectada</span>
          </div>
          <div className="flex justify-between">
            <span>Usuarios activos:</span>
            <span className="text-blue-400">24</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;