/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { ScutCreditsTransaction, User } from '../types';

// Constants for initial reward rules (these can be updated by admin or fetched dynamically)
export const DEFAULT_CREDIT_RULES = [
  { id: 'rule-daily', name: 'Daily Check-in Reward', amount: 20, type: 'earn_community', description: 'Log in to SCUT daily' },
  { id: 'rule-ai-chat', name: 'AI Chat Query', amount: 5, type: 'earn_ai', description: 'Engage with SCUT AI or SCUT Chat' },
  { id: 'rule-ai-img', name: 'AI Image Synthesis', amount: 10, type: 'earn_ai', description: 'Synthesize images using SCUT AI' },
  { id: 'rule-news-post', name: 'Community Post or Engagement', amount: 3, type: 'earn_community', description: 'Interact in community channels, news, or forums' },
  { id: 'rule-referral', name: 'Referral Sign-up', amount: 50, type: 'earn_referral', description: 'Invite a colleague with your referral key' },
  { id: 'rule-achieve-1', name: 'AI Power User Milestone', amount: 100, type: 'earn_achievement', description: 'Reach 50 active conversational payloads' },
  { id: 'rule-achieve-2', name: 'Community Advocate Milestone', amount: 150, type: 'earn_achievement', description: 'Help 5 peers in Mica Bucurie safe space' }
];

// Achievements state tracking
export const ACHIEVEMENTS = [
  { id: 'ach-1', title: 'First Conversation', description: 'Triggered first secure SCUT AI payload', reward: 20, progress: 1, max: 1 },
  { id: 'ach-2', title: 'Silicon Synthesizer', description: 'Generated 5 images using text-to-image engine', reward: 50, progress: 0, max: 5 },
  { id: 'ach-3', title: 'Community Pillar', description: 'Complete 3 interactions in Mica Bucurie', reward: 100, progress: 0, max: 3 },
  { id: 'ach-4', title: 'SafeHaven Shield', description: 'Configure an encrypted panic phrase keyword', reward: 40, progress: 0, max: 1 }
];

/**
 * Retrieves the user's credits balance from Firestore
 */
export async function getUserCredits(uid: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return typeof data.scutCredits === 'number' ? data.scutCredits : 100; // default 100 credits for newcomers
    }
    return 100;
  } catch (err) {
    console.error("Error getting user credits:", err);
    return 100;
  }
}

/**
 * Listens to users' credits transactions
 */
export function listenToCreditTransactions(uid: string, callback: (txs: ScutCreditsTransaction[]) => void): Unsubscribe {
  const txRef = collection(db, 'users', uid, 'credit_transactions');
  const q = query(txRef, orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const txs: ScutCreditsTransaction[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      txs.push({
        id: docSnap.id,
        amount: data.amount,
        type: data.type,
        description: data.description,
        timestamp: data.timestamp || new Date().toLocaleString()
      } as ScutCreditsTransaction);
    });
    callback(txs);
  }, (error) => {
    console.error("Error listening to credits transactions:", error);
  });
}

/**
 * Core function to award or deduct user credits and store transaction log
 */
export async function adjustCredits(
  uid: string, 
  amount: number, 
  type: ScutCreditsTransaction['type'], 
  description: string
): Promise<number> {
  try {
    // 1. Get current user balance or set default
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    let currentBalance = 100;
    if (snap.exists()) {
      const data = snap.data();
      currentBalance = typeof data.scutCredits === 'number' ? data.scutCredits : 100;
    }

    const newBalance = Math.max(0, currentBalance + amount);

    // 2. Update user document
    await setDoc(userRef, { scutCredits: newBalance }, { merge: true });

    // 3. Create unique transaction record in subcollection
    const txId = 'tx-credits-' + Math.random().toString(36).substring(2, 9);
    const txRef = doc(db, 'users', uid, 'credit_transactions', txId);
    await setDoc(txRef, {
      id: txId,
      amount,
      type,
      description,
      timestamp: new Date().toLocaleString()
    });

    return newBalance;
  } catch (err) {
    console.error("Error adjusting credits:", err);
    throw err;
  }
}

/**
 * Specific wrapper to Earn Credits safely
 */
export async function earnCredits(
  uid: string, 
  amount: number, 
  type: ScutCreditsTransaction['type'], 
  description: string
): Promise<number> {
  return await adjustCredits(uid, amount, type, description);
}

/**
 * Specific wrapper to Spend Credits safely (will return false if balance insufficient)
 */
export async function spendCredits(
  uid: string, 
  amount: number, 
  type: ScutCreditsTransaction['type'], 
  description: string
): Promise<boolean> {
  try {
    const balance = await getUserCredits(uid);
    if (balance < amount) {
      return false; // Insufficient internal virtual funds
    }
    await adjustCredits(uid, -amount, type, description);
    return true;
  } catch (err) {
    console.error("Error spending credits:", err);
    return false;
  }
}
