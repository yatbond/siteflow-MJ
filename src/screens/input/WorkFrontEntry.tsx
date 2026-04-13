import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '@/shared/i18n/i18n';

export default function WorkFrontEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { siteId, tradeId, workDate } = location.state || {};
  
  const [workFront, setWorkFront] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const workFrontHistory = [
    'Tower 1 - Level 10',
    'Tower 1 - Level 11',
    'Tower 2 - Podium Level 3',
    'Basement B2',
    'Basement B3',
    'Main Entrance',
    'Car Park Level 1',
    'Roof',
  ];

  const handleSearch = (query: string) => {
    setWorkFront(query);
    if (query.trim()) {
      const filtered = workFrontHistory.filter((wf) =>
        wf.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setWorkFront(suggestion);
    setSuggestions([]);
  };

  const handleContinue = async () => {
    if (!workFront.trim()) {
      setError('Please enter work front location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      navigate('/input/work-source', { 
        state: { 
          siteId, 
          tradeId, 
          workDate, 
          workFront 
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('report.workFront.title')}</h1>
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
            <span className="text-teal-400 font-bold">Step 2 of 9</span>
            <span>Work Front</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 w-[22%]"></div>
          </div>
        </div>

        {/* Work Front Input */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">📍 {t('report.workFront.label')}</h2>
          
          <div className="relative">
            <input
              type="text"
              value={workFront}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="e.g., Tower 1 - Level 10 / 1 座 - 10 樓"
              className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full p-4 text-left hover:bg-gray-700 border-b border-gray-700 last:border-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-400">
            {t('report.workFront.hint')}
          </p>
        </section>

        {/* Recent Work Fronts */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🕐 Recent / 最近</h2>
          <div className="space-y-2">
            {workFrontHistory.slice(0, 5).map((wf, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(wf)}
                className="w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg text-lg"
              >
                {wf}
              </button>
            ))}
          </div>
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
          disabled={loading || !workFront.trim()}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </main>
    </div>
  );
}