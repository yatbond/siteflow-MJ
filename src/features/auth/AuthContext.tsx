import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'foreman' | 'subcontractor' | 'manager' | 'estimator' | 'superuser';

export interface User {
  uid: string;
  email?: string;
  phone?: string;
  role: UserRole;
  displayName: string;
  siteIds: string[];
  firstLogin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? undefined,
        phone: (data.phone as string | undefined) ?? (firebaseUser.phoneNumber ?? undefined),
        role: (data.role as UserRole) ?? 'foreman',
        displayName: (data.displayName as string | undefined) ?? firebaseUser.email ?? 'User',
        siteIds: (data.siteIds as string[]) ?? [],
        firstLogin: (data.firstLogin as boolean) ?? false,
      };
    }
    // Fallback for dev — users without Firestore document
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? undefined,
      role: 'foreman',
      displayName: firebaseUser.email ?? 'Demo User',
      siteIds: [],
      firstLogin: false,
    };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await fetchUserProfile(fbUser);
      setUser(profile);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;
    const profile = await fetchUserProfile(firebaseUser);
    setUser(profile);
  }, [firebaseUser]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
