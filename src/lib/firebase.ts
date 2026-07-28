/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "elevated-bee-p2l12",
  appId: "1:568874153567:web:e9ec590cf97287dce08dea",
  apiKey: "AIzaSyA7Sm85EnpmC1lOWZG0PfgfUzCu-WgvSB8",
  authDomain: "elevated-bee-p2l12.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-scutai-1d9545ae-68bf-4b08-9a05-c8981630adcc",
  storageBucket: "elevated-bee-p2l12.firebasestorage.app",
  messagingSenderId: "568874153567",
  measurementId: "",
  oAuthClientId: "568874153567-bhp3d57t1tnqgmamn0hotdq8n5tdfs7t.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
const storage = getStorage(app);

export { app, auth, db, storage };
