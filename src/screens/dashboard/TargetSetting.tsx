import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { db as dexieDb } from '@/db/dexie';
import { useTrades } from '@/hooks/useTrades';

interface TargetRate {
  tradeId: string;
  siteId?: string;
  rate: number;
  unit: string;
  effectiveFrom: string;
  applyToAll: boolean;
}

export default function TargetSetting() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trades, getTradeById } = useTrades();
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [targetRate, setTargetRate] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [existingTargets, setExistingTargets] = useState<TargetRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadExistingTargets();
  }, []);

  const loadExistingTargets = async () => {
    try {
      const targets = await dexieDb.targetRates.toArray();
      setExistingTargets(targets);
    } catch (err) {
      console.error('Failed to load targets:', err);
    }
  };

  const handleSaveTarget = async () => {
    if (!selectedTrade) {
      setError('Please select a trade');
      return;
    }
    if (!targetRate || parseFloat(targetRate) <= 0) {
      setError('Please enter a valid target rate');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const trade = getTradeById(selectedTrade);
      if (!trade) throw new Error('Trade not found');

      const newTarget: TargetRate = {
        tradeId: selectedTrade,
        siteId: selectedSite || undefined,
        rate: parseFloat(targetRate),
        unit: trade.standardUnit,
        effectiveFrom,
        applyToAll,
      };

      // In real app: save to Firestore
      // For now: save to IndexedDB
      await dexieDb.targetRates.add({
        ...newTarget,
        createdAt: new Date().toISOString(),
        createdBy: user!.uid,
      });

      setSuccess('✅ Target rate saved successfully!');
      setTargetRate('');
      await loadExistingTargets();
    } catch (err: any) {
      setError(err.message || 'Failed to save target');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTarget = async (id: string) => {
    try {
      await dexieDb.targetRates.delete(id);
      setSuccess('✅ Target deleted');
      await loadExistingTargets();
    } catch (err) {
      setError('Failed to delete target');
    }
  };

  const selectedTradeData = selectedTrade ? getTradeById(selectedTrade) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🎯 Target Setting</h1>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Dashboard
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded-xl">
          <h3 className="text-lg font-bold text-blue-300 mb-2">💡 How Targets Work</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Target rates are used to calculate Performance Index (PI)</li>
            <li>• PI = Actual Rate ÷ Target Rate</li>
            <li>• PI ≥ 0.9 = 🟢 Green, 0.8-0.9 = 🟡 Yellow, &lt;0.8 = 🔴 Red</li>
            <li>• Targets can be global (all sites) or site-specific</li>
          </ul>
        </div>

        {/* Form */}
        <div className="p-6 bg-gray-800 rounded-xl mb-6">
          <h2 className="text-xl font-bold mb-4">📋 Set New Target Rate</h2>

          {/* Trade Selector */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-gray-300">Trade / 工種</label>
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full p-4 text-xl bg-gray-700 rounded-lg"
            >
              <option value="">Select Trade</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.nameEn} - {trade.nameZh} ({trade.standardUnit})
                </option>
              ))}
            </select>
          </div>

          {/* Site Selector (Optional) */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-gray-300">
              Site (Optional) <span className="text-gray-500">- Leave empty for global target</span>
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full p-4 text-xl bg-gray-700 rounded-lg"
            >
              <option value="">All Sites (Global Target)</option>
              <option value="site-1">Kai Tak Site A / 啟德工地A</option>
              <option value="site-2">Tseung Kwan O Site B / 將軍澳工地B</option>
              <option value="site-3">Lantau Site C / 大嶼山工地C</option>
            </select>
          </div>

          {/* Target Rate */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-gray-300">
              Target Rate {selectedTradeData && `(${selectedTradeData.standardUnit}/day)`}
            </label>
            <input
              type="number"
              step="0.1"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              placeholder="e.g., 500"
              className="w-full p-4 text-xl bg-gray-700 rounded-lg"
            />
          </div>

          {/* Effective Date */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-gray-300">Effective From / 生效日期</label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full p-4 text-xl bg-gray-700 rounded-lg"
            />
          </div>

          {/* Apply to All Toggle */}
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="applyToAll"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-6 h-6"
              />
              <label htmlFor="applyToAll" className="text-lg">
                🔄 Apply retroactively to all historical reports
              </label>
            </div>
            <p className="text-sm text-yellow-200 mt-2">
              ⚠️ This will recalculate Performance Index for all past reports for this trade.
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSaveTarget}
            disabled={loading || !selectedTrade || !targetRate}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
          >
            {loading ? 'Saving...' : '💾 Save Target Rate'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">
              {success}
            </div>
          )}
        </div>

        {/* Existing Targets */}
        {existingTargets.length > 0 && (
          <div className="p-6 bg-gray-800 rounded-xl">
            <h2 className="text-xl font-bold mb-4">📊 Existing Target Rates</h2>
            <div className="space-y-3">
              {existingTargets.map((target, idx) => {
                const trade = getTradeById(target.tradeId);
                return (
                  <div
                    key={idx}
                    className="p-4 bg-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">
                        {trade?.nameEn || target.tradeId} {target.siteId ? `(${target.siteId})` : '(All Sites)'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {target.rate} {target.unit}/day • Effective: {target.effectiveFrom}
                        {target.applyToAll && ' • 🔄 Retroactive'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTarget(target.tradeId + (target.siteId || ''))}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}