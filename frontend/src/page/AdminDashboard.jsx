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
import LearnValidation from '../components/admin/LearnValidation'; // Nuevo componente

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
        return (
          <div className="space-y-6">
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModuleManager />
              <AnalyticsCharts />
            </div>
          </div>
        );
      case 'modules':
        return <ModuleManager />;
      case 'capture':
        return <DataCapture />;
      case 'training':
        return <TrainingSection />;
      case 'validation': // Nueva sección
        return <LearnValidation />;
      case 'analytics':
        return <AnalyticsCharts />;
      case 'users':
        return <UserManagement />;
      case 'database':
        return (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Gestión de Base de Datos</h2>
            <p className="text-white/80">Panel de administración de la base de datos...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Configuración del Sistema</h2>
            <p className="text-white/80">Configuraciones avanzadas del sistema...</p>
          </div>
        );
      default:
        return <StatsCards />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex">
      {/* Sidebar */}
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <AdminHeader 
          adminName={adminName} 
          onLogout={handleLogout} 
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;