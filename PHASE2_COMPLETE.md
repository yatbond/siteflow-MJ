# Phase 2 Complete ✅ — Reference Data Layer

**Location:** `G:/My Drive/Ai Projects/2026-04-12 Site Daily/Code 2`

**Built by:** Mary Jane 🌿

---

## What's Been Delivered

### 2.1 ✅ Firestore → Dexie Sync Service
- `src/db/syncService.ts` — Complete sync engine:
  - Syncs 6 collections: trades, laborRoles, plantCatalog, constraints, weatherOptions, sites
  - Auto-fallback to Dexie cache if Firestore unavailable
  - Bilingual search helper function
  - Called on app startup in App.tsx

### 2.2 ✅ Custom Data Hooks (5 hooks)

| Hook | Returns | Features |
|------|---------|----------|
| `useTrades()` | 28 trades | Bilingual search, getTradeById(), filtered list |
| `usePlantCatalog()` | Plants by category | Category/brand filtering, cascading support |
| `useConstraints()` | Constraints | Category filtering, getConstraintsByCategory() |
| `useWeatherOptions()` | 10 weather options | getWeatherById(), icon support |
| `useLaborRoles()` | Labor roles | 4 categories, getRolesByCategory() |

**All hooks:**
- ✅ Load from Firestore first
- ✅ Fall back to Dexie cache if offline
- ✅ Auto-retry on next app open
- ✅ Loading + error states

### 2.3 ✅ Bilingual Search Component
- `src/components/BilingualSearch.tsx`
- 🔍 Search icon + clear button
- Filters EN + 繁體中文 simultaneously
- 48px touch target, large text (text-xl)

