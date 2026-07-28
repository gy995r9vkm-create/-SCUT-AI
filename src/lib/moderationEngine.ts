/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, db } from './firebase';
import { collection, doc, setDoc, getDoc, addDoc } from 'firebase/firestore';

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string; // ID of message, profile, review, listing, etc.
  targetType: 'message' | 'profile' | 'listing' | 'review' | 'file';
  targetContent: string;
  targetOwnerId: string;
  targetOwnerName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ModerationLog {
  id: string;
  moderatorId: string;
  moderatorName: string;
  targetUserId: string;
  targetUserName: string;
  actionType: 'warning' | 'mute' | 'unmute' | 'ban' | 'unban' | 'block_content';
  reason: string;
  details?: string;
  timestamp: string;
}

export interface UserModStatus {
  userId: string;
  userName: string;
  violationsCount: number;
  isBanned: boolean;
  muteUntil: string | null; // ISO Date String or null
  lastViolationAt: string | null;
}

// English & Romanian trigger keywords for hateful, abusive, threatening, sexually explicit, or spam messages
const FORBIDDEN_WORDS = [
  // English abusive/hateful/explicit/spam
  'abuse', 'hateful', 'threaten', 'nigger', 'faggot', 'retard', 'bitch', 'slut', 'whore',
  'fuck', 'shit', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'kill yourself', 'kys',
  'die', 'murder', 'blow up', 'bomb', 'spam', 'viagra', 'casino', 'free money', 'sex', 'porn', 'xxx',
  // Romanian abusive/hateful/explicit/spam
  'prost', 'proasta', 'tampit', 'tampita', 'cretin', 'cretina', 'idiot', 'idiota', 'muie', 'pizda',
  'pula', 'coaie', 'cacat', 'curva', 'tarfa', 'jeg', 'jegos', 'jegoasa', 'mata', 'sa mori', 'te omor'
];

export const COMMUNITY_GUIDELINES = [
  { id: 'g1', title: 'Respect & Dignity', text: 'Treat every member of the SCUT community with respect. No hate speech, abuse, harrassment, or offensive language.' },
  { id: 'g2', title: 'Authenticity & Spam', text: 'No commercial spam, deceptive schemes, or bulk automated postings. Keep the marketplace clean.' },
  { id: 'g3', title: 'Safety & Comfort', text: 'Sexually explicit content, violent threats, self-harm encouragement, and illegal products are strictly forbidden.' },
  { id: 'g4', title: 'Ecosystem Boundaries', text: 'Respect the separation of gender spaces (Women & Girls, Men & Boys) while collaborating fully in all shared hubs.' }
];

/**
 * Perform a deterministic content safety check.
 * Checks for forbidden keywords or offensive phrasing.
 */
export function checkContentSafety(text: string): { isSafe: boolean; reason?: string; category?: string } {
  const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip Romanian diacritics for uniform check
  
  // 1. Check for forbidden words
  for (const word of FORBIDDEN_WORDS) {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
    if (regex.test(normalizedText)) {
      let category = 'Abusive Language / Offense';
      if (['spam', 'viagra', 'casino', 'free money'].includes(word)) {
        category = 'Spam / Advertising';
      } else if (['sex', 'porn', 'xxx', 'pizda', 'pula', 'curva', 'tarfa', 'slut', 'whore'].includes(word)) {
        category = 'Sexually Explicit / Inappropriate Content';
      } else if (['kill yourself', 'kys', 'die', 'murder', 'te omor', 'sa mori'].includes(word)) {
        category = 'Violent Threat / Self-harm';
      }
      
      return {
        isSafe: false,
        reason: `Your message contains language flagged as "${word}", which violates our terms of service regarding "${category}".`,
        category
      };
    }
  }

  // 2. Simple spam repeating chars check (e.g. "aaaaaaa...")
  if (/(.)\1{9,}/.test(normalizedText) && normalizedText.length > 20) {
    return {
      isSafe: false,
      reason: 'Your message was flagged as spam due to repeating character spam.',
      category: 'Spam / Advertising'
    };
  }

  return { isSafe: true };
}

/**
 * Retrieve the current moderation status of a user.
 */
