import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, LogOut, Settings, Bell, HelpCircle, 
  GraduationCap, MessageCircle, Sparkles 
} from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const userData = {
    name: "Ana García",
    role: "Estudiante",
    avatar: "👩‍🎓",
    level: "Intermedio"
  };

  const handleLogout = () => {
    // Lógica de logout
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 mb-8">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-75"></div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl relative z-10">
              <GraduationCap className="text-white" size={32} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Instituto de Lengua de Señas IA
            </h1>
            <p className="text-gray-600 text-sm">Plataforma de aprendizaje inteligente</p>
          </div>
        </div>

        {/* Información del usuario y controles */}
        <div className="flex items-center gap-6">
          {/* Hora actual */}
          <div className="text-right hidden md:block">
            <div className="text-2xl font-bold text-gray-900">{currentTime}</div>
            <div className="text-sm text-gray-600">Hoy es {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>

          {/* Notificaciones */}
          <button className="relative p-3 bg-white/50 rounded-xl border border-white/20 hover:bg-white/80 transition-all group">
            <Bell size={20} className="text-gray-700 group-hover:text-blue-600" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Ayuda */}
          <button className="p-3 bg-white/50 rounded-xl border border-white/20 hover:bg-white/80 transition-all group">
            <HelpCircle size={20} className="text-gray-700 group-hover:text-purple-600" />
          </button>

          {/* Perfil del usuario */}
          <div className="relative">
            <button 
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/50 transition-all group"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="text-2xl">{userData.avatar}</div>
              <div className="text-left hidden lg:block">
                <div className="font-semibold text-gray-900">{userData.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Sparkles size={12} className="text-yellow-500" />
                  Nivel {userData.level}
                </div>
              </div>
              <Settings size={16} className="text-gray-400 group-hover:text-gray-600" />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="font-semibold text-gray-900">{userData.name}</div>
                  <div className="text-sm text-gray-600">{userData.role}</div>
                </div>
                
                <button className="w-full px-4 py-3 text-left hover:bg-blue-50/50 transition-colors flex items-center gap-3">
                  <User size={18} className="text-gray-600" />
                  Mi perfil
                </button>
                
                <button className="w-full px-4 py-3 text-left hover:bg-blue-50/50 transition-colors flex items-center gap-3">
                  <MessageCircle size={18} className="text-gray-600" />
                  Configuración de voz
                </button>
                
                <div className="border-t border-white/10 my-2"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-red-50/50 transition-colors flex items-center gap-3 text-red-600"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;