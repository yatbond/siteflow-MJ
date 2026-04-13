import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, setLocale, getLocale } from '@/shared/i18n/i18n';
import { useAuth } from './AuthContext';
import PhoneLogin from './PhoneLogin';
import EmailLogin from './EmailLogin';

type AuthMode = 'phone' | 'email';

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('phone');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate('/input/site-trade');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">🌿 SiteFlow</h1>
          <p className="text-gray-400">Productivity Tracker</p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLocale(getLocale() === 'en' ? 'zh' : 'en')}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            {getLocale() === 'en' ? '繁體中文' : 'English'}
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setMode('phone')}
            className={`flex-1 py-3 text-lg font-medium ${
              mode === 'phone'
                ? 'text-teal-400 border-b-2 border-teal-400'
                : 'text-gray-400'
            }`}
          >
            👷 {t('auth.loginForeman')}
          </button>
          <button
            onClick={() => setMode('email')}
            className={`flex-1 py-3 text-lg font-medium ${
              mode === 'email'
                ? 'text-teal-400 border-b-2 border-teal-400'
                : 'text-gray-400'
            }`}
          >
            👔 {t('auth.loginManager')}
          </button>
        </div>

        {/* Login Form */}
        {mode === 'phone' ? <PhoneLogin /> : <EmailLogin />}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>SiteFlow v0.1 • Phase 1</p>
        </div>

        {/* reCAPTCHA container (hidden) */}
        <div id="recaptcha-container" className="hidden" />
      </div>
    </div>
  );
}