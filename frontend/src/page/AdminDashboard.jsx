import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


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
  const [adminName] = useState('Administrador Principal');

  const handleLogout = () => {
    // Lógica de logout aquí
    navigate('/login');
  };

  const renderMainContent = () => {
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
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader
          adminName={adminName}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;