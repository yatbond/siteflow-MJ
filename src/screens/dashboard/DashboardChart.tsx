import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

interface DataPoint {
  date: string;
  label: string;
  value: number;
  target: number;
}

export default function DashboardChart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEstimator = user?.role === 'estimator';
  const [chartType, setChartType] = useState<'bar' | 'trend'>('bar');
  const [metric, setMetric] = useState<'performance' | 'workers' | 'completion'>('performance');

  // Mock chart data
  const chartData: DataPoint[] = useMemo(() => [
    { date: '2026-04-06', label: 'Mon', value: 0.88, target: 0.9 },
    { date: '2026-04-07', label: 'Tue', value: 0.92, target: 0.9 },
    { date: '2026-04-08', label: 'Wed', value: 0.75, target: 0.9 },
    { date: '2026-04-09', label: 'Thu', value: 0.95, target: 0.9 },
    { date: '2026-04-10', label: 'Fri', value: 0.82, target: 0.9 },
    { date: '2026-04-11', label: 'Sat', value: 0.91, target: 0.9 },
    { date: '2026-04-12', label: 'Sun', value: 0.87, target: 0.9 },
  ], []);

  const maxValue = Math.max(...chartData.map((d) => Math.max(d.value, d.target)));
  const minValue = Math.min(...chartData.map((d) => d.value));

  const getColor = (value: number) => {
    if (metric !== 'performance') return 'bg-teal-500';
    if (value < 0.8) return 'bg-red-500';
    if (value < 0.9) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📈 Charts</h1>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            📊 Table
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* Chart Type Toggle */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setChartType('bar')} className={`px-4 py-2 rounded-lg ${chartType === 'bar' ? 'bg-teal-600' : 'bg-gray-700'}`}>
            📊 Bar Chart
          </button>
          <button onClick={() => setChartType('trend')} className={`px-4 py-2 rounded-lg ${chartType === 'trend' ? 'bg-teal-600' : 'bg-gray-700'}`}>
            📈 Trendline
          </button>
        </div>

        {/* Metric Selector */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMetric('performance')} className={`px-3 py-1 rounded text-sm ${metric === 'performance' ? 'bg-teal-600' : 'bg-gray-700'}`}>
            Performance Index
          </button>
          <button onClick={() => setMetric('workers')} className={`px-3 py-1 rounded text-sm ${metric === 'workers' ? 'bg-teal-600' : 'bg-gray-700'}`}>
            Worker Count
          </button>
          <button onClick={() => setMetric('completion')} className={`px-3 py-1 rounded text-sm ${metric === 'completion' ? 'bg-teal-600' : 'bg-gray-700'}`}>
            Completion %
          </button>
        </div>

        {/* Chart Area */}
        <div className="p-6 bg-gray-800 rounded-xl mb-6">
          <h3 className="text-lg font-bold mb-4">
            {metric === 'performance' ? 'Performance Index' : metric === 'workers' ? 'Worker Count' : 'Completion %'} — Last 7 Days
          </h3>

          {/* SVG Chart */}
          <div className="relative h-64">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
              <span>{(maxValue * (metric === 'performance' ? 100 : 1)).toFixed(0)}</span>
              <span>{((maxValue + minValue) / 2 * (metric === 'performance' ? 100 : 1)).toFixed(0)}</span>
              <span>{(minValue * (metric === 'performance' ? 100 : 1)).toFixed(0)}</span>
            </div>

            {/* Chart body */}
            <div className="ml-14 h-full flex items-end gap-2">
              {chartData.map((point, idx) => {
                const barHeight = (point.value / maxValue) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative">
                    {/* Target line */}
                    <div
                      className="absolute w-full border-t-2 border-dashed border-gray-500"
                      style={{ bottom: `${(point.target / maxValue) * 100}%` }}
                    />
                    {/* Bar */}
                    <div
                      className={`w-full max-w-12 rounded-t-lg ${getColor(point.value)} transition-all duration-300`}
                      style={{ height: `${barHeight}%` }}
                    >
                      <div className="text-center text-xs font-bold mt-1">
                        {(point.value * (metric === 'performance' ? 100 : 1)).toFixed(0)}
                      </div>
                    </div>
                    {/* X-axis label */}
                    <div className="text-xs text-gray-400 mt-2">{point.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" /> ≥ 90%
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" /> 80-90%
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" /> &lt; 80%
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-t-2 border-dashed border-gray-500" /> Target
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-400">
              {(chartData.filter((d) => d.value >= 0.9).length / chartData.length * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-400">Days ≥ Target</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-teal-400">
              {(chartData.reduce((s, d) => s + d.value, 0) / chartData.length * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-400">Average PI</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-red-400">
              {(chartData.filter((d) => d.value < 0.8).length)}
            </p>
            <p className="text-sm text-gray-400">Red Days</p>
          </div>
        </div>
      </main>
    </div>
  );
}