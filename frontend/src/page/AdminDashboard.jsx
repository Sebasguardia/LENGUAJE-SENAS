import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { authStorage } from '../utils/authStorage';


// Importar componentes modulares
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatsCards from '../components/admin/StatsCards';
import ModuleManager from '../components/admin/ModuleManager';
import DataCapture from '../components/admin/DataCapture';
import TrainingSection from '../components/admin/TrainingSection';
import AnalyticsCharts from '../components/admin/AnalyticsCharts';
import UserManagement from '../components/admin/UserManagement';
import DatabaseManager from '../components/admin/DatabaseManager';
import SystemSettings from '../components/admin/SystemSettings';
import ProfileSection from '../components/admin/ProfileSection';
import DashboardHome from '../components/admin/DashboardHome';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('admin_active_section') || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Obtener usuario actual desde authStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const user = authStorage.getUser();
    if (user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'super_admin')) {
      return user;
    }
    return {
      id: 1,
      full_name: 'Administrador Demo',
      name: 'Administrador Demo',
      role: 'superadmin',
      email: 'admin@sistema.com',
    };
  });

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      const user = authStorage.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'super_admin';

  const hasPermission = (sectionKey) => {
    if (isSuperAdmin) return true;
    if (sectionKey === 'profile') return true; // Fix: Always allow profile before checking permissions object
    if (!currentUser?.permissions) return false;
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

  // Set initial section to first allowed one if dashboard is not allowed
  React.useEffect(() => {
    if (!hasPermission('dashboard')) {
      const allSections = ['analytics', 'modules', 'users', 'capture', 'training', 'database', 'settings', 'profile'];
      const firstAllowed = allSections.find(s => hasPermission(s));
      if (firstAllowed) setActiveSection(firstAllowed);
    }
  }, []);

  const handleLogout = () => {
    // Lógica de logout aquí
    navigate('/login');
  };

  const handleSectionChange = (section) => {
    if (section === activeSection) return;
    
    setIsTransitioning(true);
    setSidebarOpen(false); // Cerrar sidebar en móvil al seleccionar
    
    // Simulate premium processing delay - Reduced for better responsiveness
    setTimeout(() => {
      setActiveSection(section);
      localStorage.setItem('admin_active_section', section);
      
      // Allow DOM to process before fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  const renderAccessDenied = () => (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="bg-[#0a0c10]/50 border border-white/10 p-12 rounded-[2.5rem] text-center max-w-md backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Shield size={40} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acceso Denegado</h2>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          No tienes los permisos necesarios para acceder a esta sección. Solicita acceso al administrador del sistema.
        </p>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 uppercase tracking-widest text-xs"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );

  const renderMainContent = () => {
    // Check permission for current activeSection
    if (!hasPermission(activeSection)) {
      return renderAccessDenied();
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'modules':
        return <ModuleManager />;
      case 'capture':
        return <DataCapture />;
      case 'training':
        return <TrainingSection />;
      case 'analytics':
        return <AnalyticsCharts />;
      case 'users':
        return <UserManagement />;
      case 'database':
        return <DatabaseManager />;
      case 'settings':
        return <SystemSettings />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <StatsCards />;
    }
  };

  return (
    <div className="h-screen dark:bg-[#05070a] bg-[#f8fafc] dark:text-white text-slate-900 flex overflow-hidden font-sans selection:bg-blue-500/30 relative transition-colors duration-500">
      {/* ── Background Infrastructure ──────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] dark:bg-blue-600/5 bg-blue-200/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] dark:bg-indigo-600/5 bg-indigo-100/20 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute inset-0 dark:opacity-[0.02] opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(rgba(100,116,139,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="flex w-full h-full relative z-10">
        {/* Sidebar - Responsive */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        currentUser={currentUser}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader
          user={currentUser}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onSectionChange={handleSectionChange}
        />

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto relative min-h-[80vh]">
            {isTransitioning && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center dark:bg-[#05070a]/40 bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-16 h-16 border-4 dark:border-blue-600/20 border-blue-600/10 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
                </div>
                <div className="flex flex-col items-center gap-3 mt-8">
                  <p className="dark:text-blue-400 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Cargando Entorno</p>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className={`transition-all duration-500 ease-in-out ${
          isTransitioning ? 'scale-95 opacity-0 translate-y-4' : ''
        }`}>
              {renderMainContent()}
            </div>
          </div>
        </main>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;