import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

interface Scenario {
  name: string;
  targetMultiplier: number;
  description: string;
}

export default function RetroactiveAnalysis() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-12');
  const [baselineTarget, setBaselineTarget] = useState(100);
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { name: 'Optimistic', targetMultiplier: 0.9, description: 'Target reduced by 10%' },
    { name: 'Baseline', targetMultiplier: 1.0, description: 'Current target' },
    { name: 'Pessimistic', targetMultiplier: 1.1, description: 'Target increased by 10%' },
  ]);

  // Mock historical data
  const historicalData = useMemo(() => [
    { date: '2026-04-01', actual: 95, pi: 0.95 },
    { date: '2026-04-02', actual: 88, pi: 0.88 },
    { date: '2026-04-03', actual: 102, pi: 1.02 },
    { date: '2026-04-04', actual: 78, pi: 0.78 },
    { date: '2026-04-05', actual: 91, pi: 0.91 },
    { date: '2026-04-06', actual: 85, pi: 0.85 },
    { date: '2026-04-07', actual: 93, pi: 0.93 },
    { date: '2026-04-08', actual: 105, pi: 1.05 },
    { date: '2026-04-09', actual: 82, pi: 0.82 },
    { date: '2026-04-10', actual: 97, pi: 0.97 },
    { date: '2026-04-11', actual: 89, pi: 0.89 },
    { date: '2026-04-12', actual: 94, pi: 0.94 },
  ], []);

  const calculateScenario = (multiplier: number) => {
    const newTarget = baselineTarget * multiplier;
    const days = historicalData.map((d) => ({
      ...d,
      newPi: d.actual / newTarget,
    }));

    const avgPi = days.reduce((s, d) => s + d.newPi, 0) / days.length;
    const greenDays = days.filter((d) => d.newPi >= 0.9).length;
    const redDays = days.filter((d) => d.newPi < 0.8).length;

    return { avgPi, greenDays, redDays, days };
  };

  const scenarioResults = scenarios.map((s) => ({
    ...s,
    ...calculateScenario(s.targetMultiplier),
  }));

  const bestScenario = scenarioResults.reduce((best, s) =>
    s.avgPi > best.avgPi ? s : best
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🔮 Retroactive Analysis</h1>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Dashboard
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* Info Box */}
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-600 rounded-xl">
          <h3 className="text-lg font-bold text-purple-300 mb-2">🤔 What-If Analysis</h3>
          <p className="text-purple-200 text-sm">
            See how changing target rates would have affected historical Performance Index.
            Useful for setting realistic targets based on past performance.
          </p>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-800 rounded-xl mb-6">
          <h2 className="text-xl font-bold mb-4">📊 Analysis Parameters</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Trade</label>
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg"
              >
                <option value="">All Trades</option>
                <option value="trade-1">Steel Fixer</option>
                <option value="trade-2">Concretor</option>
                <option value="trade-3">Excavator Operator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Site</label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg"
              >
                <option value="">All Sites</option>
                <option value="site-1">Kai Tak Site A</option>
                <option value="site-2">Tseung Kwan O Site B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Baseline Target Rate (units/day)
              </label>
              <input
                type="number"
                value={baselineTarget}
                onChange={(e) => setBaselineTarget(parseFloat(e.target.value) || 0)}
                className="w-full p-3 bg-gray-700 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {scenarioResults.map((scenario, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl border-2 ${
                scenario === bestScenario
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <h3 className={`text-lg font-bold mb-2 ${
                scenario === bestScenario ? 'text-green-400' : 'text-white'
              }`}>
                {scenario.name}
              </h3>
              <p className="text-sm text-gray-400 mb-4">{scenario.description}</p>
              
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-teal-400">
                    {(scenario.avgPi * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-400">Avg Performance Index</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">🟢 {scenario.greenDays} days ≥90%</span>
                  <span className="text-red-400">🔴 {scenario.redDays} days &lt;80%</span>
                </div>
              </div>

              {scenario === bestScenario && (
                <div className="mt-4 px-3 py-1 bg-green-600 rounded-full text-sm font-bold text-center">
                  ⭐ Best Outcome
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detailed Table */}
        <div className="p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">📋 Daily Breakdown (Baseline Scenario)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-right">Actual</th>
                  <th className="p-3 text-right">Target</th>
                  <th className="p-3 text-right">PI</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.map((day, idx) => {
                  const pi = day.actual / baselineTarget;
                  const status = pi >= 0.9 ? '🟢' : pi >= 0.8 ? '🟡' : '🔴';
                  return (
                    <tr key={idx} className="border-b border-gray-800">
                      <td className="p-3">{day.date}</td>
                      <td className="p-3 text-right">{day.actual}</td>
                      <td className="p-3 text-right">{baselineTarget}</td>
                      <td className={`p-3 text-right font-bold ${
                        pi >= 0.9 ? 'text-green-400' : pi >= 0.8 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {(pi * 100).toFixed(0)}%
                      </td>
                      <td className="p-3 text-center">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-6 p-6 bg-blue-900/30 border border-blue-600 rounded-xl">
          <h3 className="text-lg font-bold text-blue-300 mb-2">💡 Recommendation</h3>
          <p className="text-blue-200">
            Based on historical data, a target rate of <strong className="text-white">
              {(baselineTarget * bestScenario.targetMultiplier).toFixed(1)} units/day
            </strong> would achieve{' '}
            <strong className="text-green-400">{(bestScenario.avgPi * 100).toFixed(0)}% avg PI</strong> with{' '}
            <strong className="text-green-400">{bestScenario.greenDays} green days</strong> out of{' '}
            {historicalData.length} days analyzed.
          </p>
        </div>
      </main>
    </div>
  );
}