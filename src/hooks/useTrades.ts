import { useState, useEffect, useCallback } from 'react';
import { fetchTrades, searchBilingual } from '@/db/syncService';
import type { CachedTrade } from '@/db/dexie';

interface UseTradesResult {
  trades: CachedTrade[];
  filteredTrades: CachedTrade[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getTradeById: (id: string) => CachedTrade | undefined;
  loading: boolean;
  error: Error | null;
}

export function useTrades(): UseTradesResult {
  const [trades, setTrades] = useState<CachedTrade[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTrades = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTrades();
      setTrades(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load trades'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const filteredTrades = searchBilingual(trades, searchQuery);

  const getTradeById = useCallback(
    (id: string) => trades.find((t) => t.id === id),
    [trades]
  );

  return {
    trades,
    filteredTrades,
    searchQuery,
    setSearchQuery,
    getTradeById,
    loading,
    error,
  };
}