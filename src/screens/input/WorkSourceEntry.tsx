import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '@/shared/i18n/i18n';
import { db as dexieDb } from '@/db/dexie';
import { useLaborRoles } from '@/hooks/useLaborRoles';

interface LaborEntry {
  roleId: string;
  count: number;
}

export default function WorkSourceEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draftId } = location.state || {};
  
  const { laborRoles, categories, getRolesByCategory } = useLaborRoles();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [laborEntries, setLaborEntries] = useState<LaborEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddLabor = (roleId: string) => {
    const existing = laborEntries.find((e) => e.roleId === roleId);
    if (existing) {
      setLaborEntries(laborEntries.map((e) =>
        e.roleId === roleId ? { ...e, count: e.count + 1 } : e
      ));
    } else {
      setLaborEntries([...laborEntries, { roleId, count: 1 }]);
    }
  };

  const handleUpdateCount = (roleId: string, count: number) => {
    if (count <= 0) {
      setLaborEntries(laborEntries.filter((e) => e.roleId !== roleId));
    } else {
      setLaborEntries(laborEntries.map((e) =>
        e.roleId === roleId ? { ...e, count } : e
      ));
    }
  };

  const getTotalLabor = () => {
    return laborEntries.reduce((sum, e) => sum + e.count, 0);
  };

  const handleContinue = async () => {
    if (laborEntries.length === 0) {
      setError('Please add at least one labor role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (draftId) {
        const draft = await dexieDb.draftReports.get(draftId);
        if (draft) {
          await dexieDb.draftReports.update(draftId, {
            data: { ...draft.data, labor: laborEntries },
            updatedAt: new Date().toISOString(),
          });
        }
      }

      navigate('/input/resources', { state: { draftId } });
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
        <h1 className="text-2xl font-bold">{t('report.workSource.title')}</h1>
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
            <span className="text-teal-400 font-bold">Step 3 of 9</span>
            <span>Work Source</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 w-[33%]"></div>
          </div>
        </div>

        {/* Category Filter */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">👷 {t('report.labor.category')}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`px-4 py-2 rounded-lg text-lg ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Labor Roles */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">👥 {t('report.labor.roles')}</h2>
          <div className="space-y-4">
            {laborRoles
              .filter((role) => !selectedCategory || role.category === selectedCategory)
              .map((role) => {
                const entry = laborEntries.find((e) => e.roleId === role.id);
                const count = entry?.count || 0;

                return (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-lg font-bold">{role.nameEn}</p>
                      <p className="text-gray-400">{role.nameZh}</p>
                      {role.defaultRate && (
                        <p className="text-sm text-teal-400 mt-1">
                          ${role.defaultRate}/day
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateCount(role.id, count - 1)}
                        className="w-12 h-12 bg-gray-600 hover:bg-gray-500 rounded-lg text-xl font-bold"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-2xl font-bold">{count}</span>
                      <button
                        onClick={() => handleAddLabor(role.id)}
                        className="w-12 h-12 bg-teal-600 hover:bg-teal-700 rounded-lg text-xl font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Summary */}
        <section className="mb-6 p-6 bg-teal-900/30 border border-teal-700 rounded-xl">
          <h2 className="text-xl font-bold mb-2">📊 Total Labor</h2>
          <p className="text-4xl font-bold text-teal-400">{getTotalLabor()} workers</p>
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
          disabled={loading || laborEntries.length === 0}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </main>
    </div>
  );
}