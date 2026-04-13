import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '@/shared/i18n/i18n';
import { db as dexieDb } from '@/db/dexie';
import { usePlantCatalog } from '@/hooks/usePlantCatalog';

interface PlantEntry {
  plantId: string;
  category: string;
  brand: string;
  model: string;
  hours: number;
}

export default function ResourceLog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draftId } = (location.state || {}) as { draftId?: string };

  const { categories, brands, filteredPlants, loading: plantsLoading } = usePlantCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [plantHours, setPlantHours] = useState<number>(8.5);
  const [plantEntries, setPlantEntries] = useState<PlantEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableModels = filteredPlants
    .filter((p) => (!selectedCategory || p.categoryEn === selectedCategory) && (!selectedBrand || p.brand === selectedBrand))
    .map((p) => p.model);

  const handleAddPlant = () => {
    if (!selectedCategory || !selectedBrand || !selectedModel) {
      setError('Please select type, brand, and model');
      return;
    }

    const plant = filteredPlants.find(
      (p) => p.categoryEn === selectedCategory && p.brand === selectedBrand && p.model === selectedModel
    );

    if (!plant) return;

    setPlantEntries([
      ...plantEntries,
      {
        plantId: plant.id,
        category: selectedCategory,
        brand: selectedBrand,
        model: selectedModel,
        hours: plantHours,
      },
    ]);

    // Reset selection
    setSelectedModel(null);
    setSelectedBrand(null);
    setPlantHours(8.5);
    setError('');
  };

  const handleRemovePlant = (index: number) => {
    setPlantEntries(plantEntries.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      if (draftId) {
        const draft = await dexieDb.draftReports.get(draftId);
        if (draft) {
          await dexieDb.draftReports.update(draftId, {
            data: { ...draft.data, plant: plantEntries },
            updatedAt: new Date().toISOString(),
          });
        }
      }
      navigate('/input/progress', { state: { draftId } });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🏗️ Plant & Equipment</h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Back
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="text-teal-400 font-bold">Step 4 of 9</span>
            <span>Resources</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 w-[44%]" />
          </div>
        </div>

        {/* Plant Selection (Cascading) */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🚜 Add Plant / Equipment</h2>

          {/* Type */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-gray-300">Type / 類型</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => { setSelectedCategory(e.target.value || null); setSelectedBrand(null); setSelectedModel(null); }}
              className="w-full p-4 text-xl bg-gray-700 rounded-lg"
            >
              <option value="">Select Type</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Brand */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-gray-300">Brand / 品牌</label>
            <select
              value={selectedBrand || ''}
              onChange={(e) => { setSelectedBrand(e.target.value || null); setSelectedModel(null); }}
              disabled={!selectedCategory}
              className="w-full p-4 text-xl bg-gray-700 rounded-lg disabled:opacity-50"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Model */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-gray-300">Model / 型號</label>
            <select
              value={selectedModel || ''}
              onChange={(e) => setSelectedModel(e.target.value || null)}
              disabled={!selectedBrand}
              className="w-full p-4 text-xl bg-gray-700 rounded-lg disabled:opacity-50"
            >
              <option value="">Select Model</option>
              {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Hours */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-gray-300">Working Hours</label>
            <input
              type="number"
              value={plantHours}
              onChange={(e) => setPlantHours(parseFloat(e.target.value) || 0)}
              step={0.5}
              min={0}
              max={24}
              className="w-full p-4 text-xl bg-gray-700 rounded-lg"
            />
            <p className="mt-1 text-sm text-gray-400">Default: 8.5 hours (9.5 on-site minus 1hr lunch)</p>
          </div>

          <button
            onClick={handleAddPlant}
            disabled={!selectedModel}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-lg font-bold"
          >
            + Add Plant
          </button>
        </section>

        {/* Added Plants */}
        {plantEntries.length > 0 && (
          <section className="mb-6 p-6 bg-gray-800 rounded-xl">
            <h2 className="text-xl font-bold mb-4">📋 Added Equipment ({plantEntries.length})</h2>
            <div className="space-y-3">
              {plantEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-bold">{entry.brand} {entry.model}</p>
                    <p className="text-sm text-gray-400">{entry.category} • {entry.hours}h</p>
                  </div>
                  <button
                    onClick={() => handleRemovePlant(idx)}
                    className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-lg text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>

        <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500 rounded-lg text-blue-200 text-sm">
          💡 <strong>Tip:</strong> Skip this step if no plant/equipment used today. Press Continue to move on.
        </div>
      </main>
    </div>
  );
}