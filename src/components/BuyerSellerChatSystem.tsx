/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Send, Image as ImageIcon, FileText, Mic, Square, Play, Pause,
  Volume2, Search, MoreVertical, ShieldAlert, Ban, BellOff, Bell, Flag, Check,
  CheckCheck, X, ShoppingBag, ExternalLink, RefreshCw, Sparkles, AlertTriangle,
  ChevronLeft, Paperclip, Lock, UserCheck, Trash2, Globe, Eye, EyeOff, Tag,
  ShoppingBag as OrderIcon, ArrowLeft
} from 'lucide-react';
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, 
  setDoc, getDoc, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Language } from '../types';

export interface ChatContext {
  type: 'product' | 'order' | 'seller_profile' | 'general';
  productId?: string;
  productTitle?: string;
  productPrice?: string;
  productImage?: string;
  orderId?: string;
  orderStatus?: string;
  orderTotal?: string;
  orderDate?: string;
  sellerId?: string;
  sellerName?: string;
}

export interface ChatParticipant {
  uid: string;
  name: string;
  avatar?: string;
  role?: 'buyer' | 'seller' | 'admin';
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  originalText?: string;
  originalLanguage?: string;
  translatedText?: Record<string, string>;
  mediaType?: 'text' | 'image' | 'document' | 'voice' | 'order_card';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  voiceDuration?: number; // in seconds
  orderCard?: {
    orderId: string;
    itemTitle: string;
    total: string;
    status: string;
    date: string;
    image?: string;
  };
  readBy: string[];
  createdAt: any;
  flaggedByAi?: boolean;
  moderationReason?: string;
}

export interface ConversationThread {
  id: string;
  participants: string[];
  participantProfiles: Record<string, ChatParticipant>;
  lastMessage: string;
  lastMessageTimestamp: any;
  unreadCount: Record<string, number>;
  typing?: Record<string, boolean>;
  mutedBy?: string[];
  blockedBy?: string[];
  context?: ChatContext;
  updatedAt: any;
}

interface BuyerSellerChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage?: Language;
  initialRecipient?: {
    uid: string;
    name: string;
    role?: 'buyer' | 'seller';
    avatar?: string;
  };
  initialContext?: ChatContext;
  onNavigateToOrder?: (orderId: string) => void;
  onNavigateToProduct?: (productId: string) => void;
}

// Simple AI Moderation Engine against scams, spam, and abusive content
export const scanMessageForAiModeration = (text: string): { isSafe: boolean; reason?: string } => {
  const lower = text.toLowerCase();
  
  // Phishing / Off-platform payment scam patterns
  const scamKeywords = [
    'wire transfer directly', 'pay via western union', 'send gift card code', 
    'whatsapp me for discount', 'telegram @', 'contact off platform',
    'send password', 'give me seed phrase', 'crypto private key', 'bank login'
  ];

  for (const kw of scamKeywords) {
    if (lower.includes(kw)) {
      return {
        isSafe: false,
        reason: 'Off-platform payment or credentials request detected. For your safety, transactions must remain inside SCUT Marketplace.'
      };
    }
  }

  // Extreme abuse / hate speech keywords check
  const abuseKeywords = ['kys', 'kill yourself', 'hate all', 'terrorist attack'];
  for (const akw of abuseKeywords) {
    if (lower.includes(akw)) {
      return {
        isSafe: false,
        reason: 'Message contains abusive or non-compliant language violating community safety guidelines.'
      };
    }
  }

  return { isSafe: true };
};

// Language Auto-Translation Dictionary / Mock API fallback
const translateTextLocally = (text: string, targetLang: Language): string => {
  if (targetLang === 'en') return text;
  
  // Basic prefix tag indicating translated content
  const langNames: Record<string, string> = {
    ro: 'Traducere', es: 'Traducción', fr: 'Traduction', de: 'Übersetzung',
    it: 'Traduzione', pt: 'Tradução', ja: '翻訳', zh: '翻译', ru: 'Перевод'
  };

  const label = langNames[targetLang] || 'Translation';
  return `[${label} (${targetLang.toUpperCase()})] ${text}`;
};

