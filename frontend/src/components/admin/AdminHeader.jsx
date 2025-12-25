import React, { useState } from 'react';
import {
  LogOut, User, Settings, Bell, Search,
  ChevronDown, Moon, Sun, Monitor, Shield
} from 'lucide-react';

const AdminHeader = ({ adminName, onLogout }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="bg-slate-900/20 backdrop-blur-xl border-b border-white/10 h-20 px-8 flex items-center sticky top-0 z-30">
      <div className="w-full flex items-center justify-between gap-8">

        {/* Left Side: Dynamic Greeting or Page Title */}
        <div className="flex-1 hidden md:block">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-blue-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Control <span className="text-blue-400">Panel</span>
            </h1>
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-[2] max-w-xl hidden lg:block">
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : 'scale-100'}`}>
            <Search
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isSearchFocused ? 'text-blue-400' : 'text-white/30'
                }`}
            />
            <input
              type="text"
              placeholder="Buscar usuarios, módulos o analíticas..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all outline-none"
            />
            {!isSearchFocused && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white/30">⌘</kbd>
                <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white/30">K</kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6">

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2.5 text-white/60 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-xl transition-all duration-300 relative group">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Notificaciones
              </div>
            </button>
            <button className="hidden sm:flex p-2.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300">
              <Monitor size={20} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{adminName}</p>
              <div className="flex items-center justify-end gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Super Admin</p>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User size={24} className="text-white" />
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="ml-2 p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 group/logout shadow-lg"
              title="Cerrar Sesión"
            >
              <LogOut size={20} className="group-hover/logout:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;