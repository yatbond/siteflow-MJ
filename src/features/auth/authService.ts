import { signInWithPhoneNumber, RecaptchaVerifier, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { sha256 } from 'js-sha256';

export interface LoginAttempt {
  attempts: number;
  lockoutExpiry?: number;
}

const LOCKOUT_MAX = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Hash PIN for secure storage
export function hashPin(pin: string): string {
  return sha256(pin);
}

// Get device ID (simple browser fingerprint)
export function getDeviceId(): string {
  const stored = localStorage.getItem('siteflow-device-id');
  if (stored) return stored;
  const id = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  localStorage.setItem('siteflow-device-id', id);
  return id;
}

// Setup reCAPTCHA verifier (only once per page load)
let recaptchaVerifier: RecaptchaVerifier | null = null;
export function getRecaptchaVerifier(): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => { /* auto-solved */ },
      'expired-callback': () => { /* reset */ },
    });
  }
  return recaptchaVerifier;
}

// Check if user is locked out
export async function checkLockout(uid: string): Promise<{ locked: boolean; remainingMs?: number }> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return { locked: false };
  }

  const data = userSnap.data();
  if (data.lockoutAttempts >= LOCKOUT_MAX && data.lockoutExpiry) {
    const now = Date.now();
    if (now < data.lockoutExpiry) {
      return { locked: true, remainingMs: data.lockoutExpiry - now };
    }
    // Lockout expired, reset
    await updateDoc(userRef, { lockoutAttempts: 0, lockoutExpiry: null });
  }
  
  return { locked: false };
}

// Record failed login attempt
export async function recordFailedAttempt(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const newAttempts = (data.lockoutAttempts || 0) + 1;
  
  const updateData: Record<string, unknown> = {
    lockoutAttempts: newAttempts,
  };

  if (newAttempts >= LOCKOUT_MAX) {
    updateData.lockoutExpiry = Date.now() + LOCKOUT_DURATION_MS;
  }

  await updateDoc(userRef, updateData);
}

// Reset lockout on successful login
export async function resetLockout(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    lockoutAttempts: 0,
    lockoutExpiry: null,
  });
}

// Validate corporate email domain
export function isValidCorporateEmail(email: string): boolean {
  const allowedDomains = ['chunwo.com', 'asiaalliedgroup.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.includes(domain);
}

// Send phone verification code
export async function sendPhoneCode(phone: string): Promise<string> {
  const verifier = getRecaptchaVerifier();
  const result = await signInWithPhoneNumber(auth, phone, verifier);
  return result.verificationId;
}

// Verify phone code and sign in
export async function verifyPhoneCode(verificationId: string, code: string): Promise<string> {
  const credential = await signInWithCustomToken(auth, verificationId);
  return credential.user.uid;
}

// Validate PIN against stored hash
export async function validatePin(uid: string, pin: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return false;

  const data = userSnap.data();
  if (!data.pinHash) return false;

  const hashedInput = hashPin(pin);
  return hashedInput === data.pinHash;
}

// Update PIN (for first-time change or reset)
export async function updatePin(uid: string, newPin: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const hashedPin = hashPin(newPin);
  await updateDoc(userRef, {
    pinHash: hashedPin,
    firstLogin: false,
  });
}

// Initialize user device binding on first login
export async function bindDevice(uid: string, deviceId: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  if (!data.deviceId) {
    await updateDoc(userRef, { deviceId });
  }
}

// Check if first-time login (needs PIN change)
export async function isFirstLogin(uid: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return false;

  const data = userSnap.data();
  return data.firstLogin === true || !data.pinHash;
}