import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import AchievementToast from './components/common/AchievementToast';
import { checkNewAchievements } from './data/achievements';
import { getUserStats } from './data/userProgress';
import { adminService } from './api/adminService';
import { authStorage } from './utils/authStorage';
import { ThemeProvider } from './context/ThemeContext';

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


// Skeleton de carga para transiciones - Ajustado para soportar light mode
const ViewLoader = () => {
  return (
    <div className="min-h-screen dark:bg-[#03070d] bg-slate-50 flex flex-col items-center justify-center space-y-6 transition-colors duration-500">
      <div className="relative">
        <div className="w-20 h-20 border-4 dark:border-blue-600/20 border-blue-600/10 rounded-full"></div>
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="dark:text-blue-400 text-blue-600 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Sincronizando Sistema</p>
        <div className="flex gap-1">
          {[1,2,3].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Guard for authenticated regular users (prevents admins from entering user views)
const ProtectedRoute = ({ children }) => {
  const token = authStorage.getToken();
  const userData = authStorage.getUser() || {};
  const isAdmin = userData.role === 'admin' || userData.role === 'super_admin' || userData.role === 'superadmin' || userData.role === 'SuperAdmin';

  if (!token) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  return children;
};

// Guard for admin users
const AdminRoute = ({ children }) => {
  const token = authStorage.getToken();
  const userData = authStorage.getUser() || {};
  const isAdmin = userData.role === 'admin' || userData.role === 'super_admin' || userData.role === 'superadmin';

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

function AchievementListener() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    try {
      const stored = authStorage.getUser();
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
  const [, setConfig] = React.useState({
    maintenance_mode: 'false',
    site_name: 'Lenguaje de Señas IA',
    public_registration: 'true'
  });
  const [loadingConfig, setLoadingConfig] = React.useState(true);

  const fetchConfig = React.useCallback(async () => {
    // 1. Cargar cache inmediatamente si existe
    const cached = localStorage.getItem('public_config');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setConfig(prev => ({ ...prev, ...parsed }));
        if (parsed.site_name) document.title = parsed.site_name;
        // Si hay cache, ya podemos mostrar la app
        setLoadingConfig(false);
      } catch (e) {
        console.warn("Error parsing cached config", e);
      }
    }

    try {
      // 2. Traer configuración fresca en background
      const settings = await adminService.getPublicSettings();
      setConfig(prev => {
        const next = { ...prev, ...settings };
        if (settings.site_name) document.title = settings.site_name;
        localStorage.setItem('public_config', JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error("[Config] Background sync error:", e.message);
    } finally {
      // 3. Garantizar que la app se desbloquee incluso sin cache
      setLoadingConfig(false);
    }
  }, []);

  // Optimización: Prefetch de datos críticos
  const prefetchData = async () => {
    const token = authStorage.getToken();
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

    // Polling de configuración: Actualizar cada 30 segundos para sincronización en tiempo real
    const pollingInterval = setInterval(fetchConfig, 30000);

    return () => {
      window.removeEventListener('site-config-updated', handleUpdate);
      window.removeEventListener('unauthorized', handleUnauthorized);
      window.removeEventListener('login-success', handleLogin);
      clearInterval(pollingInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingConfig && !localStorage.getItem('public_config')) {
    return <ViewLoader />;
  }

  // Global Maintenance Mode Guard



  return (
    <ThemeProvider>
      {loadingConfig && !localStorage.getItem('public_config') ? (
        <ViewLoader />
      ) : (
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

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      )}
    </ThemeProvider>
  );
}

export default App;