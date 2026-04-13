import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { t } from '@/shared/i18n/i18n';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Site {
  id: string;
  projectName: string;
  siteName: string;
}

interface Trade {
  id: string;
  nameEn: string;
  nameZh: string;
  standardUnit: string;
}

export default function SiteTradeSelector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Load sites and trades from Firestore
  useEffect(() => {
    async function loadData() {
      try {
        const [sitesSnap, tradesSnap] = await Promise.all([
          getDocs(query(collection(db, 'sites'), where('active', '==', true))),
          getDocs(query(collection(db, 'trades'), where('active', '==', true))),
        ]);
        setSites(sitesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Site)));
        setTrades(tradesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Trade)));
      } catch (err: any) {
        console.error('Failed to load reference data:', err);
      }
    }
    loadData();
  }, []);

  const handleContinue = async () => {
    if (!selectedSite) {
      setError('Please select a site');
      return;
    }
    if (!selectedTrade) {
      setError('Please select a trade');
      return;
    }

    setLoading(true);
    setError('');

    try {
      navigate('/input/work-front', {
        state: {
          siteId: selectedSite,
          tradeId: selectedTrade,
          workDate,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to continue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('report.siteTrade.title')}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          ← {t('common.back')}
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="text-teal-400 font-bold">Step 1 of 9</span>
            <span>Site & Trade</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 w-[11%]"></div>
          </div>
        </div>

        {/* Work Date */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">📅 {t('report.workDate')}</h2>
          <input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            max={today}
            className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
          <p className="mt-2 text-sm text-gray-400">
            {t('report.workDate.hint')}
          </p>
        </section>

        {/* Site Selection */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🏢 {t('report.site')}</h2>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Site / 選擇工地</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.projectName} - {site.siteName}
              </option>
            ))}
          </select>
          {selectedSite && (
            <p className="mt-2 text-sm text-gray-400">
              ✅ Site selected
            </p>
          )}
        </section>

        {/* Trade Selection */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">👷 {t('report.trade')}</h2>
          <select
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Trade / 選擇工種</option>
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>
                {trade.nameEn} - {trade.nameZh} ({trade.standardUnit})
              </option>
            ))}
          </select>
          {selectedTrade && (
            <p className="mt-2 text-sm text-gray-400">
              ✅ Trade selected
            </p>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={loading || !selectedSite || !selectedTrade}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
          <p className="text-blue-200 text-sm">
            💡 <strong>Tip:</strong> You can submit multiple trades for the same site on the same day.
            Each trade gets its own report.
          </p>
        </div>
      </main>
    </div>
  );
}