export async function getUserModStatus(userId: string, userName: string = 'User'): Promise<UserModStatus> {
  const localKey = `scut_mod_status_${userId}`;
  const localStatus = localStorage.getItem(localKey);
  
  let status: UserModStatus = {
    userId,
    userName,
    violationsCount: 0,
    isBanned: false,
    muteUntil: null,
    lastViolationAt: null
  };

  if (localStatus) {
    try {
      status = JSON.parse(localStatus);
    } catch (e) {
      // ignore
    }
  }

  // Sync from Firebase if available
  if (auth.currentUser) {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const d = snap.data();
        if (d.moderationStatus) {
          status = {
            ...status,
            violationsCount: d.moderationStatus.violationsCount ?? status.violationsCount,
            isBanned: d.moderationStatus.isBanned ?? status.isBanned,
            muteUntil: d.moderationStatus.muteUntil ?? status.muteUntil,
            lastViolationAt: d.moderationStatus.lastViolationAt ?? status.lastViolationAt
          };
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return status;
}

/**
 * Save user moderation status to local and firestore.
 */
export async function saveUserModStatus(status: UserModStatus): Promise<void> {
  const localKey = `scut_mod_status_${status.userId}`;
  localStorage.setItem(localKey, JSON.stringify(status));

  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'users', status.userId), {
        moderationStatus: {
          violationsCount: status.violationsCount,
          isBanned: status.isBanned,
          muteUntil: status.muteUntil,
          lastViolationAt: status.lastViolationAt
        }
      }, { merge: true });
    } catch (e) {
      console.error("Failed to sync mod status to Firestore", e);
    }
  }
}

/**
 * Handles an automatic violation by tracking infractions and applying tiered penalties.
 * Tiered penalties:
 * - 1st violation: Warning explaining rules.
 * - 2nd violation: Temporary Mute (10 minutes)
 * - 3rd violation: Extended Mute (24 hours)
 * - 4th violation: Permanent Ban
 */
export async function handleAutomaticViolation(
  userId: string, 
  userName: string, 
  violationReason: string,
  violationCategory: string
): Promise<{ penaltyType: 'warning' | 'mute' | 'ban'; penaltyMessage: string; nextStatus: UserModStatus }> {
  const currentStatus = await getUserModStatus(userId, userName);
  const nextViolationsCount = currentStatus.violationsCount + 1;
  const now = new Date();
  
  let penaltyType: 'warning' | 'mute' | 'ban' = 'warning';
  let penaltyMessage = '';
  let muteUntil: string | null = null;
  let isBanned = currentStatus.isBanned;

  if (nextViolationsCount === 1) {
    penaltyType = 'warning';
    penaltyMessage = 'This is your FIRST community guideline infraction. Please maintain a helpful, respectful tone.';
  } else if (nextViolationsCount === 2) {
    penaltyType = 'mute';
    const durationMin = 10;
    const untilDate = new Date(now.getTime() + durationMin * 60 * 1000);
    muteUntil = untilDate.toISOString();
    penaltyMessage = `This is your SECOND infraction. You have been temporarily MUTED for ${durationMin} minutes.`;
  } else if (nextViolationsCount === 3) {
    penaltyType = 'mute';
    const durationMin = 1440; // 24 hours
    const untilDate = new Date(now.getTime() + durationMin * 60 * 1000);
    muteUntil = untilDate.toISOString();
    penaltyMessage = `This is your THIRD infraction. You have been MUTED for 24 hours. Any further infraction will result in a permanent ban.`;
  } else {
    penaltyType = 'ban';
    isBanned = true;
    penaltyMessage = 'You have committed 4 or more infractions. Your account has been PERMANENTLY BANNED from the SCUT community.';
  }

  const updatedStatus: UserModStatus = {
    userId,
    userName,
    violationsCount: nextViolationsCount,
    isBanned,
    muteUntil,
    lastViolationAt: now.toISOString()
  };

  await saveUserModStatus(updatedStatus);

  // Auto-log this action
  await writeModerationLog({
    id: 'autolog-' + Math.random().toString(36).substring(2, 9),
    moderatorId: 'system-bot',
    moderatorName: 'SCUT Automated Safety Bot',
    targetUserId: userId,
    targetUserName: userName,
    actionType: penaltyType === 'warning' ? 'warning' : penaltyType === 'mute' ? 'mute' : 'ban',
    reason: `Automated rule breach: ${violationCategory} (Rule flagged content: "${violationReason}")`,
    details: `Infraction count: ${nextViolationsCount}. Applied penalty: ${penaltyType.toUpperCase()}`,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  return {
    penaltyType,
    penaltyMessage,
    nextStatus: updatedStatus
  };
}

/**
 * Report a specific content item.
 */
export async function submitReport(report: Omit<ModerationReport, 'id' | 'status' | 'createdAt'>): Promise<ModerationReport> {
  const newReport: ModerationReport = {
    ...report,
    id: 'report-' + Math.random().toString(36).substring(2, 9),
    status: 'pending',
    createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // Save to local storage
  const reportsKey = 'scut_moderation_reports';
  const existingReports = JSON.parse(localStorage.getItem(reportsKey) || '[]');
  localStorage.setItem(reportsKey, JSON.stringify([newReport, ...existingReports]));

  // Sync to Firestore if authenticated
  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'moderation_reports', newReport.id), newReport);
    } catch (e) {
      console.error("Failed to sync report to firestore", e);
    }
  }

  return newReport;
}

