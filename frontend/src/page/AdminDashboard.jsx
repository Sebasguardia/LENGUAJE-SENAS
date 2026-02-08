import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';


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
import DashboardHome from '../components/admin/DashboardHome';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Obtener usuario actual desde localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      const user = JSON.parse(stored);
      if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'super_admin') {
        return user;
      }
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
      const stored = localStorage.getItem('userData');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('user-profile-updated', handleProfileUpdate);
  }, []);

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'super_admin';

  const hasPermission = (sectionKey) => {
    if (isSuperAdmin) return true;
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
      const allSections = ['analytics', 'modules', 'users', 'capture', 'training', 'database', 'settings'];
      const firstAllowed = allSections.find(s => hasPermission(s));
      if (firstAllowed) setActiveSection(firstAllowed);
    }
  }, []);

  const handleLogout = () => {
    // Lógica de logout aquí
    navigate('/login');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false); // Cerrar sidebar en móvil al seleccionar
  };

  const renderAccessDenied = () => (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="bg-slate-900/50 border border-white/10 p-12 rounded-[2.5rem] text-center max-w-md backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300">
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
      default:
        return <StatsCards />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex overflow-hidden">
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
        />

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;