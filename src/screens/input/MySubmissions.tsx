import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { db as dexieDb } from '@/db/dexie';
import type { DraftReport } from '@/db/dexie';

export default function MySubmissions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<DraftReport[]>([]);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [user, filter]);

  const loadReports = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = dexieDb.draftReports.where('userId').equals(user.uid);
      let all = await query.toArray();

      // Sort by date descending
      all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      if (filter !== 'all') {
        all = all.filter((r) => r.status === filter);
      }

      setReports(all);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      draft: { color: 'bg-gray-600', label: 'Draft' },
      pending_submit: { color: 'bg-yellow-600', label: 'Submitting' },
      submitted: { color: 'bg-teal-600', label: 'Submitted' },
      adopted: { color: 'bg-green-600', label: 'Adopted' },
      duplicate: { color: 'bg-orange-600', label: 'Duplicate' },
      excluded: { color: 'bg-red-600', label: 'Excluded' },
    };
    const badge = badges[status] || { color: 'bg-gray-600', label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📜 My Submissions</h1>
        <button
          onClick={() => navigate('/input/site-trade')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg"
        >
          ➕ New
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'draft', 'submitted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${filter === f ? 'bg-teal-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl animate-pulse mb-4">📋</div>
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-xl mb-2">No reports yet</p>
            <p className="text-sm">Start your first daily report!</p>
            <button
              onClick={() => navigate('/input/site-trade')}
              className="mt-6 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-lg"
            >
              ➕ Create Report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-gray-800 rounded-xl border border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-lg font-bold">{report.workDate}</p>
                    <p className="text-gray-400 text-sm">
                      {report.siteId} • {report.tradeId}
                    </p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                {report.data?.workFront && (
                  <p className="text-gray-300 text-sm">📍 {report.data.workFront as string}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Updated: {new Date(report.updatedAt).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' })}
                </p>
                {report.status === 'draft' && (
                  <button
                    onClick={() => navigate('/input/work-front', { state: { draftId: report.id } })}
                    className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm"
                  >
                    ✏️ Continue
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 p-4 bg-gray-800 rounded-xl">
          <h3 className="text-lg font-bold mb-3">📊 Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-teal-400">{reports.filter((r) => r.status === 'submitted').length}</p>
              <p className="text-sm text-gray-400">Submitted</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">{reports.filter((r) => r.status === 'draft').length}</p>
              <p className="text-sm text-gray-400">Drafts</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-400">{reports.length}</p>
              <p className="text-sm text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}