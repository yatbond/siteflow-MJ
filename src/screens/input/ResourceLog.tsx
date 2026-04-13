import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PlantEntry {
  plantId: string;
  brand: string;
  model: string;
  hours: number;
}

export default function ResourceLog() {
  const navigate = useNavigate();
  const location = useLocation();
  const prev = location.state || {};
  
  const [plantEntries, setPlantEntries] = useState<PlantEntry[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddPlant = () => {
    setPlantEntries([...plantEntries, { plantId: '', brand: '', model: '', hours: 0 }]);
  };

  const handleUpdatePlant = (index: number, field: string, value: any) => {
    setPlantEntries(plantEntries.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleRemovePlant = (index: number) => {
    setPlantEntries(plantEntries.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      navigate('/input/final', {
        state: {
          ...prev,
          plant: plantEntries,
          constraints,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🚜 Equipment & Constraints</h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">← Back</button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="text-teal-400 font-bold">Step 5 of 9</span>
            <span>Resources</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-teal-500 w-[55%]" /></div>
        </div>

        {/* Plant/Equipment */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🚜 Equipment ({plantEntries.length})</h2>
          {plantEntries.map((p, i) => (
            <div key={i} className="flex gap-2 mb-3 items-center">
              <input placeholder="Brand" value={p.brand} onChange={(e) => handleUpdatePlant(i, 'brand', e.target.value)} className="flex-1 p-3 bg-gray-700 rounded-lg" />
              <input placeholder="Model" value={p.model} onChange={(e) => handleUpdatePlant(i, 'model', e.target.value)} className="flex-1 p-3 bg-gray-700 rounded-lg" />
              <input type="number" placeholder="Hours" value={p.hours || ''} onChange={(e) => handleUpdatePlant(i, 'hours', parseFloat(e.target.value) || 0)} className="w-20 p-3 bg-gray-700 rounded-lg" />
              <button onClick={() => handleRemovePlant(i)} className="p-3 bg-red-600 rounded-lg">✕</button>
            </div>
          ))}
          <button onClick={handleAddPlant} className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-teal-500">+ Add Equipment</button>
        </section>

        {/* Constraints */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">⛔ Constraints</h2>
          {['Weather', 'Material Shortage', 'Equipment Breakdown', 'Access Restriction', 'Other'].map((c) => (
            <label key={c} className="flex items-center gap-3 py-2 cursor-pointer">
              <input type="checkbox" checked={constraints.includes(c)} onChange={(e) => {
                if (e.target.checked) setConstraints([...constraints, c]);
                else setConstraints(constraints.filter(x => x !== c));
              }} className="w-5 h-5 accent-teal-500" />
              <span>{c}</span>
            </label>
          ))}
        </section>

        {error && <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">⚠️ {error}</div>}

        <button onClick={handleContinue} disabled={loading} className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold">
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </main>
    </div>
  );
}
