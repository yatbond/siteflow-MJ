import Dexie, { type Table } from 'dexie';

// Firestore collection mirrors for offline use
export interface CachedTrade {
  id: string;
  nameEn: string;
  nameZh: string;
  standardUnit: string;
  primaryLaborTypes: string[];
  active: boolean;
}

export interface CachedLaborRole {
  id: string;
  nameEn: string;
  nameZh: string;
  category: string;
  defaultRate?: number;
  active: boolean;
}

export interface CachedPlant {
  id: string;
  category: string;
  categoryEn: string;
  categoryZh: string;
  brand: string;
  model: string;
  active: boolean;
}

export interface CachedConstraint {
  id: string;
  category: string;
  categoryZh: string;
  nameEn: string;
  nameZh: string;
  active: boolean;
}

export interface CachedWeather {
  id: string;
  nameEn: string;
  nameZh: string;
  icon: string;
  active: boolean;
}

export interface CachedSite {
  id: string;
  name: string;
  nameZh: string;
  active: boolean;
}

export interface DraftReport {
  id?: number;
  localId: string;
  data: Record<string, unknown>;
  lastAutoSave: string;
  status: 'draft';
}

export interface PendingReport {
  id?: number;
  localId: string;
  reportData: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  lastAttempt?: string;
  error?: string;
}

export class SiteFlowDB extends Dexie {
  trades!: Table<CachedTrade, string>;
  laborRoles!: Table<CachedLaborRole, string>;
  plantCatalog!: Table<CachedPlant, string>;
  constraints!: Table<CachedConstraint, string>;
  weatherOptions!: Table<CachedWeather, string>;
  sites!: Table<CachedSite, string>;
  draftReports!: Table<DraftReport, number>;
  pendingReports!: Table<PendingReport, number>;

  constructor() {
    super('SiteFlowDB');
    this.version(2).stores({
      trades: 'id, nameEn, nameZh, active',
      laborRoles: 'id, nameEn, nameZh, category, active',
      plantCatalog: 'id, category, categoryEn, brand, model, active',
      constraints: 'id, category, nameEn, active',
      weatherOptions: 'id, nameEn, active',
      sites: 'id, name, active',
      draftReports: '++id, localId, lastAutoSave',
      pendingReports: '++id, localId, createdAt, retryCount',
    });
  }
}

export const db = new SiteFlowDB();