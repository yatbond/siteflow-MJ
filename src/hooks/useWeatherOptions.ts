import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherOptions } from '@/db/syncService';
import type { CachedWeather } from '@/db/dexie';

interface UseWeatherOptionsResult {
  weatherOptions: CachedWeather[];
  getWeatherById: (id: string) => CachedWeather | undefined;
  loading: boolean;
  error: Error | null;
}

export function useWeatherOptions(): UseWeatherOptionsResult {
  const [weatherOptions, setWeatherOptions] = useState<CachedWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadWeather = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWeatherOptions();
      setWeatherOptions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load weather options'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const getWeatherById = useCallback(
    (id: string) => weatherOptions.find((w) => w.id === id),
    [weatherOptions]
  );

  return {
    weatherOptions,
    getWeatherById,
    loading,
    error,
  };
}