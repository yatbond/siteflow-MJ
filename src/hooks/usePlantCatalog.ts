import { useState, useEffect, useCallback } from 'react';
import { fetchPlantCatalog, searchBilingual } from '@/db/syncService';
import type { CachedPlant } from '@/db/dexie';

interface UsePlantCatalogResult {
  plants: CachedPlant[];
  categories: string[];
  brands: string[];
  filteredPlants: CachedPlant[];
  loading: boolean;
  error: Error | null;
}

export function usePlantCatalog(categoryFilter?: string, brandFilter?: string): UsePlantCatalogResult {
  const [plants, setPlants] = useState<CachedPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPlants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPlantCatalog();
      setPlants(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load plant catalog'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  // Get unique categories
  const categories = Array.from(new Set(plants.map((p) => p.categoryEn))).sort();

  // Filter by category
  let filtered = plants;
  if (categoryFilter) {
    filtered = filtered.filter((p) => p.categoryEn === categoryFilter);
  }

  // Get unique brands (filtered)
  const brands = Array.from(new Set(filtered.map((p) => p.brand))).sort();

  // Filter by brand
  if (brandFilter) {
    filtered = filtered.filter((p) => p.brand === brandFilter);
  }

  return {
    plants,
    categories,
    brands,
    filteredPlants: filtered,
    loading,
    error,
  };
}