import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId and ignoreUndefinedProperties
const rawDatabaseId = (firebaseConfigData as any).firestoreDatabaseId;
const databaseId = rawDatabaseId && rawDatabaseId !== '(default)' ? rawDatabaseId : undefined;

let firestoreInstance: Firestore;
try {
  firestoreInstance = databaseId
    ? initializeFirestore(app, { ignoreUndefinedProperties: true }, databaseId)
    : initializeFirestore(app, { ignoreUndefinedProperties: true });
} catch {
  firestoreInstance = databaseId
    ? getFirestore(app, databaseId)
    : getFirestore(app);
}

export const db: Firestore = firestoreInstance;

export const auth: Auth = getAuth(app);

// Test Firestore connection on startup as mandated by Firebase integration guidelines
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

