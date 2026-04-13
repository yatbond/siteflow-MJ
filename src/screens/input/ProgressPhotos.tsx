import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PhotoPreview {
  file: File;
  url: string;
}

export default function ProgressPhotos() {
  const navigate = useNavigate();
  const location = useLocation();
  const prev = location.state || {};

  const [weatherOptions, setWeatherOptions] = useState<any[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [workDone, setWorkDone] = useState('');
  const [completionPercent, setCompletionPercent] = useState(0);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [safetyIncident, setSafetyIncident] = useState<string>('');
  const [safetyDesc, setSafetyDesc] = useState('');
  const [noWork, setNoWork] = useState(false);
  const [noWorkReason, setNoWorkReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const MAX_PHOTOS = 5;

  useEffect(() => {
    getDocs(query(collection(db, 'weatherOptions'), where('active', '==', true)))
      .then(snap => setWeatherOptions(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newPhotos = toAdd.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos([...photos, ...newPhotos]);
  };

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index].url);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (!noWork && !workDone.trim()) {
      setError('Please describe work done');
      return;
    }
    if (noWork && !noWorkReason) {
      setError('Please select a no-work reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      navigate('/input/resources', {
        state: {
          ...prev,
          progress: {
            weatherId: selectedWeather,
            temperature: temperature ? parseFloat(temperature) : null,
            workDone,
            completionPercent,
            noWork,
            noWorkReason: noWork ? noWorkReason : null,
            safetyIncident: safetyIncident || null,
            safetyDescription: safetyDesc || null,
            photoCount: photos.length,
          },
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
        <h1 className="text-2xl font-bold">📸 {noWork ? 'No Work Report' : 'Progress & Photos'}</h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">← Back</button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="text-teal-400 font-bold">Step 4 of 9</span>
            <span>Progress</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-teal-500 w-[44%]" /></div>
        </div>

        {/* No Work Toggle */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={noWork} onChange={(e) => setNoWork(e.target.checked)} className="w-6 h-6 accent-red-500" />
            <span className="text-xl font-bold">🚫 No Work Today</span>
          </label>
        </section>

        {!noWork ? (
          <>
            {/* Weather */}
            <section className="mb-6 p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">🌤️ Weather</h2>
              <select value={selectedWeather} onChange={(e) => setSelectedWeather(e.target.value)} className="w-full p-4 text-lg bg-gray-700 rounded-lg mb-3">
                <option value="">Select Weather</option>
                {weatherOptions?.map((w: any) => <option key={w.id} value={w.id}>{w.nameEn} - {w.nameZh}</option>)}
              </select>
              <input type="number" placeholder="Temperature (°C)" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="w-full p-4 text-lg bg-gray-700 rounded-lg" />
            </section>

            {/* Work Done */}
            <section className="mb-6 p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">📝 Work Description</h2>
              <textarea value={workDone} onChange={(e) => setWorkDone(e.target.value)} placeholder="Describe work completed today..." rows={4} className="w-full p-4 text-lg bg-gray-700 rounded-lg" />
              <div className="mt-4">
                <label className="text-sm text-gray-400">Completion: {completionPercent}%</label>
                <input type="range" min="0" max="100" value={completionPercent} onChange={(e) => setCompletionPercent(parseInt(e.target.value))} className="w-full accent-teal-500" />
              </div>
            </section>

            {/* Photos */}
            <section className="mb-6 p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">📷 Photos ({photos.length}/{MAX_PHOTOS})</h2>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={photos.length >= MAX_PHOTOS} className="w-full py-4 border-2 border-dashed border-gray-600 rounded-lg text-lg hover:border-teal-500 disabled:opacity-50">+ Add Photos</button>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {photos.map((p, i) => (
                    <div key={i} className="relative">
                      <img src={p.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button onClick={() => handleRemovePhoto(i)} className="absolute top-1 right-1 bg-red-600 rounded-full w-6 h-6 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="mb-6 p-6 bg-gray-800 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Reason</h2>
            <select value={noWorkReason} onChange={(e) => setNoWorkReason(e.target.value)} className="w-full p-4 text-lg bg-gray-700 rounded-lg">
              <option value="">Select Reason</option>
              <option value="weather">Severe Weather / Typhoon</option>
              <option value="holiday">Public Holiday</option>
              <option value="site_closed">Site Closed</option>
              <option value="no_materials">No Materials</option>
              <option value="other">Other</option>
            </select>
          </section>
        )}

        {/* Safety */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">⚠️ Safety (Optional)</h2>
          <select value={safetyIncident} onChange={(e) => setSafetyIncident(e.target.value)} className="w-full p-4 text-lg bg-gray-700 rounded-lg mb-3">
            <option value="">No incident</option>
            <option value="near_miss">Near Miss</option>
            <option value="minor">Minor Incident</option>
            <option value="major">Major Incident</option>
          </select>
          {safetyIncident && <textarea value={safetyDesc} onChange={(e) => setSafetyDesc(e.target.value)} placeholder="Describe incident..." rows={3} className="w-full p-4 text-lg bg-gray-700 rounded-lg" />}
        </section>

        {error && <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">⚠️ {error}</div>}

        <button onClick={handleContinue} disabled={loading} className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold">
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </main>
    </div>
  );
}
