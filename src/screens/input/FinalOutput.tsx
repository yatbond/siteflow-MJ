import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FinalOutput() {
  const navigate = useNavigate();
  const location = useLocation();
  const { siteId, tradeId, workDate, workFront, workSource, labor, plant, progress } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      navigate('/input/submit', { 
        state: { 
          siteId, 
          tradeId, 
          workDate, 
          workFront,
          workSource,
          labor, 
          plant, 
          progress 
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const laborCount = labor?.reduce((sum: number, l: any) => sum + (l.count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">✅ Review Report</h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Back
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="text-teal-400 font-bold">Step 6 of 9</span>
            <span>Review</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 w-[66%]" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          {/* Site & Trade */}
          <section className="p-5 bg-gray-800 rounded-xl">
            <h3 className="text-lg font-bold text-teal-400 mb-2">🏢 Site & Trade</h3>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="font-bold">{workDate}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Site</p>
                <p className="font-bold">{siteId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Trade</p>
                <p className="font-bold">{tradeId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Work Front</p>
                <p className="font-bold">{workFront || '—'}</p>
              </div>
            </div>
          </section>

          {/* Labor */}
          <section className="p-5 bg-gray-800 rounded-xl">
            <h3 className="text-lg font-bold text-teal-400 mb-2">👥 Labor ({labor?.length || 0} roles)</h3>
            <p className="text-2xl font-bold">
              {laborCount} workers total
            </p>
          </section>

          {/* Plant */}
          {plant?.length > 0 && (
            <section className="p-5 bg-gray-800 rounded-xl">
              <h3 className="text-lg font-bold text-teal-400 mb-2">🚜 Equipment ({plant.length})</h3>
              <div className="space-y-1">
                {plant.map((p: any, i: number) => (
                  <p key={i} className="text-lg">{p.brand} {p.model} • {p.hours}h</p>
                ))}
              </div>
            </section>
          )}

          {/* Progress */}
          <section className="p-5 bg-gray-800 rounded-xl">
            <h3 className="text-lg font-bold text-teal-400 mb-2">📝 Progress</h3>
            {progress?.noWork ? (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-300 font-bold">🚫 No Work — {progress.noWorkReason}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg">{progress?.workDone || 'No description'}</p>
                <p className="text-teal-400 font-bold">Completion: {progress?.completionPercent || 0}%</p>
                {progress?.safetyIncident && (
                  <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-300">⚠️ Safety: {progress.safetyIncident}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Photos */}
          {progress?.photoCount > 0 && (
            <section className="p-5 bg-gray-800 rounded-xl">
              <h3 className="text-lg font-bold text-teal-400 mb-2">📷 {progress.photoCount} Photo(s)</h3>
              <p className="text-gray-400">Photos will be uploaded on submit</p>
            </section>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">⚠️ {error}</div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
          >
            {loading ? 'Submitting...' : '✅ Submit Report'}
          </button>
          <button
            onClick={() => navigate('/input/progress', { state: { siteId, tradeId, workDate, workFront, workSource, labor, plant, progress } })}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg"
          >
            ✏️ Edit Report
          </button>
        </div>
      </main>
    </div>
  );
}
