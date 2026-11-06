import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured databaseId
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Strict Operation Types for Zero-Trust Auditing
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
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

// Test Connection on Boot
if (typeof window !== 'undefined') {
  (async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase connection check: Client offline or local network restricted.');
      }
    }
  })();
}

// Helper: Sync User Profile to Firestore
export async function syncUserProfileToFirestore(user: User, additionalData?: { grade?: string; planTier?: string; studentName?: string }) {
  if (!user || !user.uid) return null;
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();
  
  try {
    const existingSnap = await getDoc(userRef);
    if (!existingSnap.exists()) {
      const profile = {
        id: user.uid,
        email: user.email || '',
        displayName: additionalData?.studentName || user.displayName || user.email?.split('@')[0] || 'Student',
        grade: additionalData?.grade || 'Grade 10',
        planTier: additionalData?.planTier || 'starter',
        createdAt: now,
        updatedAt: now
      };
      await setDoc(userRef, profile);
      return profile;
    } else {
      const data = existingSnap.data();
      const updated = {
        ...data,
        updatedAt: now,
        ...(additionalData?.grade ? { grade: additionalData.grade } : {}),
        ...(additionalData?.planTier ? { planTier: additionalData.planTier } : {}),
        ...(additionalData?.studentName ? { displayName: additionalData.studentName } : {})
      };
      await setDoc(userRef, updated, { merge: true });
      return updated;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Helper: Save Bioscience Experiment Record
export interface BioscienceExperimentRecord {
  id: string;
  userId: string;
  title: string;
  category: string;
  structureId: string;
  observations: string;
  quizScore?: number;
  masteryLevel?: string;
  createdAt: string;
}

export async function saveBioscienceExperiment(experiment: Omit<BioscienceExperimentRecord, 'id' | 'userId' | 'createdAt'> & { id?: string }) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn('Cannot persist bioscience experiment: user not signed in to Firebase');
    return null;
  }

  const expId = experiment.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `users/${currentUser.uid}/bioscience_experiments/${expId}`;
  const now = new Date().toISOString();

  const payload: BioscienceExperimentRecord = {
    id: expId,
    userId: currentUser.uid,
    title: experiment.title,
    category: experiment.category,
    structureId: experiment.structureId,
    observations: experiment.observations,
    quizScore: experiment.quizScore || 100,
    masteryLevel: experiment.masteryLevel || 'Proficient',
    createdAt: now
  };

  try {
    await setDoc(doc(db, 'users', currentUser.uid, 'bioscience_experiments', expId), payload);
    return payload;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }
}

// Helper: Fetch Bioscience Experiments
export async function getBioscienceExperiments(userId: string) {
  const path = `users/${userId}/bioscience_experiments`;
  try {
    const q = query(collection(db, 'users', userId, 'bioscience_experiments'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as BioscienceExperimentRecord);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
