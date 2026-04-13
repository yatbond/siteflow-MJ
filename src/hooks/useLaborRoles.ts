import { useState, useEffect, useCallback } from 'react';
import { fetchLaborRoles } from '@/db/syncService';
import type { CachedLaborRole } from '@/db/dexie';

interface UseLaborRolesResult {
  laborRoles: CachedLaborRole[];
  filteredRoles: CachedLaborRole[];
  categories: string[];
  getRolesByCategory: (category: string) => CachedLaborRole[];
  loading: boolean;
  error: Error | null;
}

export function useLaborRoles(categoryFilter?: string): UseLaborRolesResult {
  const [laborRoles, setLaborRoles] = useState<CachedLaborRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLaborRoles();
      setLaborRoles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load labor roles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Get unique categories
  const categories = Array.from(new Set(laborRoles.map((r) => r.category))).sort();

  // Filter by category
  const getRolesByCategory = useCallback(
    (category: string) => laborRoles.filter((r) => r.category === category),
    [laborRoles]
  );

  const filteredRoles = categoryFilter
    ? laborRoles.filter((r) => r.category === categoryFilter)
    : laborRoles;

  return {
    laborRoles,
    categories,
    getRolesByCategory,
    filteredRoles,
    loading,
    error,
  };
}