export default function BuyerSellerChatSystem({
  isOpen,
  onClose,
  currentLanguage = 'en',
  initialRecipient,
  initialContext,
  onNavigateToOrder,
  onNavigateToProduct
}: BuyerSellerChatSystemProps) {
  const currentUser = auth.currentUser || {
    uid: 'guest_buyer_' + (Math.random().toString(36).substr(2, 6)),
    displayName: 'Verified Buyer',
    email: 'buyer@scutai.com'
  };

  // Active Conversations List
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active Chat Messages
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');

  // Voice recording states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // File upload state
  const [pendingAttachment, setPendingAttachment] = useState<{
    type: 'image' | 'document';
    url: string;
    name: string;
    size?: string;
  } | null>(null);

  // Modals & Menu Overlays
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showShareOrderModal, setShowShareOrderModal] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam or Scam Attempt');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Translation view toggles per message ID
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});

  // Audio Playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 1. Listen to all conversations for current user
  useEffect(() => {
    if (!currentUser?.uid) return;

    try {
      const q = query(
        collection(db, 'direct_chats'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const threads: ConversationThread[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as ConversationThread));
        
        setConversations(threads);
      }, (err) => {
        console.warn("Firestore subscription fallback for chats:", err.message);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Error setting up chat subscription:", e);
    }
  }, [currentUser?.uid]);

  // 2. Initialize or select chat when initialRecipient or initialContext changes
  useEffect(() => {
    if (!isOpen || !initialRecipient) return;

    const findOrCreateThread = async () => {
      const targetUid = initialRecipient.uid;
      const sortedUids = [currentUser.uid, targetUid].sort();
      const customThreadId = `chat_${sortedUids[0]}_${sortedUids[1]}`;

      const existingThread = conversations.find(c => c.id === customThreadId || c.participants.includes(targetUid));

      if (existingThread) {
        setActiveChatId(existingThread.id);
      } else {
        // Create new thread document in Firestore
        const newThread: ConversationThread = {
          id: customThreadId,
          participants: [currentUser.uid, targetUid],
          participantProfiles: {
            [currentUser.uid]: {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Buyer',
              role: 'buyer'
            },
            [targetUid]: {
              uid: targetUid,
              name: initialRecipient.name || 'Seller',
              role: initialRecipient.role || 'seller',
              avatar: initialRecipient.avatar
            }
          },
          lastMessage: initialContext?.productTitle ? `Inquiry regarding ${initialContext.productTitle}` : 'Chat initialized',
          lastMessageTimestamp: Date.now(),
          unreadCount: { [currentUser.uid]: 0, [targetUid]: 1 },
          context: initialContext || { type: 'general' },
          updatedAt: Date.now()
        };

        try {
          await setDoc(doc(db, 'direct_chats', customThreadId), newThread, { merge: true });
          setActiveChatId(customThreadId);
        } catch (e) {
          console.error("Error creating chat thread:", e);
        }
      }
    };

    findOrCreateThread();
  }, [isOpen, initialRecipient, initialContext]);

  // 3. Listen to messages inside activeChatId
  useEffect(() => {
    if (!activeChatId) return;

    const messagesRef = collection(db, 'direct_chats', activeChatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: DirectMessage[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as DirectMessage));

      setMessages(msgs);
      scrollToBottom();

      // Mark unread messages as read by current user
      snapshot.docs.forEach(d => {
        const msgData = d.data() as DirectMessage;
        if (!msgData.readBy?.includes(currentUser.uid)) {
          updateDoc(doc(db, 'direct_chats', activeChatId, 'messages', d.id), {
            readBy: [...(msgData.readBy || []), currentUser.uid]
          }).catch(() => {});
        }
      });
    });

    return () => unsubscribe();
  }, [activeChatId, currentUser.uid]);

  // Fetch user orders when order share modal is opened
  useEffect(() => {
    if (!showShareOrderModal) return;

    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'marketplace_orders'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUserOrders(list);
      } catch (e) {
        console.error("Failed to fetch orders:", e);
      }
    };

    fetchOrders();
  }, [showShareOrderModal]);

  // Active Thread Data
  const activeThread = useMemo(() => {
    return conversations.find(c => c.id === activeChatId) || null;
  }, [conversations, activeChatId]);

  const activePartner = useMemo(() => {
    if (!activeThread) return null;
    const partnerUid = activeThread.participants.find(u => u !== currentUser.uid);
    return partnerUid ? activeThread.participantProfiles?.[partnerUid] || { uid: partnerUid, name: 'Marketplace Contact' } : null;
  }, [activeThread, currentUser.uid]);

  // Handle Typing indicator in Firestore
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (activeChatId) {
      updateDoc(doc(db, 'direct_chats', activeChatId), {
        [`typing.${currentUser.uid}`]: true
      }).catch(() => {});

      setTimeout(() => {
        updateDoc(doc(db, 'direct_chats', activeChatId), {
          [`typing.${currentUser.uid}`]: false
        }).catch(() => {});
      }, 3000);
    }
  };

  // Voice recording handlers
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          sendMediaMessage('voice', base64Audio, 'Voice Message.webm', recordingSeconds);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      triggerToast("Microphone access permission required for voice notes.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  // Image & Document File Selection Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      triggerToast("File size limit is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingAttachment({
        type,
        url: reader.result as string,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      });
    };
    reader.readAsDataURL(file);
  };

  // Send Text or Attachment Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatId) return;

    const messageContent = inputText.trim();
    if (!messageContent && !pendingAttachment) return;

    // AI Safety Scan
    if (messageContent) {
      const modResult = scanMessageForAiModeration(messageContent);
      if (!modResult.isSafe) {
        triggerToast(`⚠️ Safety Block: ${modResult.reason}`);
        return;
      }
    }

    const recipientUid = activePartner?.uid;

    const newMessage: Partial<DirectMessage> = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'User',
      senderAvatar: (currentUser as any).photoURL || (currentUser as any).avatar || undefined,
      text: messageContent || (pendingAttachment ? `Sent a ${pendingAttachment.type}` : ''),
      originalText: messageContent,
      originalLanguage: currentLanguage,
      mediaType: pendingAttachment ? pendingAttachment.type : 'text',
      mediaUrl: pendingAttachment?.url || undefined,
      mediaName: pendingAttachment?.name || undefined,
      mediaSize: pendingAttachment?.size || undefined,
      readBy: [currentUser.uid],
      createdAt: Date.now()
    };

    setInputText('');
    setPendingAttachment(null);

    try {
      // 1. Add message doc
      await addDoc(collection(db, 'direct_chats', activeChatId, 'messages'), newMessage);

      // 2. Update conversation meta
      await updateDoc(doc(db, 'direct_chats', activeChatId), {
        lastMessage: messageContent || (pendingAttachment ? `[${pendingAttachment.type.toUpperCase()}]` : 'Attachment'),
        lastMessageTimestamp: Date.now(),
        updatedAt: Date.now(),
        [`typing.${currentUser.uid}`]: false,
        ...(recipientUid ? { [`unreadCount.${recipientUid}`]: (activeThread?.unreadCount?.[recipientUid] || 0) + 1 } : {})
      });

      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
      triggerToast("Failed to send message. Please try again.");
    }
  };

  // Helper for voice notes
  const sendMediaMessage = async (type: 'voice', url: string, name: string, duration: number) => {
    if (!activeChatId) return;

    const newMessage: Partial<DirectMessage> = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'User',
      text: `🎤 Voice note (${duration}s)`,
      mediaType: 'voice',
      mediaUrl: url,
      mediaName: name,
      voiceDuration: duration,
      readBy: [currentUser.uid],
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, 'direct_chats', activeChatId, 'messages'), newMessage);
      await updateDoc(doc(db, 'direct_chats', activeChatId), {
        lastMessage: `🎤 Voice note (${duration}s)`,
        lastMessageTimestamp: Date.now(),
        updatedAt: Date.now()
      });
      scrollToBottom();
    } catch (e) {
      console.error("Error sending voice note:", e);
    }
  };

  // Share order in chat
  const handleShareOrder = async (order: any) => {
    if (!activeChatId) return;

    const orderCardData = {
      orderId: order.id || 'ORD-9021',
      itemTitle: order.items?.[0]?.title || 'Marketplace Item',
      total: `${order.total || 0} USD`,
      status: order.status || 'Paid',
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today',
      image: order.items?.[0]?.image || undefined
    };

    const newMessage: Partial<DirectMessage> = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'User',
      text: `📦 Shared Order #${orderCardData.orderId}`,
      mediaType: 'order_card',
      orderCard: orderCardData,
      readBy: [currentUser.uid],
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, 'direct_chats', activeChatId, 'messages'), newMessage);
      await updateDoc(doc(db, 'direct_chats', activeChatId), {
        lastMessage: `📦 Shared Order #${orderCardData.orderId}`,
        lastMessageTimestamp: Date.now(),
        updatedAt: Date.now()
      });
      setShowShareOrderModal(false);
      triggerToast("Order shared directly in chat stream!");
      scrollToBottom();
    } catch (e) {
      console.error("Error sharing order:", e);
    }
  };

  // Mute / Block / Report Handlers
  const handleToggleMute = async () => {
    if (!activeChatId || !activeThread) return;
    const mutedList = activeThread.mutedBy || [];
    const isMuted = mutedList.includes(currentUser.uid);
    const updated = isMuted ? mutedList.filter(u => u !== currentUser.uid) : [...mutedList, currentUser.uid];

    await updateDoc(doc(db, 'direct_chats', activeChatId), { mutedBy: updated });
    triggerToast(isMuted ? "Notifications unmuted for this chat." : "Notifications muted for this chat.");
    setIsOptionsOpen(false);
  };

  const handleToggleBlock = async () => {
    if (!activeChatId || !activeThread) return;
    const blockedList = activeThread.blockedBy || [];
    const isBlocked = blockedList.includes(currentUser.uid);
    const updated = isBlocked ? blockedList.filter(u => u !== currentUser.uid) : [...blockedList, currentUser.uid];

    await updateDoc(doc(db, 'direct_chats', activeChatId), { blockedBy: updated });
    triggerToast(isBlocked ? "User unblocked." : "User blocked from sending further messages.");
    setIsOptionsOpen(false);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);

    try {
      await addDoc(collection(db, 'moderation_reports'), {
        reporterId: currentUser.uid,
        targetUser: activePartner?.uid || 'unknown',
        chatId: activeChatId,
        reason: reportReason,
        details: reportDetails,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setIsSubmittingReport(false);
      setShowReportModal(false);
      setReportDetails('');
      triggerToast("Report submitted to SCUT Trust & Safety team.");
    } catch (e) {
      setIsSubmittingReport(false);
      triggerToast("Failed to submit report. Please try again.");
    }
  };

  // Play voice note
  const handlePlayVoice = (msgId: string, url: string) => {
    if (playingAudioId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      audio.play();
      setPlayingAudioId(msgId);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  // Filter conversations search
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => {
      const pName = Object.values(c.participantProfiles || {}).map(p => p.name.toLowerCase()).join(' ');
      const ctx = (c.context?.productTitle || '' + c.context?.orderId || '').toLowerCase();
      const last = (c.lastMessage || '').toLowerCase();
      return pName.includes(q) || ctx.includes(q) || last.includes(q);
    });
  }, [conversations, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 font-sans select-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" 
      />

      {/* Main Responsive Chat Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-5xl h-[88vh] max-h-[750px] bg-slate-950 border border-slate-850 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
      >
        {/* TOAST NOTIFICATION OVERLAY */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900 border border-cyan-400 text-cyan-300 text-xs font-bold shadow-xl flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT PANEL: CONVERSATIONS SEARCH & LIST */}
        <div className={`w-full md:w-80 bg-slate-900/60 border-r border-slate-850 flex flex-col h-full ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h2 className="font-display font-extrabold text-white text-sm">Direct Messages</h2>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-850/60">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search buyer/seller threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          {/* Conversation Thread List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => {
                const partnerUid = thread.participants.find(u => u !== currentUser.uid);
                const partner = partnerUid ? thread.participantProfiles?.[partnerUid] : null;
                const isActive = activeChatId === thread.id;
                const unread = thread.unreadCount?.[currentUser.uid] || 0;
                const isTyping = partnerUid ? thread.typing?.[partnerUid] : false;

                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveChatId(thread.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                      isActive 
                        ? 'bg-cyan-500/10 border border-cyan-400/40 text-white shadow-md' 
                        : 'bg-slate-950/40 hover:bg-slate-900 border border-transparent text-slate-300'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                        {partner?.name?.charAt(0).toUpperCase() || 'M'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">{partner?.name || 'Seller'}</span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {thread.updatedAt ? new Date(thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      {thread.context?.productTitle && (
                        <span className="text-[10px] font-mono text-cyan-400 truncate block">
                          🛒 {thread.context.productTitle}
                        </span>
                      )}

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {isTyping ? <span className="text-cyan-400 font-bold animate-pulse">Typing message...</span> : thread.lastMessage}
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="h-5 min-w-[20px] px-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-mono space-y-2">
                <p>No messages found.</p>
                <p className="text-[10px]">Start a chat from any product or order page!</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CHAT WINDOW */}
        <div className={`flex-1 flex flex-col h-full bg-slate-950 ${!activeChatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {activeThread && activePartner ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveChatId(null)}
                    className="md:hidden p-1.5 rounded-xl bg-slate-800 text-slate-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    {activePartner.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-xs sm:text-sm">{activePartner.name}</h3>
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase">
                        {activePartner.role || 'Seller'}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Active • AI Moderated Encryption
                    </p>
                  </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowShareOrderModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-all flex items-center gap-1 cursor-pointer"
                    title="Share Order Details"
                  >
                    <OrderIcon className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="hidden sm:inline text-[11px]">Share Order</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    <AnimatePresence>
                      {isOptionsOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 space-y-1 z-30 text-xs font-semibold"
                        >
                          <button
                            onClick={handleToggleMute}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <BellOff className="h-3.5 w-3.5 text-amber-400" />
                            <span>{activeThread.mutedBy?.includes(currentUser.uid) ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                          </button>
                          <button
                            onClick={handleToggleBlock}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <Ban className="h-3.5 w-3.5 text-rose-400" />
                            <span>{activeThread.blockedBy?.includes(currentUser.uid) ? 'Unblock User' : 'Block User'}</span>
                          </button>
                          <button
                            onClick={() => { setIsOptionsOpen(false); setShowReportModal(true); }}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <Flag className="h-3.5 w-3.5 text-rose-500" />
                            <span>Report User</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={onClose}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CONTEXT BANNER (Product / Order context) */}
              {activeThread.context && activeThread.context.type !== 'general' && (
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-850 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-bold text-white">Context:</span>
                    <span className="text-slate-300 truncate max-w-xs sm:max-w-md">
                      {activeThread.context.productTitle || activeThread.context.orderId}
                    </span>
                    {activeThread.context.productPrice && (
                      <span className="font-mono text-cyan-400 font-bold">{activeThread.context.productPrice} USD</span>
                    )}
                  </div>

                  {activeThread.context.orderId && onNavigateToOrder && (
                    <button
                      onClick={() => onNavigateToOrder(activeThread.context!.orderId!)}
                      className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Order</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* MESSAGES STREAM BODY */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.uid;
                    const isRead = msg.readBy?.includes(activePartner.uid);
                    const isShowOriginal = !!showOriginalMap[msg.id];
                    const translatedText = msg.text ? translateTextLocally(msg.text, currentLanguage) : null;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                          <span>{msg.senderName}</span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* MESSAGE BUBBLE */}
                        <div
                          className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl shadow-md text-xs space-y-2 ${
                            isMe 
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-slate-100 rounded-tr-none' 
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {/* Image Attachment */}
                          {msg.mediaType === 'image' && msg.mediaUrl && (
                            <div className="rounded-xl overflow-hidden border border-slate-800 max-h-56">
                              <img src={msg.mediaUrl} alt="Attached image" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {/* Document Attachment */}
                          {msg.mediaType === 'document' && msg.mediaUrl && (
                            <a
                              href={msg.mediaUrl}
                              download={msg.mediaName || 'Document'}
                              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-cyan-300 hover:underline cursor-pointer"
                            >
                              <FileText className="h-5 w-5 text-cyan-400 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs truncate">{msg.mediaName || 'Document file'}</p>
                                <span className="text-[9px] text-slate-500 font-mono">{msg.mediaSize || 'Attachment'}</span>
                              </div>
                            </a>
                          )}

                          {/* Voice Message */}
                          {msg.mediaType === 'voice' && msg.mediaUrl && (
                            <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                              <button
                                onClick={() => handlePlayVoice(msg.id, msg.mediaUrl!)}
                                className="h-8 w-8 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center font-bold cursor-pointer shrink-0"
                              >
                                {playingAudioId === msg.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-slate-950 ml-0.5" />}
                              </button>
                              <div className="flex-1 space-y-1">
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full bg-cyan-400 transition-all ${playingAudioId === msg.id ? 'w-full duration-3000' : 'w-0'}`} />
                                </div>
                                <span className="text-[9px] font-mono text-slate-400">Voice Note ({msg.voiceDuration || 0}s)</span>
                              </div>
                            </div>
                          )}

                          {/* Order Card Attachment */}
                          {msg.mediaType === 'order_card' && msg.orderCard && (
                            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-cyan-400 font-bold">ORDER #{msg.orderCard.orderId}</span>
                                <span className="text-emerald-400 uppercase font-bold">{msg.orderCard.status}</span>
                              </div>
                              <p className="font-bold text-xs text-white">{msg.orderCard.itemTitle}</p>
                              <p className="text-xs font-mono font-bold text-slate-300">Total: {msg.orderCard.total}</p>
                            </div>
                          )}

                          {/* Text Message with Auto Translation Toggle */}
                          {msg.text && (
                            <div className="space-y-1">
                              <p className="leading-relaxed font-normal whitespace-pre-wrap">
                                {isShowOriginal || currentLanguage === 'en' ? msg.text : translatedText}
                              </p>

                              {currentLanguage !== 'en' && msg.text && (
                                <button
                                  onClick={() => setShowOriginalMap(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                  className="text-[9px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                                >
                                  <Globe className="h-2.5 w-2.5" />
                                  <span>{isShowOriginal ? "Show Translated" : "Show Original"}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Read Receipts */}
                        {isMe && (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
                            {isRead ? (
                              <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                                <CheckCheck className="h-3 w-3" /> Read
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Check className="h-3 w-3" /> Sent
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Start Conversation</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Send a message, request product details, or share order updates directly with {activePartner.name}.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ATTACHMENT PREVIEW BAR */}
              {pendingAttachment && (
                <div className="px-4 py-2 bg-slate-900 border-t border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <Paperclip className="h-4 w-4" />
                    <span>Ready to send: {pendingAttachment.name}</span>
                  </div>
                  <button onClick={() => setPendingAttachment(null)} className="p-1 text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* RECORDING TIMER OVERLAY */}
              {isRecordingVoice && (
                <div className="px-4 py-2 bg-rose-950/80 border-t border-rose-500/30 flex items-center justify-between text-xs font-mono text-rose-300 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Recording Voice Note: {recordingSeconds}s</span>
                  </div>
                  <button onClick={stopVoiceRecording} className="px-3 py-1 bg-rose-500 text-white rounded-lg font-bold">
                    Done Recording
                  </button>
                </div>
              )}

              {/* INPUT FORM BAR */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/80 border-t border-slate-850 flex items-center gap-2">
                {/* File Attachment Pickers */}
                <label className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 cursor-pointer" title="Attach Image">
                  <ImageIcon className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                </label>

                <label className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 cursor-pointer" title="Attach Document">
                  <Paperclip className="h-4 w-4" />
                  <input type="file" accept=".pdf,.doc,.docx,.txt,.zip" onChange={(e) => handleFileUpload(e, 'document')} className="hidden" />
                </label>

                {/* Voice Note Recording Toggle */}
                <button
                  type="button"
                  onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isRecordingVoice 
                      ? 'bg-rose-500 text-white border-rose-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-400'
                  }`}
                  title="Record Voice Note"
                >
                  <Mic className="h-4 w-4" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  placeholder={`Write a message to ${activePartner.name}...`}
                  value={inputText}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() && !pendingAttachment}
                  className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-500">
              <div className="h-16 w-16 rounded-3xl bg-slate-900 border border-slate-850 text-cyan-400 flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-white text-base">Select a Direct Chat</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose an existing conversation from the list or contact a seller directly from any product or order page.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* SHARE ORDER MODAL */}
      <AnimatePresence>
        {showShareOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareOrderModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <OrderIcon className="h-5 w-5 text-cyan-400" />
                  Select Order to Share
                </h3>
                <button onClick={() => setShowShareOrderModal(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {userOrders.length > 0 ? (
                  userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => handleShareOrder(ord)}
                      className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/40 text-left transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold block">ORDER #{ord.id}</span>
                        <p className="font-bold text-xs text-white">{ord.items?.[0]?.title || 'Order Item'}</p>
                        <span className="text-[10px] text-slate-400">{ord.total || 0} USD • {ord.status || 'Paid'}</span>
                      </div>
                      <Send className="h-4 w-4 text-cyan-400" />
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    No recent orders found on account.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT USER MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-950 border border-rose-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                  Report User to Safety Moderation
                </h3>
                <button onClick={() => setShowReportModal(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Violation Category</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="Spam or Scam Attempt">Spam or Scam Attempt</option>
                    <option value="Off-Platform Payment Request">Off-Platform Payment Request</option>
                    <option value="Harassment or Abusive Behavior">Harassment or Abusive Behavior</option>
                    <option value="Counterfeit or Misleading Listing">Counterfeit or Misleading Listing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Details / Incident Description</label>
                  <textarea
                    placeholder="Provide additional details regarding this incident..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 resize-none h-24"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold">Cancel</button>
                  <button type="submit" disabled={isSubmittingReport} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600">
                    {isSubmittingReport ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
