import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db as dexieDb } from '@/db/dexie';
import { useWeatherOptions } from '@/hooks/useWeatherOptions';

interface PhotoPreview {
  file: File;
  url: string;
}

export default function ProgressPhotos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draftId } = (location.state || {}) as { draftId?: string };

  const { weatherOptions } = useWeatherOptions();
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = Array.from(files).slice(0, remaining);

    const newPhotos = toAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

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
      if (draftId) {
        const draft = await dexieDb.draftReports.get(draftId);
        if (draft) {
          await dexieDb.draftReports.update(draftId, {
            data: {
              ...draft.data,
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
                // Photos will be uploaded to Firebase Storage in submit step
              },
            },
            updatedAt: new Date().toISOString(),
          });
        }
      }
      navigate('/input/final', { state: { draftId } });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const safetyTypes = [
    { value: '', label: 'None / 無' },
    { value: 'near_miss', label: 'Near Miss / 工作安全險報' },
    { value: 'minor_injury', label: 'Minor Injury / 輕微受傷' },
    { value: 'major_injury', label: 'Major Injury / 嚴重受傷' },
    { value: 'dangerous_occurrence', label: 'Dangerous Occurrence / 危險事故' },
    { value: 'property_damage', label: 'Property Damage / 財物損壞' },
  ];

  const noWorkReasons = [
    { value: 'weather', label: 'Bad Weather / 惡劣天氣' },
    { value: 'safety', label: 'Safety Stop / 安全停工' },
    { value: 'no_resource', label: 'No Resource / 無人手' },
    { value: 'other', label: 'Other / 其他' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📸 Progress & Photos</h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Back
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="text-teal-400 font-bold">Step 5 of 9</span>
            <span>Progress & Photos</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 w-[55%]" />
          </div>
        </div>

        {/* No-Work Toggle */}
        <section className="mb-6 p-6 bg-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">🚫 No Work Today?</h2>
              <p className="text-sm text-gray-400">Flag this report as no productive work</p>
            </div>
            <button
              onClick={() => setNoWork(!noWork)}
              className={`w-16 h-8 rounded-full transition-colors ${noWork ? 'bg-red-600' : 'bg-gray-600'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${noWork ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>

          {noWork && (
            <div className="mt-4 space-y-2">
              {noWorkReasons.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setNoWorkReason(reason.value)}
                  className={`w-full p-4 text-left rounded-lg ${noWorkReason === reason.value ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {!noWork && (
          <>
            {/* Weather */}
            <section className="mb-6 p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">🌤️ Weather</h2>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {weatherOptions.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWeather(w.id)}
                    className={`p-3 rounded-lg text-center ${selectedWeather === w.id ? 'bg-teal-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <div className="text-2xl">{w.icon || '🌤️'}</div>
                    <div className="text-xs mt-1">{w.nameEn}</div>
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Temperature (°C)"
                className="w-full p-4 text-xl bg-gray-700 rounded-lg"
              />
            </section>

            {/* Work Done */}
            <section className="mb-6 p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">📝 Work Description</h2>
              <textarea
                value={workDone}
                onChange={(e) => setWorkDone(e.target.value)}
                placeholder="Describe work completed today / 描述今日完成的工作..."
                rows={4}
                className="w-full p-4 text-lg bg-gray-700 rounded-lg resize-none"
              />

              {/* Completion % */}
              <div className="mt-4">
                <label className="block text-lg mb-2 text-gray-300">
                  Completion: <span className="text-teal-400 font-bold">{completionPercent}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={completionPercent}
                  onChange={(e) => setCompletionPercent(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </section>

            {/* Photos */}
            <section className="mb-6 p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">📷 Photos (max {MAX_PHOTOS})</h2>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative">
                    <img src={photo.url} alt={`Photo ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-8 h-8 bg-red-600 rounded-full text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-teal-500 hover:text-teal-400"
                  >
                    <span className="text-3xl">+</span>
                    <span className="text-sm">Add Photo</span>
                  </button>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <p className="text-sm text-gray-400">Photos will be compressed to 1MP before upload</p>
            </section>

            {/* Safety */}
            <section className="mb-6 p-6 bg-gray-800 rounded-xl">
              <h2 className="text-xl font-bold mb-4">⚠️ Safety Incident</h2>
              <select
                value={safetyIncident}
                onChange={(e) => setSafetyIncident(e.target.value)}
                className="w-full p-4 text-xl bg-gray-700 rounded-lg mb-3"
              >
                {safetyTypes.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
              {safetyIncident && (
                <textarea
                  value={safetyDesc}
                  onChange={(e) => setSafetyDesc(e.target.value)}
                  placeholder="Describe incident..."
                  rows={3}
                  className="w-full p-4 text-lg bg-gray-700 rounded-lg resize-none"
                />
              )}
            </section>
          </>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">⚠️ {error}</div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
        >
          {loading ? 'Saving...' : 'Review Report →'}
        </button>
      </main>
    </div>
  );
}