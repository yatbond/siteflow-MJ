import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, setLocale, getLocale, type Locale } from '@/shared/i18n/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { getInitialTheme, applyTheme, toggleTheme, type Theme } from '@/shared/theme/theme';

const TIMEZONES = [
  { value: 'Asia/Hong_Kong', label: 'HKT (UTC+8)' },
  { value: 'Asia/Shanghai', label: 'CST (UTC+8)' },
  { value: 'Asia/Singapore', label: 'SGT (UTC+8)' },
  { value: 'Asia/Bangkok', label: 'ICT (UTC+7)' },
  { value: 'Asia/Tokyo', label: 'JST (UTC+9)' },
  { value: 'Australia/Sydney', label: 'AEDT (UTC+11)' },
  { value: 'Europe/London', label: 'GMT (UTC+0)' },
  { value: 'America/New_York', label: 'EST (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'PST (UTC-8)' },
];

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [theme, setThemeState] = useState<Theme>(getInitialTheme());
  const [locale, setLocaleState] = useState<Locale>(getLocale());
  const [timezone, setTimezone] = useState('Asia/Hong_Kong');

  // Load saved preferences
  useEffect(() => {
    const savedTz = localStorage.getItem('siteflow-timezone');
    if (savedTz) setTimezone(savedTz);
  }, []);

  const handleThemeToggle = () => {
    const next = toggleTheme(theme);
    setThemeState(next);
  };

  const handleLocaleChange = () => {
    const next: Locale = locale === 'en' ? 'zh' : 'en';
    setLocale(next);
    setLocaleState(next);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tz = e.target.value;
    setTimezone(tz);
    localStorage.setItem('siteflow-timezone', tz);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">⚙️ {t('admin.title')}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          ← {t('common.back')}
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* User Profile */}
        <section className="mb-8 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">👤 Profile</h2>
          <div className="space-y-2 text-gray-300">
            <p><span className="text-gray-500">Name:</span> {user?.displayName}</p>
            <p><span className="text-gray-500">Role:</span> {user?.role}</p>
            {user?.email && <p><span className="text-gray-500">Email:</span> {user.email}</p>}
            {user?.phone && <p><span className="text-gray-500">Phone:</span> {user.phone}</p>}
          </div>
        </section>

        {/* Appearance */}
        <section className="mb-8 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🎨 Appearance</h2>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-gray-700">
            <div>
              <p className="text-lg font-medium">Theme</p>
              <p className="text-gray-400 text-sm">Dark / Light mode</p>
            </div>
            <button
              onClick={handleThemeToggle}
              className={`px-6 py-3 rounded-lg font-bold ${
                theme === 'dark' 
                  ? 'bg-teal-600 hover:bg-teal-700' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
              }`}
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </section>

        {/* Language */}
        <section className="mb-8 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🌐 Language</h2>
          
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-lg font-medium">Interface Language</p>
              <p className="text-gray-400 text-sm">English / 繁體中文</p>
            </div>
            <button
              onClick={handleLocaleChange}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-bold"
            >
              {locale === 'en' ? '繁體中文' : 'English'}
            </button>
          </div>
        </section>

        {/* Timezone */}
        <section className="mb-8 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🕐 Timezone</h2>
          
          <select
            value={timezone}
            onChange={handleTimezoneChange}
            className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </section>

        {/* Offline Sync */}
        <section className="mb-8 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🔄 Offline Sync</h2>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-lg font-medium">Manage Offline Queue</p>
              <p className="text-gray-400 text-sm">View pending reports, sync now</p>
            </div>
            <button
              onClick={() => navigate('/settings/offline')}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-bold"
            >
              Open →
            </button>
          </div>
        </section>

        {/* Logout */}
        <section className="p-6 bg-red-900/30 border border-red-700 rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-red-300">🚪 Logout</h2>
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-bold"
          >
            Logout
          </button>
        </section>

        {/* Version */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>SiteFlow v1.0 • Phases 1-8 Complete</p>
          <p className="mt-1">Build: 2026-04-13</p>
        </div>
      </main>
    </div>
  );
}