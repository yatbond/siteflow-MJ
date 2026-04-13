import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { router } from '@/routes';
import { initSentry } from '@/lib/sentry';
import { getInitialTheme, applyTheme, type Theme } from '@/shared/theme/theme';
import { ErrorBoundary } from '@sentry/react';
import { initializeReferenceData } from '@/db/syncService';

function Fallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">⚠️ Something went wrong</h1>
        <p className="text-gray-400 mb-6">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-lg"
        >
          Reload App
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Expose theme toggle globally for Settings screen
  useEffect(() => {
    (window as any).__siteflow_setTheme = setTheme;
  }, []);

  return <RouterProvider router={router} />;
}

function App() {
  useEffect(() => {
    initSentry();
    // Initialize reference data sync on app startup
    initializeReferenceData();
  }, []);

  return (
    <ErrorBoundary fallback={Fallback}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;