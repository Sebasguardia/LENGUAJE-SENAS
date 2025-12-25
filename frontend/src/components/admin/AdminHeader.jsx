import React from 'react';
import { LogOut, User, Settings, Bell } from 'lucide-react';

const AdminHeader = ({ adminName, onLogout }) => {
  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="text-white/60">Gestión completa del sistema de aprendizaje</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors">
            <Bell size={20} />
          </button>
          
          <button className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors">
            <Settings size={20} />
          </button>
          
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <User size={20} className="text-white" />
            <span className="text-white font-medium">{adminName}</span>
          </div>
          
          <button 
            onClick={onLogout}
            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-500/30 transition-colors"
          >
            <LogOut size={20} />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;