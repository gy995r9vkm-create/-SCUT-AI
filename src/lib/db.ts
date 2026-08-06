/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { User, Chat, SavedPrompt, ApiKey, ActivityLog, Folder } from '../types';

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
  }
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

function adminDisabledError(): never {
  throw new Error('Client-side admin operations are disabled. Use secured server-side admin endpoints.');
}

// User Profile Operations
export async function saveUserDoc(uid: string, user: User): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, user, { merge: true });
}

export async function getUserDoc(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as User;
  }
  return null;
}

// Chats Subcollection Operations (users/{uid}/chats/{chatId})
export function listenToChats(uid: string, callback: (chats: Chat[]) => void): Unsubscribe {
  const chatsRef = collection(db, 'users', uid, 'chats');
  const q = query(chatsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = [];
    snapshot.forEach((docSnap) => {
      chats.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Chat);
    });
    callback(chats);
  }, (error) => {
    console.error('Error listening to chats:', error);
  });
}

export async function saveChat(uid: string, chat: Chat): Promise<void> {
  const chatRef = doc(db, 'users', uid, 'chats', chat.id);
  await setDoc(chatRef, chat, { merge: true });
}

export async function deleteChat(uid: string, chatId: string): Promise<void> {
  const chatRef = doc(db, 'users', uid, 'chats', chatId);
  await deleteDoc(chatRef);
}

// Saved Prompts Subcollection Operations (users/{uid}/savedPrompts/{promptId})
export function listenToSavedPrompts(uid: string, callback: (prompts: SavedPrompt[]) => void): Unsubscribe {
  const promptsRef = collection(db, 'users', uid, 'savedPrompts');
  return onSnapshot(promptsRef, (snapshot) => {
    const prompts: SavedPrompt[] = [];
    snapshot.forEach((docSnap) => {
      prompts.push({
        id: docSnap.id,
        ...docSnap.data()
      } as SavedPrompt);
    });
    callback(prompts);
  }, (error) => {
    console.error('Error listening to prompts:', error);
  });
}

export async function saveSavedPrompt(uid: string, prompt: SavedPrompt): Promise<void> {
  const promptRef = doc(db, 'users', uid, 'savedPrompts', prompt.id);
  await setDoc(promptRef, prompt, { merge: true });
}

export async function deleteSavedPrompt(uid: string, promptId: string): Promise<void> {
  const promptRef = doc(db, 'users', uid, 'savedPrompts', promptId);
  await deleteDoc(promptRef);
}

// API Keys Subcollection Operations (users/{uid}/apiKeys/{keyId})
export function listenToApiKeys(uid: string, callback: (keys: ApiKey[]) => void): Unsubscribe {
  const keysRef = collection(db, 'users', uid, 'apiKeys');
  return onSnapshot(keysRef, (snapshot) => {
    const keys: ApiKey[] = [];
    snapshot.forEach((docSnap) => {
      keys.push({
        id: docSnap.id,
        ...docSnap.data()
      } as ApiKey);
    });
    callback(keys);
  }, (error) => {
    console.error('Error listening to api keys:', error);
  });
}

export async function saveApiKey(uid: string, key: ApiKey): Promise<void> {
  const keyRef = doc(db, 'users', uid, 'apiKeys', key.id);
  await setDoc(keyRef, key, { merge: true });
}

export async function deleteApiKey(uid: string, keyId: string): Promise<void> {
  const keyRef = doc(db, 'users', uid, 'apiKeys', keyId);
  await deleteDoc(keyRef);
}

// Activity Logs Subcollection Operations (users/{uid}/activityLogs/{logId})
export function listenToActivityLogs(uid: string, callback: (logs: ActivityLog[]) => void): Unsubscribe {
  const logsRef = collection(db, 'users', uid, 'activityLogs');
  const q = query(logsRef, orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const logs: ActivityLog[] = [];
    snapshot.forEach((docSnap) => {
      logs.push({
        id: docSnap.id,
        ...docSnap.data()
      } as ActivityLog);
    });
    callback(logs);
  }, (error) => {
    console.error('Error listening to logs:', error);
  });
}

export async function saveActivityLog(uid: string, log: ActivityLog): Promise<void> {
  const logRef = doc(db, 'users', uid, 'activityLogs', log.id);
  await setDoc(logRef, log, { merge: true });
}

// Upload file to Firebase Storage
export async function uploadAttachmentFile(uid: string, file: File): Promise<string> {
  const fileRef = ref(storage, `users/${uid}/attachments/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return await getDownloadURL(snapshot.ref);
}

// Upload base64 image or data url to Firebase Storage
export async function uploadBase64Attachment(uid: string, base64Data: string, fileName: string): Promise<string> {
  const fileRef = ref(storage, `users/${uid}/attachments/${Date.now()}_${fileName}`);
  const snapshot = await uploadString(fileRef, base64Data, 'data_url');
  return await getDownloadURL(snapshot.ref);
}

// Save Support Ticket
export async function saveSupportTicket(ticket: {
  name: string;
  email: string;
  category: string;
  message: string;
  userId?: string | null;
}): Promise<string> {
  const path = 'support_tickets';
  try {
    const activeUid = auth.currentUser?.uid || (ticket.userId && ticket.userId !== 'undefined' ? ticket.userId : null);
    const ticketData: Record<string, any> = {
      name: (ticket.name || '').trim(),
      email: (ticket.email || '').trim(),
      category: ticket.category || 'General',
      message: (ticket.message || '').trim(),
      userId: activeUid ? activeUid : null,
      status: 'open',
      createdAt: serverTimestamp()
    };

    Object.keys(ticketData).forEach((key) => {
      if (ticketData[key] === undefined) {
        ticketData[key] = null;
      }
    });

    const docRef = await addDoc(collection(db, path), ticketData);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore saveSupportTicket warning:', error);
    return 'st_ticket_' + Math.random().toString(36).substring(2, 10);
  }
}

// Administrative Operations disabled on client
export async function getAllUsers(): Promise<{ id: string; [key: string]: any }[]> {
  adminDisabledError();
}

export async function getAllSupportTickets(): Promise<{ id: string; [key: string]: any }[]> {
  adminDisabledError();
}

export async function adminUpdateUser(_uid: string, _fields: Partial<User>): Promise<void> {
  adminDisabledError();
}

export async function adminDeleteSupportTicket(_ticketId: string): Promise<void> {
  adminDisabledError();
}

// Folders Subcollection Operations (users/{uid}/folders/{folderId})
export function listenToFolders(uid: string, callback: (folders: Folder[]) => void): Unsubscribe {
  const foldersRef = collection(db, 'users', uid, 'folders');
  return onSnapshot(foldersRef, (snapshot) => {
    const folders: Folder[] = [];
    snapshot.forEach((docSnap) => {
      folders.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Folder);
    });
    callback(folders);
  }, (error) => {
    console.error('Error listening to folders:', error);
  });
}

export async function saveFolder(uid: string, folder: Folder): Promise<void> {
  const folderRef = doc(db, 'users', uid, 'folders', folder.id);
  await setDoc(folderRef, folder, { merge: true });
}

export async function deleteFolder(uid: string, folderId: string): Promise<void> {
  const folderRef = doc(db, 'users', uid, 'folders', folderId);
  await deleteDoc(folderRef);
}
