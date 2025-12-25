
import React, { useState, useEffect, useRef } from 'react';
import {
  LogOut, User, Settings, Bell, Search,
  ChevronDown, Moon, Sun, Monitor, Shield,
  Check, X, AlertTriangle, AlertCircle, Info, Menu
} from 'lucide-react';

const AdminHeader = ({ adminName, onLogout }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'Backup Pendiente', message: 'El sistema requiere un respaldo manual crítico.', time: 'Hace 5min', read: false },
    { id: 2, type: 'success', title: 'Entrenamiento Completado', message: 'Modelo "Vocales v2" finalizado con 98% de precisión.', time: 'Hace 2h', read: false },
    { id: 3, type: 'info', title: 'Nuevo Admin Registrado', message: 'Usuario "Carlos Dev" añadido al equipo.', time: 'Ayer', read: true },
  ]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setShowNotifications(false);
  }

  return (
    <header className="bg-slate-900/40 backdrop-blur-xl border-b border-white/10 h-20 px-8 flex items-center sticky top-0 z-30 transition-all duration-300">
      <div className="w-full flex items-center justify-between gap-8">

        {/* Left Side: Brand & Mobile Menu */}
        <div className="flex-1 flex items-center gap-4">
          <button className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Menu size={24} />
          </button>
          <div className="hidden md:flex items-center gap-3">
            <div className={`p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 transition-all duration-500 ${isSearchFocused ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
              <Shield size={18} />
            </div>
            <h1 className={`text-xl font-bold text-white tracking-tight transition-all duration-500 ${isSearchFocused ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
              Control <span className="text-blue-400">Panel</span>
            </h1>
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-[2] max-w-xl hidden lg:block">
          <div className={`relative transition-all duration-300 transform ${isSearchFocused ? 'scale-[1.02]' : 'scale-100'}`}>
            <Search
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isSearchFocused ? 'text-blue-400' : 'text-white/30'
                }`}
            />
            <input
              type="text"
              placeholder="Buscar (Comando + K)"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none transition-all outline-none ${isSearchFocused
                  ? 'border-blue-500/50 bg-slate-900 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                  : 'border-white/10 hover:border-white/20'
                }`}
            />
            {!isSearchFocused && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white/30 font-mono">⌘K</kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6">

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl transition-all duration-300 relative group ${showNotifications ? 'bg-blue-500/10 text-blue-400' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Bell size={20} className={unreadCount > 0 ? 'animate-swing' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                )}
              </button>

              {/* Dropdown Content */}
              {showNotifications && (
                <div className="absolute top-14 right-0 w-80 sm:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <h3 className="text-white font-bold text-sm">Notificaciones</h3>
                    {notifications.length > 0 && (
                      <button onClick={handleClearAll} className="text-[10px] text-white/40 hover:text-white uppercase font-bold tracking-widest transition-colors">
                        Limpiar Todo
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-white/30 text-xs italic">
                        No hay notificaciones nuevas
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-3 rounded-xl flex gap-3 transition-colors relative group ${notif.read ? 'bg-transparent opacity-60' : 'bg-white/5 border border-white/5'}`}>
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'alert' ? 'bg-red-500' :
                              notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                          <div className="flex-1">
                            <h4 className="text-white text-sm font-bold leading-tight mb-1">{notif.title}</h4>
                            <p className="text-white/60 text-xs leading-relaxed">{notif.message}</p>
                            <span className="text-white/20 text-[10px] mt-2 block">{notif.time}</span>
                          </div>
                          {!notif.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                              className="absolute right-2 top-2 p-1.5 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Marcar como leída"
                            >
                              <Check size={12} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="hidden sm:flex p-2.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300" title="Cambiar Tema">
              <Monitor size={20} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-2 group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{adminName}</p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Super Admin</p>
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden relative">
                    {/* Avatar Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 to-slate-900 opacity-50"></div>
                    <span className="relative z-10 font-black text-lg text-white">SA</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-white/10">
                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
              </div>
            </button>

            {/* Profile Menu Popup */}
            {showProfileMenu && (
              <div className="absolute top-16 right-0 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                <div className="p-3 border-b border-white/5 mb-2">
                  <p className="text-white text-sm font-bold">Cuenta de Administrador</p>
                  <p className="text-white/40 text-xs truncate">admin@lenguajesen.as</p>
                </div>

                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-xs font-bold transition-all">
                    <User size={16} /> Ver Perfil
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-xs font-bold transition-all">
                    <Settings size={16} /> Ajustes Personales
                  </button>
                  <div className="h-px bg-white/5 my-1"></div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-white hover:bg-red-500 text-xs font-bold transition-all group"
                  >
                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
      <style>{`
        @keyframes swing {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(15deg); }
            40% { transform: rotate(-10deg); }
            60% { transform: rotate(5deg); }
            80% { transform: rotate(-5deg); }
        }
        .animate-swing { animation: swing 1s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </header>
  );
};

export default AdminHeader;