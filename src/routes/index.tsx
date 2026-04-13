import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import type { UserRole } from '@/features/auth/AuthContext';
import LoginScreen from '@/features/auth/LoginScreen';
import PinChangeScreen from '@/features/auth/PinChangeScreen';
import SettingsScreen from '@/features/settings/SettingsScreen';

const getRoleHome = (role: UserRole) => {
  if (role === 'foreman' || role === 'subcontractor') return '/input/site-trade';
  if (role === 'manager' || role === 'estimator' || role === 'superuser') return '/dashboard';
  return '/input/site-trade';
};

// ─── Input Flow screens (Phase 3) ────────────────────────────────────────────
import SiteTradeSelector from '@/screens/input/SiteTradeSelector';
import WorkFrontEntry from '@/screens/input/WorkFrontEntry';
import WorkSourceEntry from '@/screens/input/WorkSourceEntry';
import ResourceLog from '@/screens/input/ResourceLog';
import ProgressPhotos from '@/screens/input/ProgressPhotos';
import FinalOutput from '@/screens/input/FinalOutput';
import SubmitConfirm from '@/screens/input/SubmitConfirm';
import MySubmissions from '@/screens/input/MySubmissions';

// ─── Dashboard screens (Phase 4-5) ───────────────────────────────────────────
import DashboardTable from '@/screens/dashboard/DashboardTable';
import DashboardChart from '@/screens/dashboard/DashboardChart';
import DuplicateResolution from '@/screens/dashboard/DuplicateResolution';
import TargetSetting from '@/screens/dashboard/TargetSetting';
import RetroactiveAnalysis from '@/screens/dashboard/RetroactiveAnalysis';

// ─── Estimator screens (Phase 6) ─────────────────────────────────────────────
import EstimatorExport from '@/screens/estimator/EstimatorExport';

// ─── Admin screens (Phase 7) ─────────────────────────────────────────────────
import AdminUsers from '@/screens/admin/AdminUsers';
import AdminReference from '@/screens/admin/AdminReference';
import AdminProjects from '@/screens/admin/AdminProjects';
import AdminAudit from '@/screens/admin/AdminAudit';

// ─── Settings screens (Phase 8) ──────────────────────────────────────────────
import OfflineSync from '@/screens/settings/OfflineSync';

// ─── Layout ───────────────────────────────────────────────────────────────────
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-900">
        <h1 className="text-xl font-black tracking-tight">🌿 SiteFlow</h1>
        <nav className="flex items-center gap-2">
          {user && (
            <span className="text-sm text-gray-400 hidden sm:block">{user.displayName}</span>
          )}
          <a
            href="/settings"
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            ⚙️
          </a>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};

// ─── Loading screen ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="text-teal-400 text-xl animate-pulse">Loading…</div>
  </div>
);

// ─── Protected route wrapper ─────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  // Force PIN change on first login (phone users)
  if (user.firstLogin && location.pathname !== '/pin-change') {
    return <Navigate to="/pin-change" replace />;
  }

  // Role-based access check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <Layout>{children}</Layout>;
};

export const router = createBrowserRouter([
  // Public
  { path: '/login', element: <LoginScreen /> },
  { path: '/pin-change', element: <ProtectedRoute><PinChangeScreen /></ProtectedRoute> },

  // Foreman / Subcontractor input flow
  { path: '/input/site-trade', element: <ProtectedRoute roles={['foreman', 'subcontractor']}><SiteTradeSelector /></ProtectedRoute> },
  { path: '/input/work-front', element: <ProtectedRoute><WorkFrontEntry /></ProtectedRoute> },
  { path: '/input/work-source', element: <ProtectedRoute><WorkSourceEntry /></ProtectedRoute> },
  { path: '/input/resources', element: <ProtectedRoute><ResourceLog /></ProtectedRoute> },
  { path: '/input/progress', element: <ProtectedRoute><ProgressPhotos /></ProtectedRoute> },
  { path: '/input/final', element: <ProtectedRoute><FinalOutput /></ProtectedRoute> },
  { path: '/input/confirm-copy', element: <ProtectedRoute><FinalOutput /></ProtectedRoute> },
  { path: '/input/submit', element: <ProtectedRoute><SubmitConfirm /></ProtectedRoute> },
  { path: '/my-submissions', element: <ProtectedRoute roles={['foreman', 'subcontractor']}><MySubmissions /></ProtectedRoute> },

  // Manager / Estimator dashboards
  { path: '/dashboard', element: <ProtectedRoute roles={['manager', 'estimator', 'superuser']}><DashboardTable /></ProtectedRoute> },
  { path: '/dashboard/chart', element: <ProtectedRoute roles={['manager', 'estimator', 'superuser']}><DashboardChart /></ProtectedRoute> },
  { path: '/dashboard/retroactive', element: <ProtectedRoute roles={['manager', 'superuser']}><RetroactiveAnalysis /></ProtectedRoute> },
  { path: '/dashboard/duplicates', element: <ProtectedRoute roles={['manager', 'superuser']}><DuplicateResolution /></ProtectedRoute> },
  { path: '/dashboard/targets', element: <ProtectedRoute roles={['manager', 'superuser']}><TargetSetting /></ProtectedRoute> },
  { path: '/export', element: <ProtectedRoute roles={['estimator', 'superuser']}><EstimatorExport /></ProtectedRoute> },

  // Admin — superuser only
  { path: '/admin', element: <Navigate to="/admin/users" replace /> },
  { path: '/admin/users', element: <ProtectedRoute roles={['superuser']}><AdminUsers /></ProtectedRoute> },
  { path: '/admin/reference', element: <ProtectedRoute roles={['superuser']}><AdminReference /></ProtectedRoute> },
  { path: '/admin/projects', element: <ProtectedRoute roles={['superuser']}><AdminProjects /></ProtectedRoute> },
  { path: '/admin/audit', element: <ProtectedRoute roles={['superuser']}><AdminAudit /></ProtectedRoute> },

  // Settings — all authenticated roles
  { path: '/settings', element: <ProtectedRoute><SettingsScreen /></ProtectedRoute> },
  { path: '/settings/offline', element: <ProtectedRoute><OfflineSync /></ProtectedRoute> },

  // Root redirect
  { path: '/', element: <Navigate to="/login" replace /> },
]);

// Re-export RouterProvider for App.tsx
export { RouterProvider };
