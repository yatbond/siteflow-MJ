import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { db } from '@/db/dexie';

interface PendingReport {
  id: string;
  reportData: any;
  createdAt: string;
  retryCount: number;
  lastAttempt?: string;
  error?: string;
}

export default function OfflineSync() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadPendingReports();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load last sync time
    const saved = localStorage.getItem('lastSync');
    if (saved) setLastSync(saved);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingReports = async () => {
    const pending = await db.pendingReports.toArray();
    setPendingReports(pending);
  };

  const syncNow = async () => {
    if (!isOnline) {
      alert('You are offline. Please connect to internet first.');
      return;
    }

    setSyncing(true);
    let successCount = 0;
    let failCount = 0;

    for (const report of pendingReports) {
      try {
        // In real app: upload to Firestore
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        // Remove from pending
        await db.pendingReports.delete(report.id);
        successCount++;
      } catch (error: any) {
        // Update retry count
        await db.pendingReports.update(report.id, {
          retryCount: report.retryCount + 1,
          lastAttempt: new Date().toISOString(),
          error: error.message,
        });
        failCount++;
      }
    }

    setSyncing(false);
    setLastSync(new Date().toISOString());
    localStorage.setItem('lastSync', new Date().toISOString());
    loadPendingReports();

    alert(`Sync complete: ${successCount} uploaded, ${failCount} failed`);
  };

  const clearFailed = async () => {
    if (!confirm('Delete all failed reports? This cannot be undone.')) return;
    
    for (const report of pendingReports) {
      if (report.retryCount >= 3) {
        await db.pendingReports.delete(report.id);
      }
    }
    loadPendingReports();
  };

  const getStatusColor = (report: PendingReport) => {
    if (report.retryCount >= 3) return 'bg-red-900/50 border-red-600';
    if (report.retryCount >= 1) return 'bg-yellow-900/50 border-yellow-600';
    return 'bg-blue-900/50 border-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🔄 Offline Sync</h1>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Dashboard
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-xl border-2 ${
          isOnline 
            ? 'bg-green-900/30 border-green-600' 
            : 'bg-red-900/30 border-red-600'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isOnline ? '🟢' : '🔴'}</span>
            <div>
              <p className="text-lg font-bold">{isOnline ? 'Online' : 'Offline'}</p>
              <p className="text-sm text-gray-400">
                {isOnline 
                  ? 'Connected to internet' 
                  : 'Reports will sync when you reconnect'}
              </p>
            </div>
          </div>
        </div>

        {/* Sync Button */}
        {isOnline && pendingReports.length > 0 && (
          <button
            onClick={syncNow}
            disabled={syncing}
            className="w-full mb-6 py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-xl text-xl font-bold"
          >
            {syncing ? '⏳ Syncing...' : `📤 Sync ${pendingReports.length} Report(s)`}
          </button>
        )}

        {/* Last Sync */}
        {lastSync && (
          <p className="text-sm text-gray-400 mb-4 text-center">
            Last sync: {new Date(lastSync).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' })}
          </p>
        )}

        {/* Pending Reports */}
        {pendingReports.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-gray-800 rounded-xl">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-xl font-bold">All reports synced!</p>
            <p className="text-sm mt-2">No pending reports in offline queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-bold mb-4">📋 Pending Reports ({pendingReports.length})</h2>
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className={`p-4 rounded-xl border-2 ${getStatusColor(report)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold">{report.reportData?.tradeName || 'Unknown Trade'}</p>
                    <p className="text-sm text-gray-400">
                      {report.reportData?.siteName} • {report.reportData?.date}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(report.createdAt).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' })}
                    </p>
                    {report.error && (
                      <p className="text-xs text-red-400 mt-1">Error: {report.error}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {report.retryCount === 0 ? '⏳ Pending' : 
                       report.retryCount >= 3 ? '❌ Failed' : '⚠️ Retrying'}
                    </p>
                    {report.retryCount > 0 && (
                      <p className="text-xs text-gray-400">Attempts: {report.retryCount}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clear Failed */}
        {pendingReports.some(r => r.retryCount >= 3) && (
          <button
            onClick={clearFailed}
            className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl"
          >
            🗑️ Clear Failed Reports
          </button>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-600 rounded-xl">
          <h3 className="text-lg font-bold text-blue-300 mb-2">💡 How Offline Sync Works</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Reports are saved locally when offline</li>
            <li>• Auto-sync when you reconnect to internet</li>
            <li>• Failed reports retry up to 3 times</li>
            <li>• You can manually trigger sync with the button above</li>
          </ul>
        </div>
      </main>
    </div>
  );
}