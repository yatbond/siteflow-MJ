import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { db as dexieDb } from '@/db/dexie';
import type { CachedTrade, CachedPlant, CachedConstraint, CachedWeather, CachedLaborRole, CachedSite } from '@/db/dexie';

const COLLECTIONS = [
  { name: 'trades', dexie: 'trades' },
  { name: 'laborRoles', dexie: 'laborRoles' },
  { name: 'plantCatalog', dexie: 'plantCatalog' },
  { name: 'constraints', dexie: 'constraints' },
  { name: 'weatherOptions', dexie: 'weatherOptions' },
  { name: 'sites', dexie: 'sites' },
] as const;

export type CollectionName = typeof COLLECTIONS[number]['name'];

// Sync all reference collections from Firestore to Dexie
export async function syncReferenceData(): Promise<void> {
  for (const { name, dexie } of COLLECTIONS) {
    try {
      const colRef = collection(db, name);
      const snapshot = await getDocs(colRef);
      
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      // Clear and repopulate Dexie table
      const table = (dexieDb as any)[dexie];
      await table.clear();
      if (items.length > 0) {
        await table.bulkPut(items);
      }

      console.log(`[Sync] ${name}: ${items.length} items synced`);
    } catch (err) {
      console.warn(`[Sync] Failed to sync ${name}:`, err);
      // Continue with cached data in Dexie
    }
  }
}

// Sync on app startup (call from App.tsx or main.tsx)
export async function initializeReferenceData(): Promise<void> {
  try {
    await syncReferenceData();
  } catch (err) {
    console.warn('[Sync] Initial sync failed, using cached data:', err);
  }
}

// Individual fetchers (fallback to Dexie if Firestore fails)

export async function fetchTrades(): Promise<CachedTrade[]> {
  try {
    const colRef = collection(db, 'trades');
    const q = query(colRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    const trades: CachedTrade[] = [];
    snapshot.forEach((doc) => trades.push({ id: doc.id, ...doc.data() } as CachedTrade));
    
    // Cache in Dexie
    await dexieDb.trades.bulkPut(trades);
    return trades;
  } catch (err) {
    console.warn('[Fetch] Trades from Firestore failed, using cache:', err);
    return await dexieDb.trades.where('active').equals(true).toArray();
  }
}

export async function fetchPlantCatalog(): Promise<CachedPlant[]> {
  try {
    const colRef = collection(db, 'plantCatalog');
    const q = query(colRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    const plants: CachedPlant[] = [];
    snapshot.forEach((doc) => plants.push({ id: doc.id, ...doc.data() } as CachedPlant));
    
    await dexieDb.plantCatalog.bulkPut(plants);
    return plants;
  } catch (err) {
    console.warn('[Fetch] Plant catalog from Firestore failed, using cache:', err);
    return await dexieDb.plantCatalog.where('active').equals(true).toArray();
  }
}

export async function fetchConstraints(): Promise<CachedConstraint[]> {
  try {
    const colRef = collection(db, 'constraints');
    const q = query(colRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    const constraints: CachedConstraint[] = [];
    snapshot.forEach((doc) => constraints.push({ id: doc.id, ...doc.data() } as CachedConstraint));
    
    await dexieDb.constraints.bulkPut(constraints);
    return constraints;
  } catch (err) {
    console.warn('[Fetch] Constraints from Firestore failed, using cache:', err);
    return await dexieDb.constraints.where('active').equals(true).toArray();
  }
}

export async function fetchWeatherOptions(): Promise<CachedWeather[]> {
  try {
    const colRef = collection(db, 'weatherOptions');
    const q = query(colRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    const weather: CachedWeather[] = [];
    snapshot.forEach((doc) => weather.push({ id: doc.id, ...doc.data() } as CachedWeather));
    
    await dexieDb.weatherOptions.bulkPut(weather);
    return weather;
  } catch (err) {
    console.warn('[Fetch] Weather from Firestore failed, using cache:', err);
    return await dexieDb.weatherOptions.where('active').equals(true).toArray();
  }
}

export async function fetchLaborRoles(): Promise<CachedLaborRole[]> {
  try {
    const colRef = collection(db, 'laborRoles');
    const q = query(colRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    const roles: CachedLaborRole[] = [];
    snapshot.forEach((doc) => roles.push({ id: doc.id, ...doc.data() } as CachedLaborRole));
    
    await dexieDb.laborRoles.bulkPut(roles);
    return roles;
  } catch (err) {
    console.warn('[Fetch] Labor roles from Firestore failed, using cache:', err);
    return await dexieDb.laborRoles.where('active').equals(true).toArray();
  }
}

export async function fetchSites(): Promise<CachedSite[]> {
  try {
    const colRef = collection(db, 'sites');
    const q = query(colRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    const sites: CachedSite[] = [];
    snapshot.forEach((doc) => sites.push({ id: doc.id, ...doc.data() } as CachedSite));
    
    await dexieDb.sites.bulkPut(sites);
    return sites;
  } catch (err) {
    console.warn('[Fetch] Sites from Firestore failed, using cache:', err);
    return await dexieDb.sites.where('active').equals(true).toArray();
  }
}

// Bilingual search helper
export function searchBilingual<T extends { nameEn?: string; nameZh?: string }>(
  items: T[],
  query: string,
  fields: (keyof T)[] = ['nameEn', 'nameZh']
): T[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;

  return items.filter((item) => {
    for (const field of fields) {
      const value = (item[field] as string)?.toLowerCase() || '';
      if (value.includes(q)) return true;
    }
    return false;
  });
}