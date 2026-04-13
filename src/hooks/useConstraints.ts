import { useState, useEffect, useCallback } from 'react';
import { fetchConstraints, searchBilingual } from '@/db/syncService';
import type { CachedConstraint } from '@/db/dexie';

interface UseConstraintsResult {
  constraints: CachedConstraint[];
  categories: string[];
  filteredConstraints: CachedConstraint[];
  getConstraintsByCategory: (category: string) => CachedConstraint[];
  loading: boolean;
  error: Error | null;
}

export function useConstraints(categoryFilter?: string): UseConstraintsResult {
  const [constraints, setConstraints] = useState<CachedConstraint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConstraints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchConstraints();
      setConstraints(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load constraints'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConstraints();
  }, [loadConstraints]);

  // Get unique categories
  const categories = Array.from(new Set(constraints.map((c) => c.category))).sort();

  // Filter by category
  const filteredConstraints = categoryFilter
    ? constraints.filter((c) => c.category === categoryFilter)
    : constraints;

  const getConstraintsByCategory = useCallback(
    (category: string) => constraints.filter((c) => c.category === category),
    [constraints]
  );

  return {
    constraints,
    categories,
    filteredConstraints,
    getConstraintsByCategory,
    loading,
    error,
  };
}