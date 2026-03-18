import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, LogOut, Settings, Bell, HelpCircle,
  MessageCircle, Sparkles, Search,
  ChevronDown, GraduationCap, Volume2, VolumeX, Trophy,
  Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getUserStats } from '../../data/userProgress';
import AchievementsModal from './AchievementsModal';
import { getGlobalRank } from '../../data/achievements';

import { authService } from '../../api/authService';
import { notificationService } from '../../api/notificationService';

const Header = ({ user, isMuted, setIsMuted }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifs(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const userName = user?.name || 'Estudiante';
  const userAvatar = user?.avatar || userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Obtener stats para el modal de logros
  const userStats = getUserStats(user?.id || 'demo-user');

  // Calcular rango dinámico basado en XP
  const globalRank = getGlobalRank(user?.xp || userStats.totalXP || 0);
  const userLevel = globalRank.tier;

  return (
    <header className={`sticky top-4 sm:top-6 z-50 transition-all duration-500 ${isScrolled ? 'px-2' : 'px-0'}`}>
      <div className={`mx-auto flex items-center justify-between px-3 sm:px-8 py-2 sm:py-3.5 rounded-[1.75rem] sm:rounded-[2.5rem] border transition-all duration-500 ${isScrolled
        ? 'dark:bg-[#0a0c10]/90 bg-white/90 backdrop-blur-3xl dark:border-white/10 border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
        : 'dark:bg-white/5 bg-white/80 backdrop-blur-2xl dark:border-white/5 border-slate-100 shadow-xl dark:shadow-none'
        }`}>

        {/* Brand & Search */}
        <div className="flex items-center gap-2 sm:gap-8">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <GraduationCap className="text-white" size={window.innerWidth < 640 ? 16 : 20} />
            </div>
            <div className="flex flex-col">
              <span className="dark:text-white text-slate-900 font-black tracking-tighter text-xs sm:text-lg leading-none transition-colors">SeñasIA</span>
              <p className="text-[7px] sm:text-[8px] text-blue-500 font-black uppercase tracking-widest leading-none mt-0.5 sm:mt-1">Portal</p>
            </div>
          </div>

          <div className="relative group hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-white/20 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="¿Qué quieres aprender hoy?"
              className="dark:bg-white/[0.03] bg-slate-100 border dark:border-white/5 border-slate-200 rounded-xl pl-12 pr-4 py-2 text-sm dark:text-white text-slate-900 dark:placeholder-white/20 placeholder-slate-400 focus:outline-none focus:border-blue-500/40 focus:dark:bg-[#0a0c10]/50 focus:bg-white focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all w-64"
            />
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-1 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 dark:border-r dark:border-white/10 border-r border-slate-200 mr-2">
            <div className="text-right">
              <p className="text-[10px] dark:text-white/30 text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Tu Racha</p>
              <div className="flex items-center gap-1.5 text-orange-400 font-bold text-sm">
                <Sparkles size={14} />
                <span>{user?.current_streak || 0} Días</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Mute/Unmute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${isMuted
                ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                : 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                }`}
              title={isMuted ? 'Activar voz del bot' : 'Silenciar voz del bot'}
            >
              {isMuted ? <VolumeX size={18} className="sm:w-[20px] sm:h-[20px]" /> : <Volume2 size={18} className="sm:w-[20px] sm:h-[20px]" />}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-all border border-blue-500/10"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} className="sm:w-[20px] sm:h-[20px]" /> : <Moon size={18} className="sm:w-[20px] sm:h-[20px]" />}
            </button>
            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all group relative"
              title="Sala de Trofeos"
            >
              <Trophy size={18} className="sm:w-[20px] sm:h-[20px]" />
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsDropdownOpen(false);
                }}
                className={`relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all group ${isNotifOpen ? 'text-blue-500 bg-blue-500/10' : 'dark:text-white/40 text-slate-500 dark:hover:text-white hover:text-blue-600 dark:hover:bg-white/5 hover:bg-slate-100'}`}
              >
                <Bell size={18} className="sm:w-[20px] sm:h-[20px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full dark:border-slate-900 border-white group-hover:animate-ping" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-24 sm:top-auto sm:mt-4 sm:w-96 dark:bg-[#0a0c10]/95 bg-white dark:border dark:border-white/10 border border-slate-200 rounded-[2rem] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="px-5 py-4 dark:border-b dark:border-white/5 border-b border-slate-100 flex items-center justify-between dark:bg-white/[0.02] bg-slate-50 gap-2">
                      <h3 className="dark:text-white text-slate-900 font-bold text-xs sm:text-sm truncate">Notificaciones</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[9px] sm:text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors whitespace-nowrap"
                        >
                          Marcar todo
                        </button>
                      )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white/20">
                            <Bell size={24} />
                          </div>
                          <p className="text-white/40 text-xs font-bold italic">No tienes notificaciones aún</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.read && handleMarkRead(notif.id)}
                            className={`px-6 py-4 dark:border-b dark:border-white/5 border-b border-slate-50 transition-colors cursor-pointer relative group ${notif.read ? 'bg-transparent opacity-60' : 'dark:bg-blue-500/5 bg-blue-50/50 hover:dark:bg-blue-500/10 hover:bg-blue-50'}`}
                          >
                            {!notif.read && (
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            )}
                            <div className="flex items-start gap-3">
                              {notif.type === 'success' && (
                                <div className="mt-0.5 p-1 rounded-md bg-yellow-500/10 text-yellow-500">
                                  <Trophy size={12} />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className={`text-xs leading-relaxed ${notif.read ? 'dark:text-white/60 text-slate-500' : 'dark:text-white text-slate-800 font-medium'}`}>
                                  {notif.message}
                                </p>
                                <span className="text-[9px] dark:text-white/20 text-slate-400 font-bold whitespace-nowrap mt-1 block">
                                  {new Date(notif.created_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-6 py-3 dark:bg-white/[0.02] bg-slate-50 text-center">
                      <p className="text-[9px] dark:text-white/20 text-slate-400 font-black uppercase tracking-[0.2em]">Centro de Alertas v1.0</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button className="p-2.5 rounded-xl dark:text-white/40 text-slate-500 hover:dark:text-white hover:text-blue-600 hover:dark:bg-white/5 hover:bg-slate-100 transition-all">
              <HelpCircle size={20} />
            </button>
          </div>

          <div className="relative ml-2">
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsNotifOpen(false);
                }}
                className={`flex items-center gap-3 px-2 py-1 rounded-full transition-all duration-300 border ${isDropdownOpen ? 'dark:bg-white/10 bg-blue-50 dark:border-white/20 border-blue-200' : 'dark:bg-white/5 bg-slate-100 border-transparent hover:dark:bg-white/10 hover:bg-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                  {userAvatar}
                </div>
                <div className="hidden md:block text-left pr-2">
                  <p className="dark:text-white text-slate-800 font-bold text-sm leading-none transition-colors">{userName}</p>
                  <p className="dark:text-white/40 text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Nivel {userLevel}</p>
                </div>
                <ChevronDown size={14} className={`dark:text-white/20 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-4 w-64 dark:bg-[#0a0c10]/95 bg-white dark:border dark:border-white/10 border border-slate-200 rounded-[2rem] shadow-2xl py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 dark:border-b dark:border-white/5 border-b border-slate-100 mb-2 dark:bg-white/[0.02] bg-slate-50">
                    <p className="dark:text-white text-slate-900 font-bold text-sm truncate">{userName}</p>
                    <p className="dark:text-white/30 text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Nivel {userLevel}</p>
                  </div>

                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center gap-3 px-6 py-3 dark:text-white/60 text-slate-600 hover:dark:text-white hover:text-blue-600 hover:dark:bg-white/5 hover:bg-slate-100 transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    <User size={16} className="text-blue-500" />
                    Mi Perfil
                  </button>


                  <div className="h-px dark:bg-white/5 bg-slate-100 my-3 mx-6" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-xs font-black uppercase tracking-widest"
                  >
                    <LogOut size={16} />
                    Salir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />
    </header>
  );
};

export default Header;