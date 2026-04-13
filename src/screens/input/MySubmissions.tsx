import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Report {
  id: string;
  userId: string;
  siteId: string;
  tradeId: string;
  workDate: string;
  workFront?: string;
  status: string;
  submittedAt?: string;
  createdAt: string;
  labor?: any[];
  plant?: any[];
  progress?: any;
}

export default function MySubmissions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'submitted'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [user, filter]);

  const loadReports = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const snap = await getDocs(query(
        collection(db, 'reports'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      ));
      let all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Report));

      if (filter !== 'all') {
        all = all.filter(r => r.status === filter);
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
      submitted: { color: 'bg-teal-600', label: 'Submitted' },
      adopted: { color: 'bg-green-600', label: 'Adopted' },
      duplicate: { color: 'bg-orange-600', label: 'Duplicate' },
      excluded: { color: 'bg-red-600', label: 'Excluded' },
    };
    const badge = badges[status] || { color: 'bg-gray-600', label: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">📜</div>
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📜 My Submissions</h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">← Back</button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'submitted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-bold ${filter === f ? 'bg-teal-600' : 'bg-gray-700'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">No Reports Yet</h2>
            <p className="text-gray-400 mb-6">Submit your first daily report!</p>
            <button onClick={() => navigate('/input/site-trade')} className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-bold">
              ➕ New Report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="p-4 bg-gray-800 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-lg">{report.workDate}</p>
                    <p className="text-gray-400 text-sm">
                      {report.siteId} • {report.tradeId}
                    </p>
                    {report.workFront && (
                      <p className="text-gray-500 text-sm">📍 {report.workFront}</p>
                    )}
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>👥 {report.labor?.length || 0} roles</span>
                  <span>🚜 {report.plant?.length || 0} equipment</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 p-4 bg-gray-800 rounded-xl">
          <h3 className="text-lg font-bold mb-3">📊 Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-teal-400">{reports.filter(r => r.status === 'submitted').length}</p>
              <p className="text-sm text-gray-400">Submitted</p>
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
