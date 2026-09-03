import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Real-time collection listener (Live Two-Way Synchronization across all browsers)
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: T[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as T;
            list.push({ ...data, id: data.id || d.id });
          });
          onData(list);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time single document listener
 */
export function subscribeToSingleDoc<T>(
  collectionName: string,
  docId: string,
  onData: (data: T) => void,
  onError?: (err: any) => void
): Unsubscribe {
  try {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onData(snap.data() as T);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Execute a promise with a maximum timeout (default 3500ms)
 * to avoid indefinite hanging on slow or offline networks.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 3500,
  fallbackValue: T
): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallbackValue);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    return fallbackValue;
  }
}

/**
 * Fetch all documents from a Firestore collection with timeout.
 * Returns null if collection is empty or timed out, allowing caller
 * to preserve user's local state.
 */
export async function getCollectionData<T extends { id: string }>(
  collectionName: string,
  timeoutMs = 3500
): Promise<T[] | null> {
  const fetchPromise = async (): Promise<T[] | null> => {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        return null;
      }
      const list: T[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as T);
      });
      return list.length > 0 ? list : null;
    } catch (err: any) {
      // If Firestore rules or network are not ready, gracefully fall back to local storage
      if (err?.code === 'permission-denied') {
        // Permissions not yet active or collection restricted, silent fallback to local
        return null;
      }
      console.debug(`Firestore read fallback on [${collectionName}]:`, err?.message || err);
      return null;
    }
  };

  return withTimeout<T[] | null>(fetchPromise(), timeoutMs, null);
}

/**
 * Fetch a single document with timeout.
 */
export async function getSingleDoc<T>(
  collectionName: string,
  docId: string,
  timeoutMs = 3500
): Promise<T | null> {
  const fetchPromise = async (): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as T;
      }
      return null;
    } catch (err: any) {
      if (err?.code === 'permission-denied') return null;
      console.debug(`Firestore read doc fallback [${collectionName}/${docId}]:`, err?.message || err);
      return null;
    }
  };

  return withTimeout<T | null>(fetchPromise(), timeoutMs, null);
}

/**
 * Helper to remove undefined fields recursively and prevent oversized fields (> 500KB)
 * so Firestore never throws invalid data or document-size-limit errors.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === undefined) return null as any;
  if (data === null) return null as any;
  if (Array.isArray(data)) {
    return data.map((item) => cleanForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        if (typeof value === 'string' && value.length > 500000) {
          // If a base64 photo is oversized (> 500KB), replace with standard fallback to prevent Firestore 1MB error
          if (key === 'photoUrl' || key === 'imageUrl' || key === 'avatar' || value.startsWith('data:image/')) {
            console.warn(`[Firestore Sanitizer] Truncated oversized base64 image field "${key}" (${value.length} bytes) to protect document size.`);
            cleaned[key] = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
          } else {
            cleaned[key] = value.substring(0, 500000);
          }
        } else {
          cleaned[key] = cleanForFirestore(value);
        }
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Save / Update a single document in Firestore
 */
export async function saveDocToFirestore<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const cleanData = cleanForFirestore(data);
    const docRef = doc(db, collectionName, String(docId));
    await setDoc(docRef, cleanData, { merge: true });
    console.log(`[Firestore] Saved ${collectionName}/${docId}`);
  } catch (err: any) {
    if (err?.code === 'permission-denied') return;
    console.error(`[Firestore Error] Writing doc to [${collectionName}/${docId}]:`, err?.message || err);
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocFromFirestore(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    console.log(`[Firestore] Deleted ${collectionName}/${docId}`);
  } catch (err: any) {
    if (err?.code === 'permission-denied') return;
    console.error(`[Firestore Error] Deleting doc from [${collectionName}/${docId}]:`, err?.message || err);
  }
}

/**
 * Seed or sync an entire collection in batch with safety chunking (max 450 per batch)
 */
export async function seedCollection<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  try {
    if (!items || items.length === 0) return;

    // Firestore batch limit is 500 ops. Chunk by 400.
    const chunkSize = 400;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((item) => {
        if (item && item.id) {
          const cleanItem = cleanForFirestore(item);
          const docRef = doc(db, collectionName, String(item.id));
          batch.set(docRef, cleanItem, { merge: true });
        }
      });
      await batch.commit();
    }
    console.log(`[Firestore] Batch wrote ${items.length} items to ${collectionName}`);
  } catch (err: any) {
    if (err?.code === 'permission-denied') return;
    console.error(`[Firestore Error] Batch write for [${collectionName}]:`, err?.message || err);
  }
}
