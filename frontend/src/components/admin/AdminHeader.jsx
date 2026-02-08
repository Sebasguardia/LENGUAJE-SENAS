
import React, { useState, useEffect, useRef } from 'react';
import {
  LogOut, User, Settings, Bell, Search,
  ChevronDown, Moon, Sun, Monitor, Shield,
  Check, X, AlertTriangle, AlertCircle, Info, Menu
} from 'lucide-react';

import AdminProfile from './AdminProfile';
import { notificationService } from '../../api/notificationService';
import { toast } from 'react-hot-toast';

const AdminHeader = ({ user, onLogout, onMenuToggle }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Error fetching notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Error marking read", e);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error("Error clearing notifications", e);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSecs = Math.floor((now - date) / 1000);

    if (diffInSecs < 60) return 'Ahora';
    if (diffInSecs < 3600) return `Hace ${Math.floor(diffInSecs / 60)}min`;
    if (diffInSecs < 86400) return `Hace ${Math.floor(diffInSecs / 3600)}h`;
    return date.toLocaleDateString();
  };

  return (
    <header className="bg-slate-900/40 backdrop-blur-xl border-b border-white/10 h-16 sm:h-20 px-3 sm:px-6 lg:px-8 flex items-center sticky top-0 z-30 transition-all duration-300">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">

        {/* Left Side: Brand & Mobile Menu */}
        <div className="flex-1 flex items-center gap-2 sm:gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <Menu size={22} />
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
              onKeyDown={(e) => e.key === 'Enter' && toast.success(`Buscando: ${e.target.value}`)}
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

                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                          <Bell size={24} className="text-white/10" />
                        </div>
                        <h4 className="text-white/40 text-sm font-bold">No hay novedades</h4>
                        <p className="text-white/20 text-[10px] mt-1">Te avisaremos cuando suceda algo importante.</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-2xl flex gap-4 transition-all duration-300 relative group border ${notif.read
                            ? 'bg-transparent border-transparent opacity-50'
                            : 'bg-white/5 border-white/5 hover:border-blue-500/30 hover:bg-white/10'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'error' || notif.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                            notif.type === 'success' ? 'bg-green-500/20 text-green-400' :
                              notif.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                            {notif.category === 'user' && <User size={18} />}
                            {notif.category === 'system' && <AlertCircle size={18} />}
                            {notif.category === 'maintenance' && <Power size={18} />}
                            {notif.category === 'training' && <Cpu size={18} />}
                            {!['user', 'system', 'maintenance', 'training'].includes(notif.category) && <Bell size={18} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-bold leading-tight mb-1 truncate">{notif.title}</h4>
                            <p className="text-white/60 text-[11px] leading-relaxed line-clamp-2">{notif.message}</p>
                            <span className="text-white/30 text-[9px] font-medium mt-2 block flex items-center gap-1.5 uppercase tracking-wider">
                              <Info size={10} />
                              {formatTime(notif.created_at)}
                            </span>
                          </div>

                          {!notif.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                              className="absolute right-4 top-4 p-2 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Marcar como leída"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => toast.info("Cambio de tema no disponible en esta demo")}
              className="hidden sm:flex p-2.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300"
              title="Cambiar Tema"
            >
              <Monitor size={20} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          {/* User Profile Component */}
          <AdminProfile user={user} onLogout={onLogout} />

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