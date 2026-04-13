import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'report' | 'user' | 'project' | 'site' | 'reference' | 'target';
  targetId: string;
  targetName: string;
  changes?: Record<string, any>;
  ip?: string;
}

export default function AdminAudit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState({
    actionType: '',
    userType: '',
    dateFrom: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    // Mock data - in real app: query Firestore /auditLogs collection
    const mockLogs: AuditLog[] = [
      {
        id: 'log-1',
        timestamp: '2026-04-12T10:30:00Z',
        userId: 'user-2',
        userName: 'Lee Kwok Fai',
        action: 'report.adopted',
        targetType: 'report',
        targetId: 'rpt-123',
        targetName: 'Steel Fixer - 2026-04-12',
        changes: { status: 'pending_resolution → adopted' },
      },
      {
        id: 'log-2',
        timestamp: '2026-04-12T09:15:00Z',
        userId: 'user-1',
        userName: 'Chan Tai Man',
        action: 'report.submitted',
        targetType: 'report',
        targetId: 'rpt-124',
        targetName: 'Concretor - 2026-04-12',
      },
      {
        id: 'log-3',
        timestamp: '2026-04-11T18:00:00Z',
        userId: 'user-2',
        userName: 'Lee Kwok Fai',
        action: 'target.set',
        targetType: 'target',
        targetId: 'tgt-steel',
        targetName: 'Steel Fixer Target Rate',
        changes: { rate: '450 → 500 kg/day' },
      },
      {
        id: 'log-4',
        timestamp: '2026-04-11T14:30:00Z',
        userId: 'user-4',
        userName: 'Superuser Admin',
        action: 'user.created',
        targetType: 'user',
        targetId: 'user-5',
        targetName: 'New Foreman',
        changes: { role: 'foreman', siteIds: ['site-1'] },
      },
      {
        id: 'log-5',
        timestamp: '2026-04-10T16:45:00Z',
        userId: 'user-2',
        userName: 'Lee Kwok Fai',
        action: 'report.excluded',
        targetType: 'report',
        targetId: 'rpt-120',
        targetName: 'Steel Fixer - 2026-04-10 (Duplicate)',
        changes: { status: 'duplicate → excluded' },
      },
    ];
    setLogs(mockLogs);
    setLoading(false);
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      'report.submitted': '📤',
      'report.adopted': '✅',
      'report.excluded': '❌',
      'report.edited': '✏️',
      'target.set': '🎯',
      'target.updated': '🔄',
      'user.created': '👤',
      'user.updated': '✏️',
      'user.deleted': '🗑️',
      'site.activated': '✅',
      'site.deactivated': '❌',
      'reference.updated': '📚',
    };
    return icons[action] || '📝';
  };

  const filteredLogs = logs.filter((log) => {
    const logDate = log.timestamp.split('T')[0];
    if (filter.dateFrom && logDate < filter.dateFrom) return false;
    if (filter.dateTo && logDate > filter.dateTo) return false;
    if (filter.actionType && !log.action.includes(filter.actionType)) return false;
    if (filter.userType && !log.userName.toLowerCase().includes(filter.userType.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📋 Audit Log</h1>
        <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Admin
        </button>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {/* Info Box */}
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-600 rounded-xl">
          <h3 className="text-lg font-bold text-purple-300 mb-2">🔍 Audit Trail</h3>
          <p className="text-purple-200 text-sm">
            All critical actions are logged for compliance and accountability. 
            Logs are retained for 10 years minimum (PRD §4.6).
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-800 rounded-xl mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">From</label>
              <input
                type="date"
                value={filter.dateFrom}
                onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">To</label>
              <input
                type="date"
                value={filter.dateTo}
                onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Action Type</label>
              <select
                value={filter.actionType}
                onChange={(e) => setFilter({ ...filter, actionType: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded-lg text-sm"
              >
                <option value="">All Actions</option>
                <option value="report">Reports</option>
                <option value="target">Targets</option>
                <option value="user">Users</option>
                <option value="site">Sites</option>
                <option value="reference">Reference Data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Search User</label>
              <input
                type="text"
                value={filter.userType}
                onChange={(e) => setFilter({ ...filter, userType: e.target.value })}
                placeholder="Name..."
                className="w-full p-2 bg-gray-700 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-white">{filteredLogs.length}</p>
            <p className="text-sm text-gray-400">Filtered Logs</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-blue-400">
              {filteredLogs.filter((l) => l.targetType === 'report').length}
            </p>
            <p className="text-sm text-gray-400">Report Actions</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {filteredLogs.filter((l) => l.targetType === 'target').length}
            </p>
            <p className="text-sm text-gray-400">Target Changes</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-400">
              {filteredLogs.filter((l) => l.targetType === 'user').length}
            </p>
            <p className="text-sm text-gray-400">User Actions</p>
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-left">Timestamp</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Target</th>
                  <th className="p-3 text-left">Changes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3">
                      <p className="text-gray-300">
                        {new Date(log.timestamp).toLocaleDateString('en-HK', { timeZone: 'Asia/Hong_Kong' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString('en-HK', { timeZone: 'Asia/Hong_Kong' })}
                      </p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getActionIcon(log.action)}</span>
                        <span className="font-mono text-xs bg-gray-700 px-2 py-1 rounded">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-bold">{log.userName}</p>
                      <p className="text-xs text-gray-500">{log.userId}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-300">{log.targetName}</p>
                      <p className="text-xs text-gray-500">
                        {log.targetType} • {log.targetId}
                      </p>
                    </td>
                    <td className="p-3">
                      {log.changes ? (
                        <pre className="text-xs bg-gray-700 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Export */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => alert('Export audit log to CSV')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg"
          >
            📥 Export CSV
          </button>
        </div>
      </main>
    </div>
  );
}