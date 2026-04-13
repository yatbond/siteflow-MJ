import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { db as dexieDb } from '@/db/dexie';
import type { DraftReport } from '@/db/dexie';

interface DuplicateGroup {
  groupId: string;
  key: string; // hash of siteId+tradeId+workDate+workFront
  reports: DraftReport[];
  adoptedId?: string;
}

export default function DuplicateResolution() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    setLoading(true);
    try {
      const allReports = await dexieDb.draftReports
        .where('userId')
        .equals(user!.uid)
        .toArray();

      // Group by duplicate key (site+trade+date+workFront)
      const groupMap = new Map<string, DraftReport[]>();
      allReports.forEach((report) => {
        if (report.status === 'duplicate' || report.data?.duplicateGroupId) {
          const key = report.data?.duplicateGroupId || 
            `${report.siteId}|${report.tradeId}|${report.workDate}|${report.data?.workFront || ''}`;
          if (!groupMap.has(key)) groupMap.set(key, []);
          groupMap.get(key)!.push(report);
        }
      });

      const duplicateGroups: DuplicateGroup[] = Array.from(groupMap.entries()).map(([key, reports]) => ({
        groupId: `dup-${key.split('|').join('-')}`,
        key,
        reports: reports.sort((a, b) => 
          new Date(b.submittedAt || b.updatedAt).getTime() - new Date(a.submittedAt || a.updatedAt).getTime()
        ),
        adoptedId: reports.find((r) => r.status === 'adopted')?.id,
      })).filter((g) => g.reports.length > 1);

      setGroups(duplicateGroups);
    } catch (err) {
      console.error('Failed to load duplicates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = async (groupId: string, reportId: string) => {
    setResolving(reportId);
    try {
      const group = groups.find((g) => g.groupId === groupId);
      if (!group) return;

      // Mark selected as adopted, others as excluded
      for (const report of group.reports) {
        const status = report.id === reportId ? 'adopted' : 'excluded';
        await dexieDb.draftReports.update(report.id, {
          status,
          duplicateGroupId: groupId,
          updatedAt: new Date().toISOString(),
        });
      }

      await loadDuplicates();
    } catch (err) {
      console.error('Failed to resolve duplicate:', err);
    } finally {
      setResolving(null);
    }
  };

  const handleExcludeAll = async (groupId: string) => {
    setResolving(groupId);
    try {
      const group = groups.find((g) => g.groupId === groupId);
      if (!group) return;

      for (const report of group.reports) {
        await dexieDb.draftReports.update(report.id, {
          status: 'excluded',
          duplicateGroupId: groupId,
          updatedAt: new Date().toISOString(),
        });
      }

      await loadDuplicates();
    } catch (err) {
      console.error('Failed to exclude duplicates:', err);
    } finally {
      setResolving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">🔀</div>
          <p className="text-xl">Loading duplicates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🔀 Duplicate Resolution</h1>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Dashboard
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* Summary */}
        <div className="mb-6 p-4 bg-orange-900/30 border border-orange-600 rounded-xl">
          <h2 className="text-xl font-bold text-orange-300 mb-2">
            ⚠️ {groups.length} Duplicate Group{groups.length !== 1 ? 's' : ''} Found
          </h2>
          <p className="text-gray-300">
            Reports with the same Site + Trade + Date + Work Front are flagged as duplicates.
            Choose which one to <strong className="text-green-400">Adopt</strong> (keep) and which to <strong className="text-red-400">Exclude</strong> (discard).
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl">No duplicates to resolve!</p>
            <p className="text-sm mt-2">All reports are unique.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.groupId} className="p-6 bg-gray-800 rounded-xl border border-orange-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-orange-300">
                      Group {group.groupId}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {group.reports[0]?.siteId} • {group.reports[0]?.tradeId} • {group.reports[0]?.workDate}
                    </p>
                    <p className="text-sm text-gray-400">
                      📍 {group.reports[0]?.data?.workFront as string || 'N/A'}
                    </p>
                  </div>
                  {group.adoptedId && (
                    <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm font-bold">
                      ✅ Resolved
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {group.reports.map((report, idx) => {
                    const isAdopted = report.status === 'adopted';
                    const isExcluded = report.status === 'excluded';
                    const isPending = !isAdopted && !isExcluded;

                    return (
                      <div
                        key={report.id}
                        className={`p-4 rounded-lg border ${
                          isAdopted
                            ? 'bg-green-900/30 border-green-600'
                            : isExcluded
                            ? 'bg-red-900/30 border-red-600 opacity-60'
                            : 'bg-gray-700 border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">
                              {isAdopted && '✅ '}
                              {isExcluded && '❌ '}
                              Report #{idx + 1}
                            </p>
                            <p className="text-sm text-gray-400">
                              Submitted: {new Date(report.submittedAt || report.updatedAt).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' })}
                            </p>
                            <p className="text-sm text-gray-400">
                              Completion: {(report.data as any)?.progress?.completionPercent || 0}% •
                              Workers: {((report.data as any)?.labor as any[] || []).reduce((s, l) => s + l.count, 0)}
                            </p>
                          </div>
                          {isPending && (
                            <button
                              onClick={() => handleAdopt(group.groupId, report.id)}
                              disabled={!!resolving}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold"
                            >
                              {resolving === report.id ? '...' : 'Adopt This'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!group.adoptedId && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleExcludeAll(group.groupId)}
                      disabled={!!resolving}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg"
                    >
                      {resolving === group.groupId ? '...' : '❌ Exclude All (Create New Report)'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}