import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useTrades } from '@/hooks/useTrades';

interface ExportOptions {
  tradeId: string;
  siteId: string;
  workFront: string;
  dateFrom: string;
  dateTo: string;
  granularity: 'detail' | 'summary';
  includeLabor: boolean;
  includePlant: boolean;
  includeProgress: boolean;
}

export default function EstimatorExport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trades } = useTrades();

  const [options, setOptions] = useState<ExportOptions>({
    tradeId: '',
    siteId: '',
    workFront: '',
    dateFrom: '2026-04-01',
    dateTo: new Date().toISOString().split('T')[0],
    granularity: 'detail',
    includeLabor: true,
    includePlant: true,
    includeProgress: true,
  });

  const [exporting, setExporting] = useState(false);
  const [recordCount, setRecordCount] = useState(0);

  // Mock data preview
  const previewData = useMemo(() => {
    // In real app: query Firestore with filters
    return [
      {
        date: '2026-04-12',
        site: 'Kai Tak Site A',
        trade: 'Steel Fixer',
        workFront: 'Tower 1 - Level 10',
        labor: 12,
        plant: 2,
        completion: 75,
        pi: 0.92,
      },
      {
        date: '2026-04-11',
        site: 'Kai Tak Site A',
        trade: 'Steel Fixer',
        workFront: 'Tower 1 - Level 10',
        labor: 10,
        plant: 1,
        completion: 70,
        pi: 0.85,
      },
      {
        date: '2026-04-12',
        site: 'Kai Tak Site A',
        trade: 'Concretor',
        workFront: 'Tower 1 - Level 10',
        labor: 8,
        plant: 1,
        completion: 100,
        pi: 1.05,
      },
    ];
  }, [options]);

  const handleExport = async () => {
    setExporting(true);
    
    // Simulate CSV generation
    setTimeout(() => {
      const headers = ['Date', 'Site', 'Trade', 'Work Front', 'Labor Count', 'Plant Count', 'Completion %', 'PI'];
      const rows = previewData.map((d) => [
        d.date,
        d.site,
        d.trade,
        d.workFront,
        d.labor,
        d.plant,
        d.completion,
        d.pi,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `siteflow-export-${options.dateFrom}-${options.dateTo}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setExporting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📤 Export CSV</h1>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Dashboard
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded-xl">
          <h3 className="text-lg font-bold text-blue-300 mb-2">📊 Flexible Export Options</h3>
          <p className="text-blue-200 text-sm">
            Choose your scope: Project-wide, per Work Front, or specific trade. 
            Export detailed daily records or summarized totals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Options */}
          <div className="space-y-6">
            {/* Scope: Trade */}
            <div className="p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">1️⃣ Select Trade / 工種</h2>
              <select
                value={options.tradeId}
                onChange={(e) => setOptions({ ...options, tradeId: e.target.value })}
                className="w-full p-4 text-xl bg-gray-700 rounded-lg"
              >
                <option value="">All Trades</option>
                {trades.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {trade.nameEn} - {trade.nameZh}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope: Site */}
            <div className="p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">2️⃣ Select Site / 工地</h2>
              <select
                value={options.siteId}
                onChange={(e) => setOptions({ ...options, siteId: e.target.value })}
                className="w-full p-4 text-xl bg-gray-700 rounded-lg"
              >
                <option value="">All Sites (Project-wide)</option>
                <option value="site-1">Kai Tak Site A / 啟德工地A</option>
                <option value="site-2">Tseung Kwan O Site B / 將軍澳工地B</option>
                <option value="site-3">Lantau Site C / 大嶼山工地C</option>
              </select>
            </div>

            {/* Scope: Work Front */}
            <div className="p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">3️⃣ Work Front Filter</h2>
              <input
                type="text"
                value={options.workFront}
                onChange={(e) => setOptions({ ...options, workFront: e.target.value })}
                placeholder="e.g., Tower 1, Basement B2..."
                className="w-full p-4 text-xl bg-gray-700 rounded-lg"
              />
              <p className="text-sm text-gray-400 mt-2">Leave empty for all work fronts</p>
            </div>

            {/* Date Range */}
            <div className="p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">4️⃣ Date Range / 日期範圍</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">From</label>
                  <input
                    type="date"
                    value={options.dateFrom}
                    onChange={(e) => setOptions({ ...options, dateFrom: e.target.value })}
                    className="w-full p-3 bg-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">To</label>
                  <input
                    type="date"
                    value={options.dateTo}
                    onChange={(e) => setOptions({ ...options, dateTo: e.target.value })}
                    className="w-full p-3 bg-gray-700 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Granularity */}
            <div className="p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">5️⃣ Granularity / 詳細度</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setOptions({ ...options, granularity: 'detail' })}
                  className={`flex-1 py-4 rounded-lg text-lg font-bold ${
                    options.granularity === 'detail'
                      ? 'bg-teal-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  📋 Detail
                  <p className="text-sm font-normal mt-1">Daily records</p>
                </button>
                <button
                  onClick={() => setOptions({ ...options, granularity: 'summary' })}
                  className={`flex-1 py-4 rounded-lg text-lg font-bold ${
                    options.granularity === 'summary'
                      ? 'bg-teal-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  📊 Summary
                  <p className="text-sm font-normal mt-1">Totals by trade</p>
                </button>
              </div>
            </div>

            {/* Include Options */}
            <div className="p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">6️⃣ Include Fields</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-lg">
                  <input
                    type="checkbox"
                    checked={options.includeLabor}
                    onChange={(e) => setOptions({ ...options, includeLabor: e.target.checked })}
                    className="w-6 h-6"
                  />
                  👥 Labor Count
                </label>
                <label className="flex items-center gap-3 text-lg">
                  <input
                    type="checkbox"
                    checked={options.includePlant}
                    onChange={(e) => setOptions({ ...options, includePlant: e.target.checked })}
                    className="w-6 h-6"
                  />
                  🚜 Plant/Equipment
                </label>
                <label className="flex items-center gap-3 text-lg">
                  <input
                    type="checkbox"
                    checked={options.includeProgress}
                    onChange={(e) => setOptions({ ...options, includeProgress: e.target.checked })}
                    className="w-6 h-6"
                  />
                  📝 Progress & PI
                </label>
              </div>
            </div>
          </div>

          {/* Preview & Export */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-6 bg-teal-900/30 border border-teal-600 rounded-xl">
              <h2 className="text-xl font-bold mb-4">📊 Export Summary</h2>
              <div className="space-y-2 text-lg">
                <p><span className="text-gray-400">Trade:</span> {options.tradeId || 'All'}</p>
                <p><span className="text-gray-400">Site:</span> {options.siteId || 'All'}</p>
                <p><span className="text-gray-400">Work Front:</span> {options.workFront || 'All'}</p>
                <p><span className="text-gray-400">Date Range:</span> {options.dateFrom} to {options.dateTo}</p>
                <p><span className="text-gray-400">Granularity:</span> {options.granularity}</p>
                <p className="text-2xl font-bold text-teal-400 mt-4">
                  ~{previewData.length} records
                </p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">👀 Preview (first 3 rows)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Trade</th>
                      <th className="p-2 text-left">Site</th>
                      <th className="p-2 text-right">PI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-800">
                        <td className="p-2">{row.date}</td>
                        <td className="p-2">{row.trade}</td>
                        <td className="p-2">{row.site}</td>
                        <td className={`p-2 text-right font-bold ${
                          row.pi >= 0.9 ? 'text-green-400' : row.pi >= 0.8 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {(row.pi * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full py-6 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-xl text-2xl font-bold"
            >
              {exporting ? '⏳ Generating CSV...' : '📥 Download CSV'}
            </button>

            {/* Note */}
            <p className="text-sm text-gray-400 text-center">
              File will be saved to your Downloads folder
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}