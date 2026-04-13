import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendSignInLinkToEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { t } from '@/shared/i18n/i18n';
import { useAuth } from './AuthContext';
import { isValidCorporateEmail } from './authService';

type Step = 'email' | 'password';

export default function EmailLogin() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuth();

  // Step 1: Validate email and send link (or go to password)
  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!isValidCorporateEmail(email)) {
      setError('Only @chunwo.com and @asiaalliedgroup.com emails are allowed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if user exists
      // For demo: just go to password step
      // In production: send sign-in link via email
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Failed to send link');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Sign in with password
  const handlePasswordSubmit = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to sign in
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      // Fetch user data from Firestore
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUser({
          uid,
          email,
          role: data.role as any,
          displayName: data.displayName || email,
          siteIds: data.siteIds || [],
        });
      } else {
        // Create new user (manager by default for corporate email)
        await setDoc(userRef, {
          email,
          role: 'manager',
          displayName: email.split('@')[0],
          siteIds: [],
          createdAt: new Date().toISOString(),
        });

        setUser({
          uid,
          email,
          role: 'manager',
          displayName: email.split('@')[0],
          siteIds: [],
        });
      }

      // Redirect based on role
      const userRole = setUser((u: any) => u?.role) || 'manager';
      if (userRole === 'estimator') {
        // window.location.href = '/dashboard';
      } else {
        // window.location.href = '/dashboard';
      }
      
      // For now, go to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 'email' && (
        <div>
          <label className="block text-lg mb-2">{t('auth.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
            placeholder="name@chunwo.com"
            className="w-full p-4 text-xl bg-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500"
          />
          <div className="text-sm text-gray-400 mb-4">
            ℹ️ Only @chunwo.com and @asiaalliedgroup.com emails are accepted
          </div>
          <button
            onClick={handleEmailSubmit}
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
          >
            {loading ? 'Sending...' : 'Send Login Link'}
          </button>
          <button
            onClick={() => setStep('password')}
            className="w-full py-3 mt-2 text-teal-400 hover:text-teal-300"
          >
            Use Password Instead →
          </button>
        </div>
      )}

      {step === 'password' && (
        <div>
          <label className="block text-lg mb-2">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-4 text-xl bg-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handlePasswordSubmit}
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded-lg text-xl font-bold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            onClick={() => setStep('email')}
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