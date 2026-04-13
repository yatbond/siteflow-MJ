import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/AuthContext';

export default function SubmitConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { siteId, tradeId, workDate, workFront, workSource, labor, plant, progress } = location.state || {};
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!siteId || submitted) return;

    const doSubmit = async () => {
      try {
        const reportData = {
          userId: user!.uid,
          siteId,
          tradeId,
          workDate,
          workFront,
          workSource,
          labor,
          plant,
          progress,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const reportRef = doc(collection(db, 'reports'));
        await setDoc(reportRef, reportData);
        setSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Submit failed');
      }
    };

    doSubmit();
  }, [siteId, submitted, user, tradeId, workDate, workFront, workSource, labor, plant, progress]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white p-8">
        <div className="max-w-md text-center">
          <h1 className="text-5xl mb-4">❌</h1>
          <h2 className="text-2xl font-bold mb-4">Submit Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Your report is saved as draft. Try again later.</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/my-submissions')}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              View My Submissions
            </button>
            <button
              onClick={() => navigate('/input/site-trade')}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 rounded-lg"
            >
              New Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!submitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">📤</div>
          <h2 className="text-2xl font-bold">Submitting report...</h2>
          <p className="text-gray-400 mt-2">Saving to Firebase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white p-8">
      <div className="max-w-md text-center">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-4">Report Submitted!</h1>
        <p className="text-gray-400 mb-2">
          Your daily report has been submitted successfully.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Submitted at {new Date().toLocaleTimeString('en-HK', { timeZone: 'Asia/Hong_Kong' })}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/input/site-trade')}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 rounded-lg text-xl font-bold"
          >
            ➕ New Report
          </button>
          <button
            onClick={() => navigate('/my-submissions')}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg"
          >
            📜 View My Submissions
          </button>
        </div>
      </div>
    </div>
  );
}
