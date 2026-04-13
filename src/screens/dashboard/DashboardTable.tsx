import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Report {
  id: string;
  siteId: string;
  siteName: string;
  tradeId: string;
  tradeName: string;
  tradeNameZh: string;
  workFront: string;
  workDate: string;
  status: string;
  completionPercent: number;
  laborCount: number;
  plantCount: number;
  noWork: boolean;
  noWorkReason?: string;
  submittedAt: string;
  performanceIndex: number;
  targetRate: number;
  actualRate: number;
}

interface DashboardFilters {
  dateFrom: string;
  dateTo: string;
  siteId: string;
  tradeId: string;
  workFront: string;
  status: string;
}

const PERFORMANCE_COLORS = {
  red: { bg: 'bg-red-900/40', text: 'text-red-400', border: 'border-red-600' },
  yellow: { bg: 'bg-yellow-900/40', text: 'text-yellow-400', border: 'border-yellow-600' },
  green: { bg: 'bg-green-900/40', text: 'text-green-400', border: 'border-green-600' },
};

function getPerformanceColor(index: number): keyof typeof PERFORMANCE_COLORS {
  if (index < 0.8) return 'red';
  if (index < 0.9) return 'yellow';
  return 'green';
}

export default function DashboardTable() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEstimator = user?.role === 'estimator';

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    siteId: '',
    tradeId: '',
    workFront: '',
    status: '',
  });
  const [sortField, setSortField] = useState<'workDate' | 'performanceIndex' | 'siteName'>('workDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // In real app: query Firestore with filters
      // For now: mock data to demonstrate UI
      const mockReports: Report[] = [
        {
          id: '1', siteId: 'site-1', siteName: 'Kai Tak Site A / 啟德工地A',
          tradeId: 'trade-1', tradeName: 'Steel Fixer', tradeNameZh: '鋼筋工',
          workFront: 'Tower 1 - Level 10', workDate: '2026-04-12',
          status: 'adopted', completionPercent: 75, laborCount: 12, plantCount: 2,
          noWork: false, submittedAt: '2026-04-12T18:00:00Z',
          performanceIndex: 0.92, targetRate: 500, actualRate: 460,
        },
        {
          id: '2', siteId: 'site-1', siteName: 'Kai Tak Site A / 啟德工地A',
          tradeId: 'trade-2', tradeName: 'Concretor', tradeNameZh: '混凝土工',
          workFront: 'Tower 1 - Level 10', workDate: '2026-04-12',
          status: 'adopted', completionPercent: 100, laborCount: 8, plantCount: 1,
          noWork: false, submittedAt: '2026-04-12T17:30:00Z',
          performanceIndex: 1.05, targetRate: 30, actualRate: 31.5,
        },
        {
          id: '3', siteId: 'site-2', siteName: 'Tseung Kwan O Site B / 將軍澳工地B',
          tradeId: 'trade-3', tradeName: 'Excavator Operator', tradeNameZh: '挖土機操作員',
          workFront: 'Basement B2', workDate: '2026-04-11',
          status: 'adopted', completionPercent: 60, laborCount: 5, plantCount: 3,
          noWork: false, submittedAt: '2026-04-11T19:00:00Z',
          performanceIndex: 0.75, targetRate: 200, actualRate: 150,
        },
        {
          id: '4', siteId: 'site-1', siteName: 'Kai Tak Site A / 啟德工地A',
          tradeId: 'trade-1', tradeName: 'Steel Fixer', tradeNameZh: '鋼筋工',
          workFront: 'Tower 1 - Level 10', workDate: '2026-04-11',
          status: 'duplicate', completionPercent: 70, laborCount: 10, plantCount: 1,
          noWork: false, submittedAt: '2026-04-11T18:45:00Z',
          performanceIndex: 0.85, targetRate: 500, actualRate: 425,
        },
        {
          id: '5', siteId: 'site-3', siteName: 'Lantau Site C / 大嶼山工地C',
          tradeId: 'trade-4', tradeName: 'Scaffolder', tradeNameZh: '搭棚工',
          workFront: 'Block 2 - External', workDate: '2026-04-12',
          status: 'adopted', completionPercent: 0, laborCount: 0, plantCount: 0,
          noWork: true, noWorkReason: 'weather', submittedAt: '2026-04-12T09:00:00Z',
          performanceIndex: 0, targetRate: 100, actualRate: 0,
        },
      ];
      setReports(mockReports);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (filters.siteId) result = result.filter((r) => r.siteId === filters.siteId);
    if (filters.tradeId) result = result.filter((r) => r.tradeId === filters.tradeId);
    if (filters.workFront) result = result.filter((r) => r.workFront.toLowerCase().includes(filters.workFront.toLowerCase()));
    if (filters.status) result = result.filter((r) => r.status === filters.status);
    if (filters.dateFrom) result = result.filter((r) => r.workDate >= filters.dateFrom);
    if (filters.dateTo) result = result.filter((r) => r.workDate <= filters.dateTo);

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [reports, filters, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const avgPerformance = filteredReports.filter((r) => !r.noWork).length > 0
    ? filteredReports.filter((r) => !r.noWork).reduce((sum, r) => sum + r.performanceIndex, 0) / filteredReports.filter((r) => !r.noWork).length
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📊 Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/dashboard/chart')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">📈 Charts</button>
            {!isEstimator && (
              <button onClick={() => navigate('/dashboard/duplicates')} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg">🔀 Duplicates</button>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-teal-400">{filteredReports.length}</p>
            <p className="text-sm text-gray-400">Total Reports</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-blue-400">
              {filteredReports.filter((r) => !r.noWork).reduce((s, r) => s + r.laborCount, 0)}
            </p>
            <p className="text-sm text-gray-400">Total Workers</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className={`text-3xl font-bold ${avgPerformance >= 0.9 ? 'text-green-400' : avgPerformance >= 0.8 ? 'text-yellow-400' : 'text-red-400'}`}>
              {(avgPerformance * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-400">Avg Performance</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-orange-400">
              {filteredReports.filter((r) => r.status === 'duplicate').length}
            </p>
            <p className="text-sm text-gray-400">Duplicates</p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-800 rounded-xl mb-6">
          <h3 className="text-lg font-bold mb-3">🔍 Filters</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-400">From</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-400">To</label>
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Site</label>
              <select value={filters.siteId} onChange={(e) => setFilters({ ...filters, siteId: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded-lg text-sm">
                <option value="">All Sites</option>
                <option value="site-1">Kai Tak Site A</option>
                <option value="site-2">Tseung Kwan O Site B</option>
                <option value="site-3">Lantau Site C</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Trade</label>
              <select value={filters.tradeId} onChange={(e) => setFilters({ ...filters, tradeId: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded-lg text-sm">
                <option value="">All Trades</option>
                <option value="trade-1">Steel Fixer</option>
                <option value="trade-2">Concretor</option>
                <option value="trade-3">Excavator Operator</option>
                <option value="trade-4">Scaffolder</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Work Front</label>
              <input type="text" value={filters.workFront} onChange={(e) => setFilters({ ...filters, workFront: e.target.value })}
                placeholder="Search..." className="w-full p-2 bg-gray-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded-lg text-sm">
                <option value="">All</option>
                <option value="adopted">Adopted</option>
                <option value="duplicate">Duplicate</option>
                <option value="submitted">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-left cursor-pointer hover:text-teal-400" onClick={() => toggleSort('workDate')}>
                    Date {sortField === 'workDate' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="p-3 text-left">Site</th>
                  <th className="p-3 text-left">Trade</th>
                  <th className="p-3 text-left">Work Front</th>
                  <th className="p-3 text-center">Workers</th>
                  <th className="p-3 text-center">%</th>
<th className="p-3 text-center cursor-pointer hover:text-teal-400" onClick={() => toggleSort('performanceIndex')}>
                    PI {sortField === 'performanceIndex' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const pColor = report.noWork ? 'red' as const : getPerformanceColor(report.performanceIndex);
                  const colors = PERFORMANCE_COLORS[pColor];
                  return (
                    <tr key={report.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3">{report.workDate}</td>
                      <td className="p-3">{report.siteName}</td>
                      <td className="p-3">
                        <div>{report.tradeName}</div>
                        <div className="text-xs text-gray-500">{report.tradeNameZh}</div>
                      </td>
                      <td className="p-3">{report.workFront}</td>
                      <td className="p-3 text-center">{report.noWork ? '—' : report.laborCount}</td>
                      <td className="p-3 text-center">{report.noWork ? '—' : `${report.completionPercent}%`}</td>
                      <td className={`p-3 text-center font-bold ${colors.text}`}>
                        {report.noWork ? '🚫' : (report.performanceIndex * 100).toFixed(0) + '%'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          report.status === 'adopted' ? 'bg-green-900/50 text-green-400' :
                          report.status === 'duplicate' ? 'bg-orange-900/50 text-orange-400' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {isEstimator && (
          <div className="mt-6 p-3 bg-blue-900/30 border border-blue-600 rounded-lg text-blue-300 text-sm">
            👁️ Estimator/QS view — Read-only. Export available at /export.
          </div>
        )}
      </main>
    </div>
  );
}