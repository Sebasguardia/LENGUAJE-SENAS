import React from 'react';
import {
  Home, Users, BookOpen, BarChart3, Award,
  Database, Settings, Camera, TrendingUp,
  LayoutDashboard, BrainCircuit, Activity
} from 'lucide-react';

const AdminSidebar = ({ activeSection, onSectionChange, currentUser, isOpen, onClose }) => {
  const [siteName, setSiteName] = React.useState('AdminIA');

  React.useEffect(() => {
    const loadConfig = () => {
      try {
        const config = localStorage.getItem('site_config');
        if (config) {
          const { siteName } = JSON.parse(config);
          if (siteName) setSiteName(siteName);
        }
      } catch (e) { console.error(e); }
    };

    loadConfig();
    window.addEventListener('site-config-updated', loadConfig);
    return () => window.removeEventListener('site-config-updated', loadConfig);
  }, []);

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'super_admin';

  const hasPermission = (sectionKey) => {
    if (isSuperAdmin) return true;
    if (!currentUser?.permissions) return false;
    // Map sidebar IDs to permission keys if they differ
    const mapping = {
      'modules': 'content',
      'analytics': 'analytics',
      'dashboard': 'dashboard',
      'users': 'users',
      'capture': 'capture',
      'training': 'training',
      'database': 'database',
      'settings': 'settings'
    };
    const permissionKey = mapping[sectionKey] || sectionKey;
    return currentUser.permissions[permissionKey] === true;
  };

  const menuGroups = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
      ].filter(item => hasPermission(item.id))
    },
    {
      title: 'Contenido',
      items: [
        { id: 'modules', label: 'Gestión de Módulos', icon: BookOpen },
        { id: 'users', label: 'Gestión de Usuarios', icon: Users },
      ].filter(item => hasPermission(item.id))
    },
    {
      title: 'Inteligencia Artificial',
      items: [
        { id: 'capture', label: 'Captura de Datos', icon: Camera },
        { id: 'training', label: 'Entrenamiento IA', icon: TrendingUp },
      ].filter(item => hasPermission(item.id))
    },
    {
      title: 'Sistema',
      items: [
        { id: 'database', label: 'Base de Datos', icon: Database },
        { id: 'settings', label: 'Configuración', icon: Settings }
      ].filter(item => hasPermission(item.id))
    }
  ].filter(group => group.items.length > 0);

  return (
    <>
      {/* Sidebar - Desktop: Siempre visible, Mobile: Drawer */}
      <aside className={`
        dark:bg-white/[0.02] bg-white backdrop-blur-3xl 
        w-64 sm:w-72 h-full p-4 sm:p-6 
        dark:border-r dark:border-white/5 border-r border-slate-200 
        flex flex-col overflow-hidden
        fixed lg:relative
        top-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center gap-2 sm:gap-3 px-2 mb-8 sm:mb-10 group cursor-pointer">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <div>
            <h2 className="dark:text-white text-slate-900 font-bold text-base sm:text-lg leading-tight">{siteName}</h2>
            <p className="dark:text-white/40 text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">Control Center</p>
          </div>
        </div>

        {/* Navigation Menu - Responsive spacing */}
        <div className="flex-1 overflow-y-auto space-y-6 sm:space-y-8 pr-2 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2 sm:space-y-3">
              <h3 className="dark:text-white/30 text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black px-3 sm:px-4">
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
                      className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-[1rem] transition-all duration-500 group relative border ${isActive
                        ? 'dark:bg-blue-500/10 bg-blue-50 dark:text-blue-400 text-blue-600 dark:border-blue-500/20 border-blue-200'
                        : 'dark:text-white/40 text-slate-500 dark:hover:bg-white/[0.04] hover:bg-slate-50 dark:hover:text-white hover:text-slate-900 border-transparent dark:hover:border-white/5 hover:border-slate-200'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 w-1 h-5 sm:h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                      )}
                      <Icon
                        size={18}
                        className={`${isActive ? 'dark:text-blue-400 text-blue-600' : 'dark:group-hover:text-white group-hover:text-slate-900'} transition-colors duration-300 sm:w-5 sm:h-5`}
                      />
                      <span className="font-semibold text-xs sm:text-sm">{item.label}</span>

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

        {/* System Status - Premium Card - Responsive */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 dark:border-t dark:border-white/5 border-t border-slate-200">
          <div className="p-4 sm:p-5 rounded-[1.5rem] dark:bg-white/[0.02] bg-slate-50 dark:border dark:border-white/5 border border-slate-200 relative overflow-hidden group dark:hover:bg-white/[0.04] hover:bg-slate-100 transition-colors shadow-sm dark:shadow-none">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Activity className="text-blue-400" size={50} />
            </div>

            <h4 className="dark:text-white text-slate-900 text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Status
            </h4>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="dark:text-white/40 text-slate-500">Core Engine</span>
                <span className="text-green-500 font-bold uppercase tracking-tighter">Running</span>
              </div>
              <div className="w-full h-1 dark:bg-white/5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="dark:text-white/40 text-slate-500">Efficiency</span>
                <span className="dark:text-white text-slate-800 font-mono">98.4%</span>
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
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }
          :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.2);
          }
        `}</style>
      </aside>
    </>
  );
};

export default AdminSidebar;