import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  
  const [plantCatalog, setPlantCatalog] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [plantEntries, setPlantEntries] = useState<PlantEntry[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDocs(query(collection(db, 'plantCatalog'), where('active', '==', true)))
      .then(snap => setPlantCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
  }, []);

  const brands = Array.from(new Set(plantCatalog.map(p => p.brand))).sort();
  const modelsForBrand = selectedBrand ? plantCatalog.filter(p => p.brand === selectedBrand) : [];

  const handleAddPlant = (plantId: string) => {
    const plant = plantCatalog.find(p => p.id === plantId);
    if (plant) {
      setPlantEntries([...plantEntries, { plantId: plant.id, brand: plant.brand || '', model: plant.model || '', hours: 0 }]);
    }
  };

  const handleUpdateHours = (index: number, hours: number) => {
    setPlantEntries(plantEntries.map((p, i) => i === index ? { ...p, hours } : p));
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
          
          {/* Brand selector */}
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg mb-3">
            <option value="">Select Brand</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          {/* Model selector */}
          {selectedBrand && (
            <select onChange={(e) => { if (e.target.value) { handleAddPlant(e.target.value); e.target.value = ''; } }} className="w-full p-3 bg-gray-700 rounded-lg mb-3" defaultValue="">
              <option value="">Select Model</option>
              {modelsForBrand.map(p => (
                <option key={p.id} value={p.id}>{p.model} ({p.type || 'General'})</option>
              ))}
            </select>
          )}

          {/* Selected equipment list */}
          {plantEntries.length > 0 && (
            <div className="space-y-2 mt-4">
              {plantEntries.map((p, i) => (
                <div key={i} className="flex gap-2 items-center bg-gray-700 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-bold">{p.brand} {p.model}</p>
                  </div>
                  <input type="number" placeholder="Hours" value={p.hours || ''} onChange={(e) => handleUpdateHours(i, parseFloat(e.target.value) || 0)} className="w-24 p-2 bg-gray-600 rounded-lg text-center" />
                  <button onClick={() => handleRemovePlant(i)} className="p-2 bg-red-600 rounded-lg text-sm">✕</button>
                </div>
              ))}
            </div>
          )}
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
