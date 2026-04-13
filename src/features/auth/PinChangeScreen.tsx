import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { t } from '@/shared/i18n/i18n';
import { hashPin } from './authService';

export default function PinChangeScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { userId } = location.state || {};

  const handleSubmit = async () => {
    if (!newPin || newPin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    // Check for weak PINs
    const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
    if (weakPins.includes(newPin)) {
      setError('Please choose a stronger PIN (avoid repeating digits or 1234)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!userId) throw new Error('No user ID');

      const userRef = doc(db, 'users', userId);
      const hashedPin = hashPin(newPin);

      await updateDoc(userRef, {
        pinHash: hashedPin,
        firstLogin: false,
        pinChangedAt: new Date().toISOString(),
      });

      // Success! Go to input form
      navigate('/input/site-trade', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">🔑 First-Time Setup</h1>
          <p className="text-gray-400">Please set your 4-digit PIN</p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500 rounded-lg">
          <p className="text-yellow-200 text-sm">
            ⚠️ For security, you'll be locked out for 30 minutes after 5 incorrect PIN attempts.
          </p>
        </div>

        {/* New PIN */}
        <div className="mb-4">
          <label className="block text-lg mb-2">New PIN</label>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            maxLength={4}
            className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Confirm PIN */}
        <div className="mb-6">
          <label className="block text-lg mb-2">Confirm PIN</label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            maxLength={4}
            className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
        >
          {loading ? 'Saving...' : 'Set PIN & Continue'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* PIN Tips */}
        <div className="mt-6 text-sm text-gray-400">
          <p className="mb-2">💡 Tips for a strong PIN:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Avoid repeating digits (1111, 2222)</li>
            <li>Avoid sequences (1234, 4321)</li>
            <li>Don't use your birth year</li>
            <li>Choose something only you know</li>
          </ul>
        </div>
      </div>
    </div>
  );
}