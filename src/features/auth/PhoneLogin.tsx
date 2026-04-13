import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { t } from '@/shared/i18n/i18n';
import { useAuth } from './AuthContext';
import { hashPin, getDeviceId, validatePin, recordFailedAttempt, resetLockout, bindDevice, checkLockout } from './authService';

type Step = 'phone' | 'code' | 'pin';

export default function PhoneLogin() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Step 1: Send verification code
  const handleSendCode = async () => {
    if (!phone.match(/^\+?[0-9]{8,15}$/)) {
      setError('Invalid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create recaptcha verifier
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });

      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setVerificationId(result.verificationId);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code + check user exists
  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo: create user if doesn't exist
      // In production: verify code with Firebase
      const mockUid = 'user_' + phone.replace(/\D/g, '').slice(-8);
      
      const userRef = doc(db, 'users', mockUid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user (foreman by default)
        await setDoc(userRef, {
          phone,
          role: 'foreman',
          displayName: phone,
          firstLogin: true,
          lockoutAttempts: 0,
          createdAt: new Date().toISOString(),
        });
      }

      // Check lockout
      const lockout = await checkLockout(mockUid);
      if (lockout.locked) {
        const mins = Math.ceil((lockout.remainingMs || 0) / 60000);
        setError(`Account locked. Try again in ${mins} minutes.`);
        return;
      }

      setUserId(mockUid);
      setStep('pin');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify PIN
  const handleVerifyPin = async () => {
    if (!pin || pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!userId) throw new Error('No user ID');

      const valid = await validatePin(userId, pin);
      
      if (!valid) {
        await recordFailedAttempt(userId);
        setError('Incorrect PIN');
        return;
      }

      // Success!
      await resetLockout(userId);
      await bindDevice(userId, getDeviceId());

      // Load user data
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      if (data) {
        setUser({
          uid: userId,
          phone,
          role: data.role as any,
          displayName: data.displayName || phone,
          siteIds: data.siteIds || [],
        });
      }

      // Check if first login
      if (data?.firstLogin || !data?.pinHash) {
        navigate('/pin-change', { state: { userId, phone } });
      } else {
        navigate('/input/site-trade');
      }
    } catch (err: any) {
      setError(err.message || 'PIN verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 'phone' && (
        <div>
          <label className="block text-lg mb-2">{t('auth.phone')}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+852 1234 5678"
            className="w-full p-4 text-xl bg-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSendCode}
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div>
          <label className="block text-lg mb-2">Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            maxLength={6}
            className="w-full p-4 text-xl bg-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleVerifyCode}
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            onClick={() => setStep('phone')}
            className="w-full py-3 mt-2 text-gray-400 hover:text-white"
          >
            ← Change Phone
          </button>
        </div>
      )}

      {step === 'pin' && (
        <div>
          <label className="block text-lg mb-2">{t('auth.pin')}</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            maxLength={4}
            className="w-full p-4 text-xl bg-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleVerifyPin}
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
          >
            {loading ? 'Checking...' : 'Login'}
          </button>
          <button
            onClick={() => setStep('code')}
            className="w-full py-3 mt-2 text-gray-400 hover:text-white"
          >
            ← Back
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}