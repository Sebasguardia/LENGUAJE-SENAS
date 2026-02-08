import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import AchievementToast from './components/common/AchievementToast';
import { checkNewAchievements } from './data/achievements';
import { getUserStats } from './data/userProgress';
import { adminService } from './api/adminService';

// Optimización: Carga Perezosa (Lazy Loading) de Vistas
const Landing = lazy(() => import('./page/Landing'));
const Login = lazy(() => import('./page/Login'));
const Register = lazy(() => import('./page/Register'));
const ForgotPassword = lazy(() => import('./page/ForgotPassword'));
const Dashboard = lazy(() => import('./page/Dashboard'));
const PracticeMode = lazy(() => import('./page/PracticeMode'));
const UserProfile = lazy(() => import('./page/UserProfile'));
const AdminDashboard = lazy(() => import('./page/AdminDashboard'));
const ModuleLearning = lazy(() => import('./page/ModuleLearning'));
const PasswordChange = lazy(() => import('./page/PasswordChange'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

// Skeleton de carga premium para transiciones
const ViewLoader = () => (
  <div className="min-h-screen bg-[#03070d] flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-600/20"></div>
    <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Sincronizando Interfaz...</p>
  </div>
);

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

function App() {
  const [config, setConfig] = React.useState({
    maintenance_mode: 'false',
    site_name: 'Lenguaje de Señas IA',
    public_registration: 'true'
  });
  const [loadingConfig, setLoadingConfig] = React.useState(true);

  const fetchConfig = async () => {
    try {
      // Intentar cargar primero de cache para velocidad instantánea
      const cached = localStorage.getItem('public_config');
      if (cached) {
        setConfig(JSON.parse(cached));
      }

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

  // Optimización: Prefetch de datos críticos
  const prefetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log("[Prefetch] Iniciando pre-carga de datos críticos...");
    try {
      const { authService } = await import('./api/authService');
      const { progressService } = await import('./api/progressService');
      const { moduleService } = await import('./api/moduleService');

      // Lanzar peticiones en paralelo para llenar el cache instantáneo
      await Promise.allSettled([
        authService.getMe(),
        progressService.getDashboardStats(),
        moduleService.getModules()
      ]);
      console.log("[Prefetch] Cache optimizado y listo.");
    } catch (e) {
      console.warn("Prefetch fallido", e);
    }
  };

  React.useEffect(() => {
    fetchConfig();
    prefetchData(); // Pre-cargar datos si ya hay token

    const handleUpdate = () => fetchConfig();
    window.addEventListener('site-config-updated', handleUpdate);

    const handleUnauthorized = () => {
      window.location.href = '/login?expired=true';
    };
    window.addEventListener('unauthorized', handleUnauthorized);

    // Escuchar login exitoso para disparar prefetch
    const handleLogin = () => prefetchData();
    window.addEventListener('login-success', handleLogin);

    return () => {
      window.removeEventListener('site-config-updated', handleUpdate);
      window.removeEventListener('unauthorized', handleUnauthorized);
      window.removeEventListener('login-success', handleLogin);
    };
  }, []);

  if (loadingConfig && !localStorage.getItem('public_config')) {
    return <ViewLoader />;
  }

  // Global Maintenance Mode Guard
  if (config.maintenance_mode === 'true' || config.maintenance_mode === true) {
    return <MaintenancePage />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster />
      <AchievementListener />
      <Suspense fallback={<ViewLoader />}>
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
      </Suspense>
    </Router>
  );
}

export default App;