/**
 * Retrieve all reports.
 */
export async function getAllReports(): Promise<ModerationReport[]> {
  const reportsKey = 'scut_moderation_reports';
  let reports: ModerationReport[] = JSON.parse(localStorage.getItem(reportsKey) || '[]');

  // Seed default report if empty
  if (reports.length === 0) {
    reports = [
      {
        id: 'report-992a',
        reporterId: 'u-3',
        reporterName: 'Sophia Sterling',
        targetId: 'm-12',
        targetType: 'message',
        targetContent: 'You guys are cretins, go back to your caves!',
        targetOwnerId: 'bad-user-1',
        targetOwnerName: 'SpammyGabi',
        reason: 'Harrassment & abusive language towards members in the General channel.',
        status: 'pending',
        createdAt: '2026-07-19 14:32'
      },
      {
        id: 'report-122b',
        reporterId: 'u-2',
        reporterName: 'Mihai Daniel',
        targetId: 'review-5',
        targetType: 'review',
        targetContent: 'BUY CHEAP COINS AT CASINOPOL.RO!!! SPAM SPAM SPAM',
        targetOwnerId: 'bad-user-2',
        targetOwnerName: 'CasinoKing',
        reason: 'Commercial spam on a Romanian Diaspora marketplace listing.',
        status: 'pending',
        createdAt: '2026-07-20 09:15'
      }
    ];
    localStorage.setItem(reportsKey, JSON.stringify(reports));
  }

  return reports;
}

/**
 * Resolve or dismiss a moderation report.
 */
export async function updateReportStatus(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  const reportsKey = 'scut_moderation_reports';
  const existingReports: ModerationReport[] = JSON.parse(localStorage.getItem(reportsKey) || '[]');
  const updated = existingReports.map(r => r.id === reportId ? { ...r, status } : r);
  localStorage.setItem(reportsKey, JSON.stringify(updated));

  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'moderation_reports', reportId), { status }, { merge: true });
    } catch (e) {
      console.error("Failed to update report status in Firestore", e);
    }
  }
}

/**
 * Write a moderation log.
 */
export async function writeModerationLog(log: ModerationLog): Promise<void> {
  const logsKey = 'scut_moderation_logs';
  const existingLogs = JSON.parse(localStorage.getItem(logsKey) || '[]');
  localStorage.setItem(logsKey, JSON.stringify([log, ...existingLogs]));

  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'moderation_logs', log.id), log);
    } catch (e) {
      console.error("Failed to write moderation log in Firestore", e);
    }
  }
}

/**
 * Retrieve all moderation logs.
 */
export async function getAllModerationLogs(): Promise<ModerationLog[]> {
  const logsKey = 'scut_moderation_logs';
  let logs: ModerationLog[] = JSON.parse(localStorage.getItem(logsKey) || '[]');

  if (logs.length === 0) {
    logs = [
      {
        id: 'log-11a',
        moderatorId: 'system-bot',
        moderatorName: 'SCUT Automated Safety Bot',
        targetUserId: 'bad-user-3',
        targetUserName: 'SpammyGabi',
        actionType: 'warning',
        reason: 'Automated rule breach: Spam / Advertising (Rule flagged content: "BUY CRYPTO CASINO NOW")',
        details: 'Infraction count: 1. Applied penalty: WARNING',
        timestamp: '11:42 AM'
      }
    ];
    localStorage.setItem(logsKey, JSON.stringify(logs));
  }

  return logs;
}
