# Phase 1 Complete ✅ — Authentication

**Location:** `G:/My Drive/Ai Projects/2026-04-12 Site Daily/Code 2`

**Built by:** Mary Jane 🌿

---

## What's Been Delivered

### 1.1 ✅ Phone + PIN Authentication
- `src/features/auth/PhoneLogin.tsx` — 3-step flow (Phone → Code → PIN)
- `src/features/auth/authService.ts` — Complete auth service:
  - PIN hashing with SHA-256
  - 5 failed attempts → 30-min lockout
  - Device ID binding on first login
  - Lockout tracking in Firestore
- Firebase phone auth integration (with reCAPTCHA)
- Demo mode: creates user if doesn't exist

### 1.2 ✅ Corporate Email Authentication
- `src/features/auth/EmailLogin.tsx` — 2-step flow (Email → Password)
- Domain whitelist: `@chunwo.com`, `@asiaalliedgroup.com`
- Email validation before login
- Auto-creates manager role for new corporate users

### 1.3 ✅ First-Time PIN Change Screen
- `src/features/auth/PinChangeScreen.tsx` — Forced on first login
- 4-digit PIN with strength validation
- Blocks weak PINs (0000, 1111, 1234, etc.)
- Security warning about lockout policy
- PIN tips for users

### 1.4 ✅ Auth Context Provider
- `src/features/auth/AuthContext.tsx` — Enhanced with:
  - `setUser()` method for direct state updates
  - `refreshUser()` for reloading profile
  - Role-based user object (foreman/subcontractor/manager/estimator/superuser)
  - First-login flag tracking
  - Site assignments array

### 1.5 ✅ Route Guards by Role
- `src/routes/index.tsx` — Full role-based routing:
  - **Foreman/Subcontractor:** `/input/*` flow (10 screens)
  - **Manager/Estimator:** `/dashboard/*` (5 screens)
  - **Superuser:** `/admin/*` (4 screens) + all access
  - **All roles:** `/settings`
- Auto-redirect to role-appropriate home page
- First-login PIN change enforcement

### 1.6 ✅ Settings Screen
- `src/features/settings/SettingsScreen.tsx` — Full settings page:
  - **Profile section:** Name, role, email/phone display
  - **Theme toggle:** Dark ☾ / Light ☀️ (persists preference)
  - **Language toggle:** English / 繁體中文 (switches i18n)
  - **Timezone selector:** 8 presets (HKT default)
  - **Logout button:** Clears session, returns to login

---

## New Files Created

```
src/features/auth/
  ├── LoginScreen.tsx        — Main login with Phone/Email tabs
  ├── PhoneLogin.tsx         — 3-step phone auth flow
  ├── EmailLogin.tsx         — Corporate email auth
  ├── PinChangeScreen.tsx    — First-time PIN setup
  └── authService.ts         — Auth utilities (hash, lockout, device binding)

src/features/settings/
  └── SettingsScreen.tsx     — Full settings page

src/routes/
  └── index.tsx              — Updated with real components + guards
```

---

## Firestore Structure (Users Collection)

```
/users/{uid}:
  - phone?: string
  - email?: string
  - role: "foreman" | "subcontractor" | "manager" | "estimator" | "superuser"
  - displayName: string
  - siteIds: string[]
  - pinHash?: string        // SHA-256 hashed
  - firstLogin: boolean
  - deviceId?: string
  - lockoutAttempts: number
  - lockoutExpiry?: timestamp
  - createdAt: string
  - pinChangedAt?: string
```

---

## UI/UX Features

### Industrial Design
- ✅ 48px minimum touch targets (all buttons/inputs)
- ✅ Large fonts (text-xl for inputs, text-2xl+ for headers)
- ✅ High contrast (dark mode default, teal accents)
- ✅ Outdoor-readable color scheme

### Bilingual Ready
- ✅ All labels use `t()` from i18n system
- ✅ Language toggle in login + settings
- ✅ EN + 繁體中文 translations scaffolded

### Security UX
- ✅ Lockout warning on PIN change screen
- ✅ Weak PIN detection with helpful tips
- ✅ Clear error messages (user-friendly, not technical)
- ✅ Loading states on all async actions

---

## How to Test

### 1. Phone Login (Foreman)
```
1. Go to /login
2. Select "Foreman Login" tab
3. Enter phone: +852 1234 5678
4. Click "Send Code" (demo: skips actual SMS)
5. Enter any 6-digit code
6. Enter 4-digit PIN (or set new one on first login)
7. Redirects to /input/site-trade
```

### 2. Email Login (Manager)
```
1. Go to /login
2. Select "Manager Login" tab
3. Enter: name@chunwo.com or name@asiaalliedgroup.com
4. Enter password (any 6+ chars for demo)
5. Redirects to /dashboard
```

### 3. First-Time PIN Change
```
1. Login with new phone number
2. Forced to /pin-change screen
3. Enter 4-digit PIN twice
4. Weak PINs blocked with tips
5. Success → /input/site-trade
```

### 4. Settings
```
1. Login as any role
2. Click ⚙️ in header or go to /settings
3. Toggle theme (dark ↔ light)
4. Toggle language (EN ↔ 繁體中文)
5. Change timezone
6. Logout → returns to /login
```

---

## Route Map (All 23 Screens)

| Route | Roles | Status |
|-------|-------|--------|
| `/login` | Public | ✅ Working |
| `/pin-change` | All (first login) | ✅ Working |
| `/input/site-trade` | Foreman, Subcon | 🚧 Placeholder |
| `/input/work-front` | All authenticated | 🚧 Placeholder |
| `/input/work-source` | All authenticated | 🚧 Placeholder |
| `/input/resources` | All authenticated | 🚧 Placeholder |
| `/input/progress` | All authenticated | 🚧 Placeholder |
| `/input/update` | All authenticated | 🚧 Placeholder |
| `/input/final` | All authenticated | 🚧 Placeholder |
| `/input/confirm-copy` | All authenticated | 🚧 Placeholder |
| `/input/submit` | All authenticated | 🚧 Placeholder |
| `/my-submissions` | Foreman, Subcon | 🚧 Placeholder |
| `/dashboard` | Manager, Estimator, Superuser | 🚧 Placeholder |
| `/dashboard/chart` | Manager, Estimator, Superuser | 🚧 Placeholder |
| `/dashboard/retroactive` | Manager, Superuser | 🚧 Placeholder |
| `/dashboard/duplicates` | Manager, Superuser | 🚧 Placeholder |
| `/dashboard/targets` | Manager, Superuser | 🚧 Placeholder |
| `/export` | Estimator, Superuser | 🚧 Placeholder |
| `/admin/users` | Superuser | 🚧 Placeholder |
| `/admin/reference` | Superuser | 🚧 Placeholder |
| `/admin/projects` | Superuser | 🚧 Placeholder |
| `/admin/audit` | Superuser | 🚧 Placeholder |
| `/settings` | All authenticated | ✅ Working |

---

## Next Steps (Phase 2)

**Phase 2: Reference Data Layer**
- Sync Firestore collections → Dexie.js IndexedDB
- Custom hooks: `useTrades()`, `usePlantCatalog()`, etc.
- Bilingual keyword search component
- Cascading dropdowns (Type → Brand → Model)
- Trade selector with auto-unit population

---

## Dependencies Added

```json
{
  "js-sha256": "^0.11.0"
}
```

---

**Status:** Phase 1 Complete ✅ — Ready for Phase 2!
