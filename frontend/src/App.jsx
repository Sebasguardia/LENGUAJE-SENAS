import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Landing from './page/Landing';
import Login from './page/Login';
import Register from './page/Register';
import ForgotPassword from './page/ForgotPassword';
import Dashboard from './page/Dashboard';
import PracticeMode from './page/PracticeMode';
import UserProfile from './page/UserProfile';
import AdminDashboard from './page/AdminDashboard';
import ModuleLearning from './page/ModuleLearning';
import PasswordChange from './page/PasswordChange';
import { Toaster, toast } from 'react-hot-toast';
import AchievementToast from './components/common/AchievementToast';
import { checkNewAchievements } from './data/achievements';
import { getUserStats } from './data/userProgress';

// Guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Guard for admin users
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.role === 'admin' || userData.role === 'super_admin' || userData.role === 'superadmin';

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

function AchievementListener() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('userData'));
      if (stored && stored.id) {
        const stats = getUserStats(stored.id);
        const newUnlocks = checkNewAchievements(stats);

        newUnlocks.forEach(badge => {
          toast.custom((t) => (
            <AchievementToast t={t} badge={badge} />
          ), {
            duration: 4000,
            position: 'bottom-right'
          });
        });
      }
    } catch (e) {
      console.warn("Achievement check skipped", e);
    }
  }, [pathname]);

  return null;
}

import { adminService } from './api/adminService';
import MaintenancePage from './pages/MaintenancePage';

function App() {
  const [config, setConfig] = React.useState({
    maintenance_mode: 'false',
    site_name: 'Lenguaje de Señas IA',
    public_registration: 'true'
  });
  const [loadingConfig, setLoadingConfig] = React.useState(true);

  const fetchConfig = async () => {
    try {
      const settings = await adminService.getPublicSettings();
      setConfig(settings);

      if (settings.site_name) {
        document.title = settings.site_name;
      }

      localStorage.setItem('public_config', JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to fetch config", e);
    } finally {
      setLoadingConfig(false);
    }
  };

  React.useEffect(() => {
    fetchConfig();

    const handleUpdate = () => fetchConfig();
    window.addEventListener('site-config-updated', handleUpdate);

    // Global 401 detector (simplified alternative to interceptor redirect)
    const handleUnauthorized = () => {
      window.location.href = '/login?expired=true';
    };
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('site-config-updated', handleUpdate);
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  if (loadingConfig) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center animate-pulse text-lg font-bold tracking-widest">CARGANDO SISTEMA IA...</div>;

  // Global Maintenance Mode Guard
  if (config.maintenance_mode === 'true' || config.maintenance_mode === true) {
    return <MaintenancePage />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster />
      <AchievementListener />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ProtectedRoute><PasswordChange /></ProtectedRoute>} />

        {/* User Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><PracticeMode /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/module/:moduleId" element={<ProtectedRoute><ModuleLearning /></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Maintenance Route (Optional access) */}
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;