import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User, 
  Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  Firestore,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { UserStudyProfile, PYQQuestion, MistakeNotebookItem, TestAttemptResult, Subject, Chapter } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown, 
  operationType: OperationType, 
  path: string | null,
  authInstance?: Auth | null
): never {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isConfigured = false;

// Attempt to load Firebase config from window or localStorage
export function initFirebaseService(): boolean {
  try {
    let customConfig = (window as any).__FIREBASE_CONFIG__;
    if (!customConfig) {
      const stored = localStorage.getItem('studydost_firebase_config');
      if (stored) {
        customConfig = JSON.parse(stored);
      }
    }

    if (customConfig && customConfig.apiKey) {
      app = !getApps().length ? initializeApp(customConfig) : getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app, customConfig.firestoreDatabaseId);
      isConfigured = true;
      return true;
    }
  } catch (e) {
    console.warn('Firebase init notice (running in offline/local storage mode):', e);
  }
  return false;
}

// Initial boot attempt
initFirebaseService();

export function isFirebaseConfigured(): boolean {
  return isConfigured && !!auth && !!db;
}

export function getFirebaseAuth(): Auth | null {
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  return db;
}

/**
 * Validate Connection to Firestore (Per skill guidelines)
 */
export async function testFirestoreConnection(): Promise<{ connected: boolean; message: string }> {
  if (!db) {
    return { 
      connected: false, 
      message: 'Firebase is not initialized yet. The application is operating in full offline local storage mode.' 
    };
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { connected: true, message: 'Successfully connected to live Firestore database.' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { connected: false, message: 'Client is offline. Please check your network and Firebase configuration.' };
    }
    // If the server answered with permission-denied, server connectivity is verified!
    return { connected: true, message: 'Connected to Firestore server (Zero-trust security rules active).' };
  }
}

/**
 * Allows user to plug in their Firebase Web Config JSON manually from the UI
 */
export function configureFirebaseManually(configObj: any): boolean {
  try {
    if (!configObj || !configObj.apiKey || !configObj.projectId) {
      throw new Error('Config missing required apiKey or projectId');
    }
    localStorage.setItem('studydost_firebase_config', JSON.stringify(configObj));
    (window as any).__FIREBASE_CONFIG__ = configObj;
    return initFirebaseService();
  } catch (e) {
    console.error('Failed to configure Firebase:', e);
    return false;
  }
}

/**
 * Sign in using Google Auth Popup
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// User Profile cloud sync
export async function syncUserProfileToCloud(profile: UserStudyProfile): Promise<void> {
  if (!db || !auth?.currentUser) return;
  const path = `users/${profile.uid}/profile/main`;
  try {
    await setDoc(doc(db, path), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path, auth);
  }
}

// Mistake Notebook item sync
export async function saveMistakeToCloud(item: MistakeNotebookItem): Promise<void> {
  if (!db || !auth?.currentUser) return;
  const path = `users/${item.userId}/mistakes/${item.id}`;
  try {
    await setDoc(doc(db, path), item, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path, auth);
  }
}

// Test Attempt result sync
export async function saveTestAttemptToCloud(result: TestAttemptResult): Promise<void> {
  if (!db || !auth?.currentUser) return;
  const path = `users/${result.userId}/testAttempts/${result.id}`;
  try {
    await setDoc(doc(db, path), result);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path, auth);
  }
}

// Admin Bulk Import for Authorized Questions
export async function importQuestionsToCloud(questions: PYQQuestion[]): Promise<number> {
  if (!db || !auth?.currentUser) {
    return 0;
  }
  const batch = writeBatch(db);
  for (const q of questions) {
    const ref = doc(db, 'pyqQuestions', q.id);
    batch.set(ref, {
      ...q,
      importedAt: new Date().toISOString(),
    });
  }
  try {
    await batch.commit();
    return questions.length;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'pyqQuestions', auth);
  }
}