### 2.4 ✅ Cascading Dropdown Component
- `src/components/CascadingSelect.tsx`
- Type → Brand → Model flow
- Auto-resets downstream selections
- Disabled state handling (can't select brand without type)

### 2.5 ✅ Trade Selector Component
- `src/components/TradeSelector.tsx`
- Searchable dropdown with bilingual display
- Shows standard unit badge (e.g., "m²", "kg", "ton")
- Auto-populates unit when trade selected
- Notes dual-unit override option for applicable trades

---

## New Files Created

```
src/db/
  └── syncService.ts         — Firestore → Dexie sync engine

src/hooks/
  ├── useTrades.ts
  ├── usePlantCatalog.ts
  ├── useConstraints.ts
  ├── useWeatherOptions.ts
  └── useLaborRoles.ts

src/components/
  ├── BilingualSearch.tsx    — 🔍 Search input (EN + 中文)
  ├── CascadingSelect.tsx    — Type→Brand→Model dropdown
  └── TradeSelector.tsx      — Trade picker with unit display

src/
  └── App.tsx                — Updated with initializeReferenceData()
```

---

## Data Structure (Firestore Collections)

### `/trades/{tradeId}`
```typescript
{
  nameEn: string;           // e.g., "Steel Fixer"
  nameZh: string;           // e.g., "鋼筋工"
  standardUnit: string;     // e.g., "kg", "m²", "ton"
  primaryLaborTypes: string[];
  active: boolean;
}
```

### `/plantCatalog/{plantId}`
```typescript
{
  categoryEn: string;       // e.g., "Excavators"
  categoryZh: string;       // e.g., "挖土機"
  brand: string;            // e.g., "CAT", "Komatsu"
  model: string;            // e.g., "320 GC", "PC200-8"
  capacity?: string;        // e.g., "20 ton", "1.2m³"
  active: boolean;
}
```

### `/constraints/{constraintId}`
```typescript
{
  category: string;         // e.g., "Access", "Weather", "Safety"
  nameEn: string;
  nameZh: string;
  active: boolean;
}
```

### `/weatherOptions/{weatherId}`
```typescript
{
  nameEn: string;           // e.g., "Sunny"
  nameZh: string;           // e.g., "晴朗"
  icon: string;             // e.g., "☀️"
  affectsProductivity: boolean;
  active: boolean;
}
```

### `/laborRoles/{roleId}`
```typescript
{
  category: string;         // "Skilled", "Semi-skilled", "Unskilled", "Supervisory"
  nameEn: string;
  nameZh: string;
  defaultRate?: number;     // HKD/day
  active: boolean;
}
```

### `/sites/{siteId}`
```typescript
{
  projectName: string;
  siteName: string;
  address?: string;
  active: boolean;
}
```

---

## Usage Examples

### In a Form Component:
```tsx
import { useTrades } from '@/hooks/useTrades';
import TradeSelector from '@/components/TradeSelector';

function MyForm() {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [unit, setUnit] = useState('kg');
  
  return (
    <TradeSelector
      value={selectedTrade}
      onChange={setSelectedTrade}
      onUnitChange={setUnit}
    />
  );
}
```

### Cascading Plant Selection:
```tsx
import { usePlantCatalog } from '@/hooks/usePlantCatalog';
import CascadingSelect from '@/components/CascadingSelect';

function PlantSelector() {
  const { categories, brands, filteredPlants } = usePlantCatalog();
  const [type, setType] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  
  const models = filteredPlants
    .filter(p => p.categoryEn === type && p.brand === brand)
    .map(p => p.model);
  
  return (
    <CascadingSelect
      categories={categories}
      brands={brands}
      models={models}
      selectedCategory={type}
      selectedBrand={brand}
      selectedModel={model}
      onCategoryChange={setType}
      onBrandChange={setBrand}
      onModelChange={setModel}
    />
  );
}
```

---

## Offline-First Architecture

```
┌─────────────────────────────────────────────────────┐
│  App Startup                                        │
│  ↓                                                  │
│  initializeReferenceData()                          │
│  ↓                                                  │
│  ┌─────────────────────────────────────┐           │
│  │ Try Firestore                       │           │
│  │  ├─ Success → Update Dexie cache    │           │
│  │  └─ Fail → Use Dexie cache          │           │
│  └─────────────────────────────────────┘           │
│  ↓                                                  │
│  Components render with cached data                 │
│  ↓                                                  │
│  Background sync on next app open                   │
└─────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Works offline (IndexedDB cache)
- ✅ Fast initial load (no network wait)
- ✅ Auto-updates when online
- ✅ Graceful degradation

---

## Testing Checklist

### Test Bilingual Search:
```
1. Go to any screen with TradeSelector
2. Type "steel" → should show "Steel Fixer 鋼筋工"
3. Type "鋼筋" → should also show "Steel Fixer 鋼筋工"
4. Clear button (✕) should reset search
```

### Test Cascading Dropdown:
```
1. Select Type: "Excavators"
2. Brand dropdown should enable, show CAT/Komatsu/etc
3. Select Brand: "CAT"
4. Model dropdown should enable, show 320 GC/336/etc
5. Change Type → Brand/Model should reset
```

### Test Trade Selector:
```
1. Open dropdown → see all 28 trades
2. Search "concrete" → filters to Concrete Worker, Concrete Pump, etc
3. Select a trade → unit badge appears (e.g., "m³")
4. Click "Change" → re-open dropdown
```

### Test Offline Mode:
```
1. Open app (online) → data loads
2. Close app, disconnect network
3. Reopen app → should still show data from cache
4. Reconnect → next open syncs latest data
```

---

## Next Steps (Phase 3)

**Phase 3: Input Flow — Site & Trade Selection**
- Site selector (dropdown or search)
- Work date picker (default today, allow past)
- Trade selection (using TradeSelector from Phase 2)
- Auto-populate standard unit
- Dual-unit override toggle
- Save to IndexedDB (draft report)

---

## File Count

| Category | Count |
|----------|-------|
| Sync Service | 1 file |
| Custom Hooks | 5 files |
| UI Components | 3 files |
| Updated Files | 1 (App.tsx) |
| **Total** | **10 files** |

---

**Status:** Phase 2 Complete ✅ — Ready for Phase 3!

**Testing:** You can start testing Phase 1 + 2 now! Run:
```bash
cd "G:/My Drive/Ai Projects/2026-04-12 Site Daily/Code 2"
npm run dev
```

Then:
1. Test login (phone + email)
2. Test settings (theme/language toggle)
3. Navigate to `/input/site-trade` (placeholder for now)
4. Phase 3 will build the actual input screens
