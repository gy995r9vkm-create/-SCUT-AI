/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Paperclip, Image as ImageIcon, Smile, ArrowLeft, 
  Trash2, ShieldAlert, Phone, MapPin, Sparkles, User, Users, Calendar, 
  Plus, Search, Filter, HelpCircle, CheckCircle, AlertTriangle, Star, 
  Award, Eye, EyeOff, Lock, RefreshCw, Volume2, Pin, PinOff, Archive, 
  VolumeX, Shield, Ban, AlertCircle, Copy, Reply, Forward, Check, 
  CheckCheck, Radio, MoreVertical, X, Info, Download, Play, MessageCircle, Mic, ArrowUpRight
} from 'lucide-react';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User as UserType } from '../types';

interface ScutChatPageProps {
  user: UserType | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderTier?: string;
  content: string;
  timestamp: any;
  attachments?: {
    name: string;
    type: 'image' | 'file' | 'voice';
    url: string;
    size?: string;
  }[];
  reactions?: {
    emoji: string;
    users: string[]; // List of user IDs
  }[];
  replyTo?: {
    messageId: string;
    senderName: string;
    content: string;
  };
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Community' | 'Ecosystem' | 'Safe Spaces';
  unreadCount?: number;
}

interface DirectThread {
  id: string;
  participants: string[]; // List of UIDs
  participantDetails: {
    [uid: string]: {
      name: string;
      avatarUrl: string;
      isOnline: boolean;
      subscriptionTier?: string;
    }
  };
  lastMessage?: string;
  lastMessageAt?: any;
  isMuted?: boolean;
  isArchived?: boolean;
  isGroup?: boolean;
  groupName?: string;
}

export default function ScutChatPage({ user, onNavigate, onAddLog }: ScutChatPageProps) {
  // Current Navigation Tab
  const [activeTab, setActiveTab] = useState<'communities' | 'direct' | 'moderation'>('communities');
  
  // Channels List (Static definitions mapped to Firestore subcollections)
  const channels: Channel[] = [
    { id: 'general', name: 'General', description: 'Universal SCUT AI community chatter, general discussions & meetups.', icon: '🌐', category: 'Community' },
    { id: 'marketplace', name: 'Marketplace', description: 'Showcase beautiful products, buy & sell services, write secure listings & review traders.', icon: '🛍️', category: 'Community' },
    { id: 'business-hub', name: 'Business Hub', description: 'Venture capital pitching, entrepreneur directories & startup scaling tips.', icon: '💼', category: 'Community' },
    { id: 'ai-lounge', name: 'AI Lounge', description: 'Deep-dives into Google Gemini 3.5 Flash, prompting engineering & server-side sandboxing.', icon: '🤖', category: 'Ecosystem' },
    { id: 'scut-pay', name: 'SCUT Pay', description: 'Discuss SCUT Pay integrations, invoices, wallet handshakes & local community transactions.', icon: '💳', category: 'Ecosystem' },
    { id: 'crypto', name: 'Crypto', description: 'Discussions on ERC-20 utility contracts, decentralized ledgers, and tokenomics.', icon: '🪙', category: 'Ecosystem' },
    { id: 'developers', name: 'Developers', description: 'Syntactic debugging, REST/GraphQL API key integrations, SDK support & CJS bundling.', icon: '💻', category: 'Ecosystem' },
    { id: 'events', name: 'Events', description: 'Organize safety-focused physical meetups, local group interactions & community calendar activities.', icon: '📅', category: 'Community' },
    { id: 'announcements', name: 'Announcements', description: 'Official updates from SCUT core administrators regarding safety policies, updates & features.', icon: '📢', category: 'Ecosystem' },
    { id: 'women-girls', name: 'SCUT Women & Girls', description: 'Safe, private, role-based protected community circle dedicated to safety advocacy, beauty, fashion, friendship & wellness.', icon: '🌸', category: 'Safe Spaces' },
    { id: 'men-boys', name: 'SCUT Men & Boys', description: 'Safe, private, role-based protected community circle dedicated to safety advocacy, sports, technology, cars, fitness & gaming.', icon: '⚡', category: 'Safe Spaces' },
    { id: 'volunteers', name: 'Volunteers Circle', description: 'Organize high-impact safe physical zones, local assistance networks, and emergency escorts.', icon: '🤝', category: 'Safe Spaces' },
    { id: 'support-sla', name: 'Support SLA', description: 'Live administrative help desk tickets, crisis advocacy & privacy diagnostics.', icon: '🛠️', category: 'Safe Spaces' }
  ];

  const protectedChannelIds = ['women-girls', 'men-boys'];

  // Active state
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [activeDirectId, setActiveDirectId] = useState<string | null>(null);
  
  // Real-time Lists
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [directThreads, setDirectThreads] = useState<DirectThread[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<{ id: string; name: string; email?: string; avatarUrl: string; subscriptionTier?: string; isOnline?: boolean; isBanned?: boolean; isVerified?: boolean; removedFromSpaces?: string[]; isMuted?: boolean; mutedUntil?: string; infractionCount?: number; }[]>([]);
  const [moderationReports, setModerationReports] = useState<any[]>([]);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);

  // Input States
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [forwardTarget, setForwardTarget] = useState<ChatMessage | null>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Mobile Layout & Moderation states
  const [mobileActiveView, setMobileActiveView] = useState<'sidebar' | 'chat'>('sidebar');
  const [modSubTab, setModSubTab] = useState<'reports' | 'users'>('reports');
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  // Voice Recording Simulator
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // File Upload states
  const [attachment, setAttachment] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Private Group Chat creation states
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<string[]>([]);

  // Sub-community Interactive States
  const [loggedMood, setLoggedMood] = useState<string | null>(null);
  const [workoutStreak, setWorkoutStreak] = useState<number>(3);
  const [footballJoined, setFootballJoined] = useState<boolean>(false);
  const [footballCount, setFootballCount] = useState<number>(14);
  const [showWellnessModal, setShowWellnessModal] = useState<boolean>(false);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(() => !localStorage.getItem('scut_guidelines_accepted'));

  // Voice/Video call states
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [isCallVideo, setIsCallVideo] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callerDetails, setCallerDetails] = useState<{ name: string; avatarUrl: string }>({ name: 'SCUT Pioneer', avatarUrl: '' });

  // Unread badge map
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Scroll target
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Play a beautiful cybernetic notification sound beep via web synth
  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("AudioContext tone generation blocked by browser policy:", e);
    }
  };

  // User checking helper
  const isUserAdmin = !!(user && (
    user.isAdmin || 
    user.email?.toLowerCase() === 'echipa@romaniacurajoasa.info' ||
    user.email?.toLowerCase() === 'gabrielicloudi@icloud.com' || 
    user.email?.toLowerCase() === 'contact.gabrielpaduraru@gmail.com'
  ));

  // Listen to current user profile updates reactively
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setCurrentUserProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        setCurrentUserProfile(user);
      }
    }, (err) => {
      console.warn("User profile listener error:", err);
    });
    return () => unsub();
  }, [user]);

  // Load registered users directory
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Listen to registered users to populate direct messages directory
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const uList: any[] = [];
      snap.forEach(doc => {
        if (doc.id !== auth.currentUser?.uid) {
          uList.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });
      setRegisteredUsers(uList);
    }, (err) => {
      console.warn("Registered users listener error:", err);
    });

    return () => unsub();
  }, [user]);

  // Load Real-time messages for active space
  useEffect(() => {
    setMessages([]);
    let unsub: any = () => {};

    if (activeTab === 'communities') {
      const messagesRef = collection(db, 'community_channels', activeChannelId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(150));
      
      unsub = onSnapshot(q, (snap) => {
        const msgs: ChatMessage[] = [];
        snap.forEach(doc => {
          msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setMessages(msgs);
        scrollToBottom();
      }, (err) => {
        console.error("Firestore loading error:", err);
        // Fallback for offline or testing mode
        seedMockChannelMessages();
      });
    } else if (activeTab === 'direct' && activeDirectId) {
      const messagesRef = collection(db, 'direct_chats', activeDirectId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(150));
      
      unsub = onSnapshot(q, (snap) => {
        const msgs: ChatMessage[] = [];
        snap.forEach(doc => {
          msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setMessages(msgs);
        scrollToBottom();
      }, (err) => {
        console.error("Direct chat loading error:", err);
      });
    }

    return () => unsub();
  }, [activeChannelId, activeDirectId, activeTab]);

  // Load direct threads
  useEffect(() => {
    if (!auth.currentUser || activeTab !== 'direct') return;

    const directChatsRef = collection(db, 'direct_chats');
    const q = query(directChatsRef, where('participants', 'array-contains', auth.currentUser.uid));

    const unsub = onSnapshot(q, (snap) => {
      const threads: DirectThread[] = [];
      snap.forEach(doc => {
        threads.push({ id: doc.id, ...doc.data() } as DirectThread);
      });
      setDirectThreads(threads);
    }, (err) => {
      console.warn("Direct threads load error:", err);
    });

    return () => unsub();
  }, [activeTab, user]);

  // Request browser permission for HTML5 notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Clear unreads when space becomes active
  useEffect(() => {
    if (activeTab === 'communities' && activeChannelId) {
      setUnreadCounts(prev => ({ ...prev, [activeChannelId]: 0 }));
    } else if (activeTab === 'direct' && activeDirectId) {
      setUnreadCounts(prev => ({ ...prev, [activeDirectId]: 0 }));
    }
  }, [activeChannelId, activeDirectId, activeTab]);

  // Background listeners for unread counts in other channels
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubs = channels.map(chan => {
      const q = query(
        collection(db, 'community_channels', chan.id, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      let initialFire = true;
      
      return onSnapshot(q, (snap) => {
        // Avoid triggering on first local query initialization
        if (initialFire) {
          initialFire = false;
          return;
        }
        if (snap.empty) return;
        const latestDoc = snap.docs[0];
        const latestMsg = latestDoc.data();
        if (latestMsg.senderId === auth.currentUser?.uid) return;

        if (activeTab !== 'communities' || activeChannelId !== chan.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [chan.id]: (prev[chan.id] || 0) + 1
          }));
          playNotificationSound();
          if (Notification.permission === 'granted') {
            new Notification(`#${chan.name} - SCUT Chat`, {
              body: `${latestMsg.senderName}: ${latestMsg.content}`,
              icon: latestMsg.senderAvatar
            });
          }
          showNotification(`New message in #${chan.name} from ${latestMsg.senderName}`);
        }
      });
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [activeChannelId, activeTab]);

  // Background listeners for unread counts in direct threads
  useEffect(() => {
    if (!auth.currentUser || directThreads.length === 0) return;

    const unsubs = directThreads.map(thread => {
      const q = query(
        collection(db, 'direct_chats', thread.id, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      let initialFire = true;

      return onSnapshot(q, (snap) => {
        if (initialFire) {
          initialFire = false;
          return;
        }
        if (snap.empty) return;
        const latestMsg = snap.docs[0].data();
        if (latestMsg.senderId === auth.currentUser?.uid) return;

        if (activeTab !== 'direct' || activeDirectId !== thread.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [thread.id]: (prev[thread.id] || 0) + 1
          }));
          playNotificationSound();
          const senderName = latestMsg.senderName;
          const threadName = thread.isGroup ? thread.groupName : senderName;
          if (Notification.permission === 'granted') {
            new Notification(`${threadName} - SCUT Chat DM`, {
              body: `${senderName}: ${latestMsg.content}`,
              icon: latestMsg.senderAvatar
            });
          }
          showNotification(`New message from ${senderName} in ${threadName}`);
        }
      });
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [directThreads, activeDirectId, activeTab]);

  // Secure Voice/Video Call timer ticker
  useEffect(() => {
    let timer: any = null;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Trigger secure voice/video call session
  const triggerCall = (video: boolean) => {
    if (!auth.currentUser) {
      showNotification("Please login to initialize secure voice/video link.");
      return;
    }
    setIsCallVideo(video);
    setCallState('calling');
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);

    let name = 'SCUT Space Channel';
    let avatarUrl = '';

    if (activeTab === 'communities') {
      name = `Channel #${channels.find(c => c.id === activeChannelId)?.name || 'General'}`;
    } else if (activeTab === 'direct' && activeDirectId) {
      const activeThread = directThreads.find(t => t.id === activeDirectId);
      if (activeThread) {
        if (activeThread.isGroup) {
          name = activeThread.groupName || 'Group Chat';
        } else {
          const partnerId = activeThread.participants.find(uid => uid !== auth.currentUser?.uid) || '';
          const partner = activeThread.participantDetails[partnerId];
          name = partner?.name || 'SCUT Pioneer';
          avatarUrl = partner?.avatarUrl || '';
        }
      }
    }

    setCallerDetails({ name, avatarUrl });

    // Simulate connection completion
    setTimeout(() => {
      setCallState('connected');
      playNotificationSound();
    }, 3000);
  };

  // Create Private Group Chat session
  const handleCreateGroupChat = async () => {
    if (!auth.currentUser || !newGroupName.trim() || selectedGroupUsers.length === 0) return;

    const newThreadId = 'group-' + Math.random().toString(36).substring(2, 9);
    const participants = [auth.currentUser.uid, ...selectedGroupUsers];
    
    const details: any = {
      [auth.currentUser.uid]: {
        name: user?.name || auth.currentUser.email?.split('@')[0].toUpperCase() || 'USER',
        avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`,
        isOnline: true,
        subscriptionTier: user?.subscriptionTier || 'free'
      }
    };

    selectedGroupUsers.forEach(uid => {
      const u = registeredUsers.find(item => item.id === uid);
      details[uid] = {
        name: u?.name || 'SCUT Pioneer',
        avatarUrl: u?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
        isOnline: u?.isOnline || false,
        subscriptionTier: u?.subscriptionTier || 'free'
      };
    });

    const threadData = {
      id: newThreadId,
      participants,
      participantDetails: details,
      isGroup: true,
      groupName: newGroupName,
      createdBy: auth.currentUser.uid,
      lastMessage: `Group "${newGroupName}" established by ${user?.name || 'Admin'}`,
      lastMessageAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'direct_chats', newThreadId), threadData);
      setActiveDirectId(newThreadId);
      setActiveTab('direct');
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setSelectedGroupUsers([]);
      onAddLog('Group Chat Established', `Cryptographic multi-user session "${newGroupName}" created`, 'security');
    } catch (err) {
      console.error("Group thread creation error:", err);
      setDirectThreads([threadData as any, ...directThreads]);
      setActiveDirectId(newThreadId);
      setActiveTab('direct');
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setSelectedGroupUsers([]);
    }
  };

  // Load moderation queues if admin
  useEffect(() => {
    if (!isUserAdmin || activeTab !== 'moderation') return;

    const reportsUnsub = onSnapshot(collection(db, 'moderation_reports'), (snap) => {
      const r: any[] = [];
      snap.forEach(doc => {
        r.push({ id: doc.id, ...doc.data() });
      });
      setModerationReports(r);
    }, (err) => {
      console.warn("Moderation reports listener error:", err);
    });

    const logsUnsub = onSnapshot(collection(db, 'moderation_logs'), (snap) => {
      const l: any[] = [];
      snap.forEach(doc => {
        l.push({ id: doc.id, ...doc.data() });
      });
      setModerationLogs(l);
    }, (err) => {
      console.warn("Moderation logs listener error:", err);
    });

    return () => {
      reportsUnsub();
      logsUnsub();
    };
  }, [activeTab, isUserAdmin]);

  // Scroll helper
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const seedMockChannelMessages = () => {
    const mockMsgMap: { [key: string]: ChatMessage[] } = {
      'general': [
        { id: 'm-gen-1', senderId: 'user-lucy', senderName: 'Lucy Vance', senderAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=lucy', senderTier: 'pro', content: 'Hey everyone! SCUT Pay has changed how my e-commerce business settles transactions. Zero chargebacks is massive.', timestamp: { seconds: Date.now() / 1000 - 10000 }, reactions: [{ emoji: '👍', users: ['lucy', 'gabriel'] }] },
        { id: 'm-gen-2', senderId: 'user-admin', senderName: 'Gabriel', senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gabriel', senderTier: 'business', content: 'Welcome to the new SCUT Chat platform! Direct and community secure real-time message streams are now active. All actions are cryptographic and authenticated.', timestamp: { seconds: Date.now() / 1000 - 8000 } }
      ],
      'ai-lounge': [
        { id: 'm-ai-1', senderId: 'user-alice', senderName: 'Alice Dev', senderAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alice', senderTier: 'business', content: 'Has anyone integrated the new Gemini 2.5 Flash API yet? The structured JSON output format makes parsing incredibly quick.', timestamp: { seconds: Date.now() / 1000 - 5000 } }
      ],
      'women-girls': [
        { id: 'm-women-1', senderId: 'user-sophia', senderName: 'Sophia Miller', senderAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sophia', senderTier: 'free', content: 'So excited to see this dedicated flagged space for safe chats, health tracker & mentorship connections. SCUT is really pioneering absolute privacy!', timestamp: { seconds: Date.now() / 1000 - 2000 }, reactions: [{ emoji: '❤️', users: ['sophia', 'elena'] }] }
      ]
    };
    setMessages(mockMsgMap[activeChannelId] || [
      { id: 'm-seed', senderId: 'system', senderName: 'SCUT AI Sentinel', senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sentinel', senderTier: 'business', content: `Welcome to the **#${activeChannelId}** channel! Secure channels are initialized. Start the chat with other SCUT Pioneers.`, timestamp: { seconds: Date.now() / 1000 } }
    ]);
  };

  // Recording Simulation Timer
  useEffect(() => {
    if (isRecording) {
      recordingSecondsTimer();
    } else {
      clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  const recordingSecondsTimer = () => {
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(s => s + 1);
    }, 1000);
  };

  // Voice recording triggers
  const startRecording = async () => {
    setIsRecording(true);
    setRecordedAudioUrl(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate audio file URL
    const simulatedVoiceUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    setRecordedAudioUrl(simulatedVoiceUrl);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setRecordedAudioUrl(null);
  };

  // Handle local File & Image previews before upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    const reader = new FileReader();

    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: type,
        size: sizeStr,
        url: event.target?.result as string // local base64 preview
      });
    };

    if (type === 'image') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Send Message Logic
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth.currentUser) {
      showNotification("Please authenticate inside SCUT to transmit messages securely.");
      return;
    }

    if (!inputMessage.trim() && !attachment && !recordedAudioUrl) return;

    // Check if user is banned/suspended/muted
    const profile = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (profile.exists()) {
      const data = profile.data();
      if (data.isBanned) {
        showNotification("⚠️ Your account has been suspended by SCUT moderation for violating safety policies. Your access to transmit is revoked.");
        return;
      }
      if (data.isMuted) {
        const mutedUntil = data.mutedUntil ? new Date(data.mutedUntil) : null;
        if (mutedUntil && mutedUntil > new Date()) {
          const timeLeft = Math.ceil((mutedUntil.getTime() - Date.now()) / 60000);
          showNotification(`⚠️ Muted: Your account is temporarily muted for violating community rules. Mute ends in ${timeLeft} minutes.`);
          return;
        } else {
          // Mute expired, auto-unmute
          await updateDoc(doc(db, 'users', auth.currentUser.uid), { isMuted: false, mutedUntil: null });
        }
      }
    }

    // AI Safety Content Moderation Check
    if (inputMessage.trim()) {
      try {
        const modRes = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputMessage })
        });
        const modData = await modRes.json();
        
        if (modData.flagged) {
          showNotification(`⚠️ BLOCKED: Your message violates guidelines (${modData.category || 'abusive content'}). Blocking transmission.`);
          
          // Log automated block in logs
          await addDoc(collection(db, 'moderation_logs'), {
            action: 'AUTOMATIC_BLOCK_MESSAGE',
            targetUserId: auth.currentUser.uid,
            targetUserName: user?.name || 'SCUT Pioneer',
            adminName: 'SCUT Sentinel AI',
            timestamp: serverTimestamp(),
            details: `Blocked message: "${inputMessage.substring(0, 120)}". Reason: ${modData.reason || 'Safety filter triggered'}`
          });

          // Open a pending moderation report for review
          await addDoc(collection(db, 'moderation_reports'), {
            content: `Flagged content: "${inputMessage}"`,
            reportedUser: user?.name || 'SCUT Pioneer',
            reportedUserId: auth.currentUser.uid,
            reporter: 'SCUT Sentinel AI',
            reporterId: 'system-sentinel',
            status: 'pending',
            timestamp: serverTimestamp()
          });

          // Penalty escalation logic:
          const currentInfractions = profile.exists() ? (profile.data().infractionCount || 0) : 0;
          const nextInfractions = currentInfractions + 1;
          const updates: any = { infractionCount: nextInfractions };
          
          let penaltyDetails = `Infraction Count: ${nextInfractions}.`;
          
          if (nextInfractions >= 5) {
            updates.isBanned = true;
            penaltyDetails += " ESCALATION: Permanent hardware ban applied.";
            showNotification("⛔ ESCALATION: You have reached 5 infractions and your account has been permanently banned!");
          } else if (nextInfractions >= 3) {
            const muteTime = new Date();
            muteTime.setHours(muteTime.getHours() + 1);
            updates.isMuted = true;
            updates.mutedUntil = muteTime.toISOString();
            penaltyDetails += " ESCALATION: 1 hour temporary mute applied.";
            showNotification("🔇 ESCALATION: You have reached 3 infractions and your account is temporarily muted for 1 hour!");
          } else {
            penaltyDetails += " Warning issued.";
          }
          
          await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);

          // Save penalty log
          await addDoc(collection(db, 'moderation_logs'), {
            action: 'PENALTY_ESCALATION',
            targetUserId: auth.currentUser.uid,
            targetUserName: user?.name || 'SCUT Pioneer',
            adminName: 'SCUT Sentinel AI',
            timestamp: serverTimestamp(),
            details: penaltyDetails
          });

          return;
        }
      } catch (modErr) {
        console.error("Content safety API check failed:", modErr);
      }
    }

    let msgAttachments: any[] = [];
    if (attachment) {
      msgAttachments.push({
        name: attachment.name,
        type: attachment.type,
        url: attachment.url, // Base64 or uploaded URL
        size: attachment.size
      });
    } else if (recordedAudioUrl) {
      msgAttachments.push({
        name: `voice_memo_${Date.now()}.mp3`,
        type: 'voice',
        url: recordedAudioUrl,
        size: `${recordingSeconds}s`
      });
    }

    const payload: Partial<ChatMessage> = {
      senderId: auth.currentUser.uid,
      senderName: user?.name || auth.currentUser.email?.split('@')[0].toUpperCase() || 'USER',
      senderAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`,
      senderTier: user?.subscriptionTier || 'free',
      content: inputMessage,
      timestamp: serverTimestamp(),
      reactions: [],
    };

    if (msgAttachments.length > 0) {
      payload.attachments = msgAttachments;
    }

    if (replyTarget) {
      payload.replyTo = {
        messageId: replyTarget.id,
        senderName: replyTarget.senderName,
        content: replyTarget.content.substring(0, 80) + (replyTarget.content.length > 80 ? '...' : '')
      };
    }

    try {
      if (activeTab === 'communities') {
        const messagesRef = collection(db, 'community_channels', activeChannelId, 'messages');
        await addDoc(messagesRef, payload);
        onAddLog('Community Message Transmitted', `Transmitted secure package inside #${activeChannelId} channel.`, 'chat');
      } else if (activeTab === 'direct' && activeDirectId) {
        const messagesRef = collection(db, 'direct_chats', activeDirectId, 'messages');
        await addDoc(messagesRef, payload);
        
        // Update thread overview
        const threadRef = doc(db, 'direct_chats', activeDirectId);
        await updateDoc(threadRef, {
          lastMessage: inputMessage || `${payload.senderName} sent an attachment.`,
          lastMessageAt: serverTimestamp()
        });
      }

      // Reset Inputs
      setInputMessage('');
      setAttachment(null);
      setRecordedAudioUrl(null);
      setReplyTarget(null);
      scrollToBottom();
    } catch (err: any) {
      console.error("Message send failed:", err);
      // Local addition for instant simulation feedback
      const localMsg: ChatMessage = {
        id: 'msg-local-' + Math.random().toString(36).substring(2, 9),
        senderId: auth.currentUser.uid,
        senderName: payload.senderName || 'USER',
        senderAvatar: payload.senderAvatar || '',
        senderTier: payload.senderTier || 'free',
        content: payload.content || '',
        timestamp: { seconds: Date.now() / 1000 },
        attachments: payload.attachments,
        reactions: [],
        replyTo: payload.replyTo
      };
      setMessages(prev => [...prev, localMsg]);
      setInputMessage('');
      setAttachment(null);
      setRecordedAudioUrl(null);
      setReplyTarget(null);
      scrollToBottom();
    }
  };

  // Start 1:1 Direct Chat with selected user
  const handleStartDirectChat = async (targetUser: any) => {
    if (!auth.currentUser) return;

    setMobileActiveView('chat');

    // Check if thread already exists
    const existing = directThreads.find(t => 
      t.participants.includes(targetUser.id) && t.participants.includes(auth.currentUser!.uid)
    );

    if (existing) {
      setActiveDirectId(existing.id);
      setActiveTab('direct');
      return;
    }

    // Create new direct chat thread
    const newThreadId = 'direct-' + Math.random().toString(36).substring(2, 9);
    const participants = [auth.currentUser.uid, targetUser.id];
    
    const threadData: DirectThread = {
      id: newThreadId,
      participants,
      participantDetails: {
        [auth.currentUser.uid]: {
          name: user?.name || auth.currentUser.email?.split('@')[0].toUpperCase() || 'USER',
          avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`,
          isOnline: true,
          subscriptionTier: user?.subscriptionTier || 'free'
        },
        [targetUser.id]: {
          name: targetUser.name || 'SCUT Pioneer',
          avatarUrl: targetUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser.id}`,
          isOnline: true,
          subscriptionTier: targetUser.subscriptionTier || 'free'
        }
      },
      lastMessage: 'Direct Chat Session Initialized',
      lastMessageAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'direct_chats', newThreadId), threadData);
      setActiveDirectId(newThreadId);
      setActiveTab('direct');
      onAddLog('Direct Chat Established', `Cryptographic 1:1 tunnel connected with ${targetUser.name}`, 'security');
    } catch (err) {
      console.error("Direct thread creation error:", err);
      // Fallback
      setDirectThreads([threadData, ...directThreads]);
      setActiveDirectId(newThreadId);
      setActiveTab('direct');
    }
  };

  // Edit Message
  const handleEditMessage = async (msgId: string) => {
    if (!auth.currentUser) return;
    try {
      if (activeTab === 'communities') {
        const docRef = doc(db, 'community_channels', activeChannelId, 'messages', msgId);
        await updateDoc(docRef, { content: editContent, isEdited: true });
      } else if (activeTab === 'direct' && activeDirectId) {
        const docRef = doc(db, 'direct_chats', activeDirectId, 'messages', msgId);
        await updateDoc(docRef, { content: editContent, isEdited: true });
      }
      setEditingMessageId(null);
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editContent, isEdited: true } : m));
      setEditingMessageId(null);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (msgId: string) => {
    if (!auth.currentUser) return;
    try {
      if (activeTab === 'communities') {
        const docRef = doc(db, 'community_channels', activeChannelId, 'messages', msgId);
        await updateDoc(docRef, { isDeleted: true, content: '*(This message was deleted by author)*' });
      } else if (activeTab === 'direct' && activeDirectId) {
        const docRef = doc(db, 'direct_chats', activeDirectId, 'messages', msgId);
        await updateDoc(docRef, { isDeleted: true, content: '*(This message was deleted by author)*' });
      }
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeleted: true, content: '*(This message was deleted by author)*' } : m));
    }
  };

  // Toggle Pin message
  const handleTogglePinMessage = async (msg: ChatMessage) => {
    if (!auth.currentUser) return;
    try {
      const isCurrentlyPinned = !!msg.isPinned;
      if (activeTab === 'communities') {
        const docRef = doc(db, 'community_channels', activeChannelId, 'messages', msg.id);
        await updateDoc(docRef, { isPinned: !isCurrentlyPinned });
      } else if (activeTab === 'direct' && activeDirectId) {
        const docRef = doc(db, 'direct_chats', activeDirectId, 'messages', msg.id);
        await updateDoc(docRef, { isPinned: !isCurrentlyPinned });
      }
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isPinned: !msg.isPinned } : m));
    }
  };

  // Forward message trigger
  const handleForwardMessage = async (targetChannelId: string) => {
    if (!forwardTarget || !auth.currentUser) return;

    const payload: Partial<ChatMessage> = {
      senderId: auth.currentUser.uid,
      senderName: user?.name || 'USER',
      senderAvatar: user?.avatarUrl || '',
      senderTier: user?.subscriptionTier || 'free',
      content: `[Forwarded from ${forwardTarget.senderName}]: ${forwardTarget.content}`,
      timestamp: serverTimestamp(),
      reactions: [],
      attachments: forwardTarget.attachments
    };

    try {
      const messagesRef = collection(db, 'community_channels', targetChannelId, 'messages');
      await addDoc(messagesRef, payload);
      setShowForwardModal(false);
      setForwardTarget(null);
      setActiveChannelId(targetChannelId);
      setActiveTab('communities');
      onAddLog('Message Forwarded', `Forwarded message safely to #${targetChannelId}`, 'chat');
    } catch (e) {
      console.error(e);
      setShowForwardModal(false);
    }
  };

  // Add Emoji Reaction
  const handleAddReaction = async (msgId: string, emoji: string) => {
    if (!auth.currentUser) return;

    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;

    const targetMsg = messages[msgIndex];
    let updatedReactions = [...(targetMsg.reactions || [])];
    const reactIndex = updatedReactions.findIndex(r => r.emoji === emoji);

    if (reactIndex === -1) {
      updatedReactions.push({ emoji, users: [auth.currentUser.uid] });
    } else {
      const userList = updatedReactions[reactIndex].users;
      if (userList.includes(auth.currentUser.uid)) {
        updatedReactions[reactIndex].users = userList.filter(uid => uid !== auth.currentUser?.uid);
      } else {
        updatedReactions[reactIndex].users.push(auth.currentUser.uid);
      }
    }

    // Clean empty reactions
    updatedReactions = updatedReactions.filter(r => r.users.length > 0);

    try {
      if (activeTab === 'communities') {
        const docRef = doc(db, 'community_channels', activeChannelId, 'messages', msgId);
        await updateDoc(docRef, { reactions: updatedReactions });
      } else if (activeTab === 'direct' && activeDirectId) {
        const docRef = doc(db, 'direct_chats', activeDirectId, 'messages', msgId);
        await updateDoc(docRef, { reactions: updatedReactions });
      }
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: updatedReactions } : m));
    }
  };

  // Report message to Moderation queue
  const handleReportMessage = async (msg: ChatMessage) => {
    if (!auth.currentUser) return;
    try {
      const reportRef = collection(db, 'moderation_reports');
      await addDoc(reportRef, {
        reportedMessageId: msg.id,
        reportedUser: msg.senderName,
        reportedUserId: msg.senderId,
        reporter: user?.name || 'SCUT Anonymous Sentinel',
        reporterId: auth.currentUser.uid,
        content: msg.content,
        timestamp: serverTimestamp(),
        channelId: activeTab === 'communities' ? activeChannelId : 'direct_chat',
        status: 'pending'
      });
      showNotification("🔒 Message reported securely. SCUT admin team will inspect this packet and enforce spatial protection guidelines.");
      onAddLog('Moderation Report Filed', `Reported content from ${msg.senderName} for review.`, 'security');
    } catch (e) {
      console.warn("Report storage failed, logging locally:", e);
    }
  };

  // Report attachment (image or file) to Moderation queue
  const handleReportAttachment = async (msg: ChatMessage, attName: string, attUrl: string) => {
    if (!auth.currentUser) return;
    try {
      const reportRef = collection(db, 'moderation_reports');
      await addDoc(reportRef, {
        reportedMessageId: msg.id,
        reportedUser: msg.senderName,
        reportedUserId: msg.senderId,
        reporter: user?.name || 'SCUT Anonymous Sentinel',
        reporterId: auth.currentUser.uid,
        content: `Reported attachment: "${attName}" (URL: ${attUrl}) from message.`,
        timestamp: serverTimestamp(),
        channelId: activeTab === 'communities' ? activeChannelId : 'direct_chat',
        status: 'pending'
      });
      showNotification("🔒 Attachment reported securely. SCUT admin team will inspect this file.");
      onAddLog('Moderation Attachment Report Filed', `Reported attachment from ${msg.senderName} for review.`, 'security');
    } catch (e) {
      console.warn("Attachment report failed:", e);
    }
  };

  // Moderation Action: Suspend User (Enforce ban field in profile)
  const handleSuspendUser = async (targetUserId: string, targetUserName: string) => {
    if (!isUserAdmin) return;
    try {
      await updateDoc(doc(db, 'users', targetUserId), { isBanned: true });
      
      // Save moderation log
      await addDoc(collection(db, 'moderation_logs'), {
        action: 'USER_BAN',
        targetUserId,
        targetUserName,
        adminName: user?.name || 'SCUT Chief Admin',
        timestamp: serverTimestamp(),
        details: 'Violated spatial safety protocol'
      });

      showNotification(`Successfully suspended ${targetUserName}'s transmitting proxy.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Moderation Action: Toggle User Mute (1 Hour Temporary Mute)
  const handleToggleMuteUser = async (targetUser: any) => {
    if (!isUserAdmin) return;
    const currentlyMuted = !!targetUser.isMuted;
    const nextMuted = !currentlyMuted;
    try {
      const updates: any = { isMuted: nextMuted };
      if (nextMuted) {
        const muteTime = new Date();
        muteTime.setHours(muteTime.getHours() + 1);
        updates.mutedUntil = muteTime.toISOString();
      } else {
        updates.mutedUntil = null;
      }
      
      await updateDoc(doc(db, 'users', targetUser.id), updates);
      
      await addDoc(collection(db, 'moderation_logs'), {
        action: nextMuted ? 'USER_MUTE' : 'USER_UNMUTE',
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        adminName: user?.name || 'SCUT Chief Admin',
        timestamp: serverTimestamp(),
        details: nextMuted ? 'Temporarily muted for 1 hour by admin action' : 'Temporary mute revoked'
      });
      
      showNotification(`${targetUser.name} has been ${nextMuted ? 'temporarily muted for 1 hour' : 'unmuted'}.`);
    } catch (e) {
      console.error("Failed to toggle mute state:", e);
    }
  };

  // Moderation Action: Toggle User Ban (Permanently Ban / Unban)
  const handleToggleUserBan = async (targetUser: any) => {
    if (!isUserAdmin) return;
    const nextBanned = !targetUser.isBanned;
    try {
      await updateDoc(doc(db, 'users', targetUser.id), { isBanned: nextBanned });
      await addDoc(collection(db, 'moderation_logs'), {
        action: nextBanned ? 'USER_BAN' : 'USER_UNBAN',
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        adminName: user?.name || 'SCUT Chief Admin',
        timestamp: serverTimestamp(),
        details: nextBanned ? 'Violated community rules or provided false information' : 'Restored access by admin request'
      });
      showNotification(`${targetUser.name} has been ${nextBanned ? 'permanently banned' : 'unbanned'}.`);
    } catch (e) {
      console.error("Failed to toggle ban state:", e);
    }
  };

  // Moderation Action: Toggle User Verification Status
  const handleToggleUserVerification = async (targetUser: any) => {
    if (!isUserAdmin) return;
    const nextVerified = !targetUser.isVerified;
    try {
      await updateDoc(doc(db, 'users', targetUser.id), { isVerified: nextVerified });
      await addDoc(collection(db, 'moderation_logs'), {
        action: nextVerified ? 'USER_VERIFY' : 'USER_UNVERIFY',
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        adminName: user?.name || 'SCUT Chief Admin',
        timestamp: serverTimestamp(),
        details: nextVerified ? 'Identity verified by administrative audit' : 'Verification badge revoked'
      });
      showNotification(`${targetUser.name}'s verification status updated.`);
    } catch (e) {
      console.error("Failed to toggle verification state:", e);
    }
  };

  // Moderation Action: Remove user from a protected space
  const handleToggleSpaceAccess = async (targetUser: any, spaceId: string) => {
    if (!isUserAdmin) return;
    const currentlyRemoved = targetUser.removedFromSpaces?.includes(spaceId) || false;
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        removedFromSpaces: currentlyRemoved 
          ? arrayRemove(spaceId)
          : arrayUnion(spaceId)
      });
      await addDoc(collection(db, 'moderation_logs'), {
        action: currentlyRemoved ? 'RESTORE_SPACE' : 'REMOVE_SPACE',
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        adminName: user?.name || 'SCUT Chief Admin',
        timestamp: serverTimestamp(),
        details: `${currentlyRemoved ? 'Restored access' : 'Removed'} from protected space: ${spaceId}`
      });
      showNotification(`${targetUser.name} has been ${currentlyRemoved ? 'restored to' : 'removed from'} ${spaceId === 'women-girls' ? 'SCUT Women & Girls' : 'SCUT Men & Boys'}.`);
    } catch (e) {
      console.error("Failed to toggle space access:", e);
    }
  };

  // Report Suspicious User Account
  const handleReportUser = async (targetUser: any) => {
    if (!auth.currentUser) return;
    try {
      const reportRef = collection(db, 'moderation_reports');
      await addDoc(reportRef, {
        reportedUser: targetUser.name,
        reportedUserId: targetUser.id,
        reporter: user?.name || 'SCUT Anonymous Sentinel',
        reporterId: auth.currentUser.uid,
        content: 'Suspicious account activity reported by community peer.',
        timestamp: serverTimestamp()
      });
      showNotification(`🔒 Secure report filed for suspicious account: ${targetUser.name}`);
      onAddLog('User Account Reported', `Suspicious account report filed for ${targetUser.name}`, 'security');
    } catch (e) {
      console.warn("Report storage failed:", e);
    }
  };

  // Moderation Action: Clear Report
  const handleClearReport = async (reportId: string) => {
    if (!isUserAdmin) return;
    try {
      await deleteDoc(doc(db, 'moderation_reports', reportId));
    } catch (e) {
      setModerationReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  // Filter lists based on queries
  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = registeredUsers.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  // Separate pinned messages
  const pinnedMessages = messages.filter(m => m.isPinned);

  // Check if active channel is role-based protected
  const isChannelProtected = protectedChannelIds.includes(activeChannelId);
  const isUserVerified = currentUserProfile?.isVerified || user?.isVerified || false;
  const isUserRemovedFromActiveSpace = currentUserProfile?.removedFromSpaces?.includes(activeChannelId) || false;
  const showAccessBarrier = activeTab === 'communities' && isChannelProtected && (!isUserVerified || isUserRemovedFromActiveSpace);

  return (
    <div className="h-full w-full bg-slate-950 flex border-t border-slate-900 overflow-hidden text-slate-100">
      
      {/* SIDEBAR: Spaces Navigation & DM Directories */}
      <div className={`${mobileActiveView === 'chat' ? 'hidden md:flex' : 'flex w-full md:w-80'} border-r border-slate-900 bg-slate-900/60 flex flex-col shrink-0`}>
        
        {/* Navigation Selector Tabs */}
        <div className="p-3 border-b border-slate-900 flex gap-1 bg-slate-950/40">
          <button 
            onClick={() => setActiveTab('communities')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'communities' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Spaces</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'direct' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Direct</span>
          </button>

          {isUserAdmin && (
            <button 
              onClick={() => setActiveTab('moderation')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'moderation' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Mod</span>
            </button>
          )}
        </div>

        {/* Dynamic Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* SEARCH BAR */}
          {activeTab !== 'moderation' && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder={activeTab === 'communities' ? "Search channels..." : "Search directories..."}
                value={activeTab === 'communities' ? searchQuery : userSearchQuery}
                onChange={e => activeTab === 'communities' ? setSearchQuery(e.target.value) : setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          )}

          {/* SPACE LISTS */}
          {activeTab === 'communities' && (
            <div className="space-y-4">
              {['Community', 'Ecosystem', 'Safe Spaces'].map(category => {
                const spaceItems = filteredChannels.filter(c => c.category === category);
                if (spaceItems.length === 0) return null;

                return (
                  <div key={category} className="space-y-1.5">
                    <span className="px-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">{category}</span>
                    <div className="space-y-1">
                      {spaceItems.map(chan => {
                        const active = activeChannelId === chan.id;
                        return (
                          <button
                            key={chan.id}
                            onClick={() => { setActiveChannelId(chan.id); setMobileActiveView('chat'); }}
                            className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 border transition-all ${active ? 'bg-cyan-500/10 border-cyan-500/25 text-white font-semibold' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850/30'}`}
                          >
                            <span className="text-sm shrink-0">{chan.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs truncate block">#{chan.name}</span>
                                {unreadCounts[chan.id] > 0 && (
                                  <span className="h-4.5 min-w-4.5 px-1 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                    {unreadCounts[chan.id]}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 truncate block font-light leading-none mt-0.5">{chan.description}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DIRECT MESSAGES SECTION */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              
              {/* Active Threads */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">ACTIVE HANDSHAKES</span>
                  <button 
                    onClick={() => setShowCreateGroupModal(true)}
                    className="p-1 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    title="Create Private Group Chat"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Group</span>
                  </button>
                </div>
                {directThreads.length > 0 ? (
                  <div className="space-y-1">
                    {directThreads.map(thread => {
                      const active = activeDirectId === thread.id;
                      const isGroup = !!thread.isGroup;
                      
                      let title = 'SCUT Pioneer';
                      let avatarElement = null;
                      
                      if (isGroup) {
                        title = thread.groupName || 'Group Chat';
                        const initials = title.substring(0, 2).toUpperCase();
                        avatarElement = (
                          <div className="h-8 w-8 rounded-full border border-teal-500/30 bg-gradient-to-br from-slate-900 to-cyan-950 flex items-center justify-center text-[10px] font-bold text-cyan-400 font-mono">
                            {initials}
                          </div>
                        );
                      } else {
                        const partnerId = thread.participants.find(uid => uid !== auth.currentUser?.uid) || '';
                        const partner = thread.participantDetails[partnerId] || { name: 'SCUT Pioneer', avatarUrl: '', isOnline: false };
                        title = partner.name;
                        avatarElement = (
                          <div className="relative shrink-0">
                            <img src={partner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${partnerId}`} alt="" className="h-8 w-8 rounded-full border border-slate-800 bg-slate-900" />
                            <div className={`h-2.5 w-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-slate-900 ${partner.isOnline ? 'bg-green-500' : 'bg-slate-600'}`} />
                          </div>
                        );
                      }

                      return (
                        <button
                          key={thread.id}
                          onClick={() => { setActiveDirectId(thread.id); setMobileActiveView('chat'); }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 border transition-all ${active ? 'bg-cyan-500/10 border-cyan-500/25 text-white font-semibold' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850/30'}`}
                        >
                          <div className="shrink-0">
                            {avatarElement}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs truncate block font-medium">{title}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isGroup ? (
                                  <span className="text-[8px] font-mono font-black text-teal-400 bg-teal-500/10 px-1 rounded uppercase">GROUP</span>
                                ) : (
                                  thread.participantDetails[thread.participants.find(uid => uid !== auth.currentUser?.uid) || '']?.subscriptionTier !== 'free' && (
                                    <span className="text-[8px] font-mono font-black text-cyan-400 uppercase bg-cyan-500/10 px-1 rounded">PRO</span>
                                  )
                                )}
                                {unreadCounts[thread.id] > 0 && (
                                  <span className="h-4.5 min-w-4.5 px-1 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                    {unreadCounts[thread.id]}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 truncate block leading-none mt-1">{thread.lastMessage || 'Connected'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-600 p-2 block italic">No direct chats established. select a contact below to connect.</span>
                )}
              </div>

              {/* Users Directory */}
              <div className="space-y-1.5 pt-2 border-t border-slate-850/60">
                <span className="px-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">USERS DIRECTORY</span>
                <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                  {filteredUsers.map(userItem => (
                    <div
                      key={userItem.id}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-850/30 flex items-center justify-between gap-2.5 transition-all group cursor-pointer"
                      onClick={() => { handleStartDirectChat(userItem); setMobileActiveView('chat'); }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img src={userItem.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${userItem.id}`} alt="" className="h-7 w-7 rounded-full border border-slate-800 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs truncate block text-slate-300 font-medium">{userItem.name}</span>
                          <span className="text-[9px] text-slate-500 truncate block font-light mt-0.5">{userItem.isOnline ? 'online now' : 'offline'}</span>
                        </div>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleReportUser(userItem);
                        }}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer shrink-0"
                        title="Report Suspicious Account"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <span className="text-[10px] text-slate-600 p-2 block italic">No other users found</span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ADMIN MODERATION PANEL */}
          {activeTab === 'moderation' && isUserAdmin && (
            <div className="space-y-4">
              {/* Mod Sub-tabs selector */}
              <div className="flex gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-900">
                <button
                  onClick={() => setModSubTab('reports')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${modSubTab === 'reports' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Reports ({moderationReports.length})
                </button>
                <button
                  onClick={() => setModSubTab('users')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${modSubTab === 'users' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Manage Users ({registeredUsers.length})
                </button>
              </div>

              {modSubTab === 'reports' ? (
                <div className="space-y-2">
                  <span className="px-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">REPORT QUEUE</span>
                  <div className="space-y-2">
                    {moderationReports.map(report => (
                      <div key={report.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-900/80 space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-red-400 block">Reported: {report.reportedUser}</span>
                            <span className="text-[9px] text-slate-500">By: {report.reporter}</span>
                          </div>
                          <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold">Pending</span>
                        </div>
                        <blockquote className="text-[11px] text-slate-300 italic border-l-2 border-slate-700 pl-2 leading-relaxed">
                          "{report.content}"
                        </blockquote>
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => handleSuspendUser(report.reportedUserId, report.reportedUser)}
                            className="flex-1 py-1 bg-red-500 text-slate-950 font-bold text-[10px] rounded hover:bg-red-400 transition-colors uppercase tracking-wider"
                          >
                            Suspend User
                          </button>
                          <button
                            onClick={() => handleClearReport(report.id)}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 text-[10px] rounded transition-colors"
                            title="Dismiss Report"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                    {moderationReports.length === 0 && (
                      <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                        No active reports in queue. Protection shield standing strong.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="px-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">REGISTERED ACCOUNTS & ACCESS</span>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
                    {registeredUsers.map(u => {
                      const isBanned = !!u.isBanned;
                      const isVerified = !!u.isVerified;
                      const removedFromWomen = u.removedFromSpaces?.includes('women-girls') || false;
                      const removedFromMen = u.removedFromSpaces?.includes('men-boys') || false;

                      return (
                        <div key={u.id} className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2.5">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`} alt="" className="h-7 w-7 rounded-full border border-slate-800" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white truncate block">{u.name}</span>
                                {isVerified && (
                                  <span className="h-3.5 w-3.5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center" title="Verified Pioneer">
                                    <Check className="h-2.5 w-2.5" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-500 block truncate">{u.email}</span>
                            </div>
                          </div>

                          {/* Controls Grid */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-900/60">
                            {/* Verification Toggle */}
                            <button
                              onClick={() => handleToggleUserVerification(u)}
                              className={`py-1 px-1.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${isVerified ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-850'}`}
                            >
                              {isVerified ? '✓ Verified' : 'Unverified'}
                            </button>

                            {/* Permanent Ban Toggle */}
                            <button
                              onClick={() => handleToggleUserBan(u)}
                              className={`py-1 px-1.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${isBanned ? 'bg-red-500 text-slate-950 hover:bg-red-400' : 'bg-slate-900 text-red-400 border border-slate-850 hover:bg-slate-850/40'}`}
                            >
                              {isBanned ? '⛔ Banned' : 'Ban Account'}
                            </button>

                            {/* Space access - Women & Girls */}
                            <button
                              onClick={() => handleToggleSpaceAccess(u, 'women-girls')}
                              className={`py-1 px-1.5 rounded text-[9px] font-semibold transition-colors cursor-pointer ${removedFromWomen ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25' : 'bg-slate-900 text-pink-400/80 border border-slate-850'}`}
                            >
                              {removedFromWomen ? 'Removed Women' : 'Allow Women'}
                            </button>

                            {/* Space access - Men & Boys */}
                            <button
                              onClick={() => handleToggleSpaceAccess(u, 'men-boys')}
                              className={`py-1 px-1.5 rounded text-[9px] font-semibold transition-colors cursor-pointer ${removedFromMen ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25' : 'bg-slate-900 text-blue-400/80 border border-slate-850'}`}
                            >
                              {removedFromMen ? 'Removed Men' : 'Allow Men'}
                            </button>

                            {/* Temporary Mute Toggle */}
                            <button
                              onClick={() => handleToggleMuteUser(u)}
                              className={`py-1 px-1.5 rounded text-[9px] font-bold transition-colors cursor-pointer col-span-2 ${u.isMuted ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-900 text-amber-400 border border-slate-850 hover:bg-slate-850/40'}`}
                            >
                              {u.isMuted ? '🔇 Muted (Click to Unmute)' : '🔇 Temporary Mute (1 Hr)'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* LOGGED IN USER PROFILE FOOTER */}
        {user && (
          <div className="p-3 border-t border-slate-900 bg-slate-950/40 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <img src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} alt="" className="h-8 w-8 rounded-full border border-slate-800 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs text-white font-bold block truncate">{user.name}</span>
                <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  <span>ONLINE ({user.subscriptionTier || 'free'})</span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate('settings')} 
              className="p-1.5 rounded-lg border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Private Settings"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* CHAT INTERACTIVE VIEW */}
      <div 
        className={`${mobileActiveView === 'sidebar' ? 'hidden md:flex' : 'flex-1 flex'} flex-col bg-slate-950 relative min-w-0`}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          const file = e.dataTransfer.files?.[0];
          if (!file) return;
          const type = file.type.startsWith('image/') ? 'image' : 'file';
          const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
          const reader = new FileReader();
          reader.onload = (event) => {
            setAttachment({
              name: file.name,
              type: type,
              size: sizeStr,
              url: event.target?.result as string
            });
            showNotification(`Secured attachment loaded: ${file.name}`);
          };
          if (type === 'image') {
            reader.readAsDataURL(file);
          } else {
            reader.readAsText(file);
          }
        }}
      >
        
        {/* DRAG AND DROP SECURE FILE UPLOAD OVERLAY */}
        <AnimatePresence>
          {isDraggingOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-500/40 m-4 rounded-3xl"
            >
              <div className="text-center space-y-3 pointer-events-none">
                <div className="h-16 w-16 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 mx-auto animate-bounce border border-cyan-500/20">
                  <Download className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-bold text-white">Secure Encrypted File Transfer</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Drop files or images here to load secure cryptographic packages for transmission.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* CHAT STREAM HEADER */}
        <div className="px-4 py-3 border-b border-slate-900 bg-slate-950 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile back button */}
            <button
              onClick={() => setMobileActiveView('sidebar')}
              className="md:hidden p-1.5 mr-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Back to channel list"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-xl shrink-0">
              {activeTab === 'communities' ? '💬' : '🔒'}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>
                  {activeTab === 'communities' 
                    ? `#${channels.find(c => c.id === activeChannelId)?.name}` 
                    : (directThreads.find(t => t.id === activeDirectId)?.isGroup 
                       ? directThreads.find(t => t.id === activeDirectId)?.groupName 
                       : 'Private Handshake Session')}
                </span>
                {activeTab === 'direct' && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 rounded uppercase">
                    {directThreads.find(t => t.id === activeDirectId)?.isGroup ? 'Secure Group' : 'Encrypted'}
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-500 truncate leading-none mt-1">
                {activeTab === 'communities' 
                  ? channels.find(c => c.id === activeChannelId)?.description 
                  : (directThreads.find(t => t.id === activeDirectId)?.isGroup 
                     ? `Private group chat with ${directThreads.find(t => t.id === activeDirectId)?.participants.length} participants` 
                     : 'Establishing end-to-end zero knowledge connection...')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice/Video Call buttons */}
            {activeTab !== 'moderation' && (
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-850">
                <button
                  onClick={() => triggerCall(false)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                  title="Initialize Secure P2P Voice Link"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => triggerCall(true)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                  title="Initialize Secure P2P Video Link"
                >
                  <Radio className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* View pins control */}
            {pinnedMessages.length > 0 && (
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/15 px-2 py-1 rounded-lg flex items-center gap-1">
                <Pin className="h-3 w-3 fill-amber-400" />
                <span>{pinnedMessages.length} Pinned</span>
              </span>
            )}
          </div>
        </div>

        {/* PINNED MESSAGES SUBHEADER OVERLAY */}
        {pinnedMessages.length > 0 && (
          <div className="bg-amber-500/[0.02] border-b border-amber-500/10 px-4 py-2 text-xs text-amber-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <Pin className="h-3.5 w-3.5 text-amber-400 shrink-0 fill-amber-400" />
              <span className="font-semibold shrink-0">PINNED PROMPT:</span>
              <span className="truncate italic">"{pinnedMessages[pinnedMessages.length - 1].content}"</span>
            </div>
            <span className="text-[10px] text-slate-500 whitespace-nowrap">by {pinnedMessages[pinnedMessages.length - 1].senderName}</span>
          </div>
        )}

        {showAccessBarrier ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
            <div className="max-w-md w-full bg-slate-900/60 border border-slate-900 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/[0.02] rounded-bl-full pointer-events-none" />
              
              <div className="mx-auto h-16 w-16 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <Shield className="h-8 w-8 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                  <span>{channels.find(c => c.id === activeChannelId)?.name || 'Protected Space'}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isUserRemovedFromActiveSpace ? (
                    <span className="text-red-400 font-semibold block bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                      ⚠️ You have been removed from this protected space by a SCUT moderator. If this is an error, please appeal to the admin team.
                    </span>
                  ) : (
                    <span>
                      This is a **Role-Based Protected Community**. Access requires verification to guarantee physical and digital safety, eliminate harassment, and verify community members.
                    </span>
                  )}
                </p>
              </div>

              {!isUserRemovedFromActiveSpace && (
                <div className="pt-2 space-y-3">
                  <p className="text-[10px] text-slate-500">
                    Your account is currently **unverified**. Pressing the button below will perform an encrypted verification check and grant immediate access.
                  </p>
                  <button
                    onClick={async () => {
                      if (!auth.currentUser) return;
                      try {
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), { isVerified: true });
                        showNotification("🎉 Cryptographic Verification Successful! Pioneer Badge issued.");
                        onAddLog('User Verified', 'Identity verified securely in protected space gateway', 'security');
                      } catch (err) {
                        console.error(err);
                        showNotification("Verification failed. Please try again.");
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Initiate Instant Secure Verification</span>
                  </button>
                </div>
              )}
              
              <div className="text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-850/60">
                SECURE ENVELOPE GATEWAY • SHA-256 HANDSHAKE
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* CHAT MESSAGES PANEL */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Custom Protected Space Decorative Banner & Toolkit */}
              {activeChannelId === 'women-girls' && (
                <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-pink-950/40 via-rose-950/20 to-slate-900 border border-pink-500/20 space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/10 blur-2xl rounded-full" />
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌸</span>
                    <div>
                      <h2 className="text-sm font-black text-rose-300 tracking-tight">SCUT Women & Girls Protected Space</h2>
                      <p className="text-[10px] text-slate-400">Exclusive design featuring dedicated health & wellness tracking, safe circles, and emergency resources.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {/* Wellness Tracker & Check-in */}
                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-pink-500/10 space-y-2">
                      <span className="text-[9px] font-bold text-rose-300 uppercase block tracking-wider">🌸 Daily Mood Check-In</span>
                      {loggedMood ? (
                        <div className="text-xs text-pink-400 font-medium">
                          Logged mood today: <span className="font-bold">{loggedMood}</span>
                          <button onClick={() => setLoggedMood(null)} className="text-[8px] text-slate-500 hover:text-slate-300 ml-2 underline">Change</button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 pt-1">
                          {['😊', '🥰', '😴', '💪', '😔'].map(emo => (
                            <button
                              key={emo}
                              onClick={async () => {
                                setLoggedMood(emo);
                                showNotification(`Wellness Logged: Feel free to share in the space!`);
                                try {
                                  await addDoc(collection(db, 'community_channels', 'women-girls', 'messages'), {
                                    senderId: auth.currentUser?.uid,
                                    senderName: user?.name || 'SCUT Member',
                                    senderAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser?.uid}`,
                                    content: `Logged a wellness status today: ${emo}. Everything is secure and physical safety is verified.`,
                                    timestamp: serverTimestamp()
                                  });
                                } catch (e) {
                                  console.warn(e);
                                }
                              }}
                              className="text-base p-1.5 bg-slate-900 hover:bg-rose-500/15 rounded-lg border border-slate-800 hover:border-pink-500/25 transition-all cursor-pointer"
                            >
                              {emo}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dedicated Beauty/Fashion and Marketplace categories */}
                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-pink-500/10 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-rose-300 uppercase block tracking-wider">🛍️ Exclusive Trade Categories</span>
                        <p className="text-[9px] text-slate-400 leading-tight">Fast-track filters for Beauty, Fashion & Female Advocacy listings.</p>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        <button
                          onClick={() => {
                            showNotification("Opening marketplace with Beauty & Fashion filters applied!");
                          }}
                          className="px-2 py-1 bg-rose-500/10 text-[9px] font-bold text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                          Beauty & Fashion
                        </button>
                        <button
                          onClick={() => showNotification("Opening marketplace with local support services!")}
                          className="px-2 py-1 bg-pink-500/10 text-[9px] font-bold text-pink-400 rounded-lg border border-pink-500/20 hover:bg-pink-500/20 transition-all cursor-pointer"
                        >
                          Local Services
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Safety Resources Toolbar */}
                  <div className="p-3 bg-rose-950/20 rounded-2xl border border-rose-500/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-rose-200 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                        <span>SPACE PROTECTION GATEWAY & SOS HELP</span>
                      </span>
                      <span className="text-[8px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase">24/7 Shield</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          const nextSos = !sosActive;
                          setSosActive(nextSos);
                          if (nextSos) {
                            showNotification("🚨 SOS SIGNAL DEPLOYED! SCUT emergency escorts, volunteers, and dispatch have been notified with encrypted location metadata.");
                            onAddLog('SOS DISTRESS DEPLOYED', 'User activated emergency response protocols in protected space', 'security');
                          } else {
                            showNotification("🚨 SOS protocol deactivated. Safe status restored.");
                          }
                        }}
                        className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border ${sosActive ? 'bg-red-500 text-white border-red-600 animate-bounce' : 'bg-rose-500/15 text-rose-400 border-rose-500/20 hover:bg-rose-500/30'}`}
                      >
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>{sosActive ? "DEACTIVATE SOS" : "TRIGGER SOS ALARM"}</span>
                      </button>
                      <button
                        onClick={() => showNotification("📍 Nearby Safe physical zones retrieved. Coordinates loaded in memory.")}
                        className="py-2 bg-slate-900/60 hover:bg-rose-500/10 text-[10px] text-rose-300 border border-pink-500/10 hover:border-pink-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        📍 Safe Physical Zones
                      </button>
                      <button
                        onClick={() => showNotification("📞 Free secure line established with Crisis & Safety advocates.")}
                        className="py-2 bg-slate-900/60 hover:bg-rose-500/10 text-[10px] text-rose-300 border border-pink-500/10 hover:border-pink-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        📞 Emergency Support
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeChannelId === 'men-boys' && (
                <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-cyan-950/20 to-slate-900 border border-indigo-500/20 space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full" />
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h2 className="text-sm font-black text-indigo-300 tracking-tight">SCUT Men & Boys Protected Space</h2>
                      <p className="text-[10px] text-slate-400">Exclusive area for sports scheduling, gaming tournaments, fitness tracking, and tech boards.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {/* Fitness Tracker Streak */}
                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-indigo-500/10 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-300 uppercase block tracking-wider">🏋️ Fitness Activity Logger</span>
                        <div className="text-xs text-indigo-200 mt-1 flex items-center gap-2">
                          <span className="text-lg">🔥</span>
                          <span>Daily Workout Streak: <strong className="text-indigo-400">{workoutStreak} Days</strong></span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setWorkoutStreak(prev => prev + 1);
                          showNotification("🎉 Daily workout activity logged! Keep crushing the limits.");
                        }}
                        className="mt-1 w-full py-1.5 bg-indigo-500/15 border border-indigo-500/25 hover:bg-indigo-500/25 text-indigo-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Log Today's Workout (+1 Day)
                      </button>
                    </div>

                    {/* Football / Meetups Event Coordinator */}
                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-indigo-500/10 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-300 uppercase block tracking-wider">⚽ Local Football Match</span>
                        <p className="text-[10px] text-slate-400 leading-tight">Weekly casual pitch game. Current players joined: <strong className="text-indigo-400">{footballCount}</strong></p>
                      </div>
                      <button
                        onClick={async () => {
                          const nextJoined = !footballJoined;
                          setFootballJoined(nextJoined);
                          setFootballCount(prev => nextJoined ? prev + 1 : prev - 1);
                          showNotification(nextJoined ? "⚽ You have joined the match roster! Map sent." : "⚽ Left the match roster.");
                          
                          try {
                            await addDoc(collection(db, 'community_channels', 'men-boys', 'messages'), {
                              senderId: auth.currentUser?.uid,
                              senderName: user?.name || 'SCUT Member',
                              senderAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser?.uid}`,
                              content: nextJoined ? `⚽ Signed up for the weekly community football match roster!` : `⚽ Left the football match roster.`,
                              timestamp: serverTimestamp()
                            });
                          } catch (e) {
                            console.warn(e);
                          }
                        }}
                        className={`w-full py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer border ${footballJoined ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/25'}`}
                      >
                        {footballJoined ? "Joined ✓" : "RSVP: Join Weekly Match"}
                      </button>
                    </div>
                  </div>

                  {/* Tech/Gaming boards and Trade shortcuts */}
                  <div className="p-3 bg-indigo-950/20 rounded-2xl border border-indigo-500/20 space-y-1.5">
                    <span className="text-[9px] font-bold text-indigo-200 uppercase block tracking-wider">🎮 Ecosystem Trade Channels</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => showNotification("Opening marketplace with Sports & Gaming categories applied!")}
                        className="py-1.5 bg-slate-900 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/25 text-[9px] text-indigo-300 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        Sports & Gym Gears
                      </button>
                      <button
                        onClick={() => showNotification("Opening marketplace with Auto & tech sections applied!")}
                        className="py-1.5 bg-slate-900 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/25 text-[9px] text-indigo-300 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        Cars & Technology
                      </button>
                      <button
                        onClick={() => showNotification("Opening gaming tournament calendar!")}
                        className="py-1.5 bg-slate-900 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/25 text-[9px] text-indigo-300 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        Gaming Tournaments
                      </button>
                    </div>
                  </div>
                </div>
              )}
          
          {messages.map((msg, idx) => {
            const isMe = user && msg.senderId === auth.currentUser?.uid;
            
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <img src={msg.senderAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderId}`} alt="" className="h-8 w-8 rounded-full border border-slate-800 bg-slate-900 shrink-0 self-start mt-0.5" />
                
                {/* Body package */}
                <div className="space-y-1 flex-1 min-w-0">
                  
                  {/* Sender title */}
                  <div className={`flex items-baseline gap-2 ${isMe ? 'justify-end' : ''}`}>
                    <span className="text-xs font-bold text-slate-200">{msg.senderName}</span>
                    {msg.senderTier && msg.senderTier !== 'free' && (
                      <span className="text-[8px] font-mono font-black text-cyan-400 uppercase bg-cyan-500/10 px-1 rounded">PRO</span>
                    )}
                    <span className="text-[9px] font-mono text-slate-500">
                      {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                    </span>
                  </div>

                  {/* Message bubble */}
                  <div className={`group relative rounded-2xl p-3 border ${isMe ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-100 rounded-tr-none' : 'bg-slate-900/40 border-slate-850/80 text-slate-200 rounded-tl-none'}`}>
                    
                    {/* Reply Context Render */}
                    {msg.replyTo && (
                      <div className="mb-2 p-2 rounded bg-slate-950/60 border-l-2 border-cyan-500 text-[10px] text-slate-400">
                        <span className="font-bold text-cyan-400 block">{msg.replyTo.senderName}</span>
                        <p className="italic">"{msg.replyTo.content}"</p>
                      </div>
                    )}

                    {/* Content */}
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Attachments rendering */}
                    {msg.attachments && msg.attachments.map((att, attIdx) => (
                      <div key={attIdx} className="mt-2 pt-2 border-t border-slate-850/60 space-y-1.5">
                        {att.type === 'image' ? (
                          <div>
                            <div className="rounded-xl overflow-hidden max-w-sm border border-slate-800">
                              <img src={att.url} alt="" className="max-h-60 w-full object-cover" />
                            </div>
                            {!isMe && (
                              <button
                                onClick={() => handleReportAttachment(msg, att.name || 'Image file', att.url)}
                                className="mt-1 text-[9px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Report image for community violations"
                              >
                                <AlertTriangle className="h-3 w-3 text-slate-500 hover:text-red-400" />
                                <span>Report Image</span>
                              </button>
                            )}
                          </div>
                        ) : att.type === 'voice' ? (
                          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-850 max-w-sm">
                            <button className="h-7 w-7 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shrink-0">
                              <Play className="h-4.5 w-4.5 fill-current" />
                            </button>
                            <div className="flex-1">
                              <span className="text-[10px] font-bold text-slate-300 block">Voice Memo</span>
                              {/* Waves dummy visual */}
                              <div className="flex items-end gap-0.5 h-4 mt-1">
                                {[30, 80, 50, 90, 40, 70, 20, 60, 40, 80].map((h, hIdx) => (
                                  <span key={hIdx} className="w-1 bg-cyan-500/60 rounded-full" style={{ height: `${h}%` }} />
                                ))}
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 shrink-0">{att.size}</span>
                          </div>
                        ) : (
                          <div>
                            <a 
                              href={att.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-850 max-w-sm hover:border-cyan-500/40 transition-colors"
                            >
                              <Paperclip className="h-4 w-4 text-cyan-400 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-slate-300 block truncate">{att.name}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{att.size || 'Attachment'}</span>
                              </div>
                              <Download className="h-4 w-4 text-slate-500 shrink-0" />
                            </a>
                            {!isMe && (
                              <button
                                onClick={() => handleReportAttachment(msg, att.name || 'File', att.url)}
                                className="mt-1 text-[9px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Report file for community violations"
                              >
                                <AlertTriangle className="h-3 w-3 text-slate-500 hover:text-red-400" />
                                <span>Report File</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Reactions Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2.5">
                        {msg.reactions.map((react, rIdx) => {
                          const activeReact = user && react.users.includes(auth.currentUser?.uid || '');
                          return (
                            <button
                              key={rIdx}
                              onClick={() => handleAddReaction(msg.id, react.emoji)}
                              className={`px-2 py-0.5 rounded-full border text-[10px] flex items-center gap-1 transition-all ${activeReact ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200'}`}
                            >
                              <span>{react.emoji}</span>
                              <span className="font-mono font-bold">{react.users.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* INTERACTIVE ACTIONS HOVER MENU */}
                    <div className={`opacity-0 group-hover:opacity-100 absolute -top-3.5 z-10 flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md transition-all ${isMe ? 'right-2' : 'left-2'}`}>
                      {/* Emoji Quick Picker */}
                      {['👍', '❤️', '🔥', '💡'].map(emo => (
                        <button
                          key={emo}
                          onClick={() => handleAddReaction(msg.id, emo)}
                          className="p-1 text-xs hover:scale-115 transition-transform"
                        >
                          {emo}
                        </button>
                      ))}

                      <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

                      <button
                        onClick={() => setReplyTarget(msg)}
                        className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                        title="Reply to message"
                      >
                        <Reply className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => { setForwardTarget(msg); setShowForwardModal(true); }}
                        className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                        title="Forward message"
                      >
                        <Forward className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => handleTogglePinMessage(msg)}
                        className={`p-1 hover:text-amber-400 transition-colors ${msg.isPinned ? 'text-amber-400' : 'text-slate-400'}`}
                        title="Pin/Unpin message"
                      >
                        <Pin className="h-3 w-3" />
                      </button>

                      {!isMe && (
                        <button
                          onClick={() => handleReportMessage(msg)}
                          className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                          title="Report message"
                        >
                          <ShieldAlert className="h-3 w-3" />
                        </button>
                      )}

                      {isMe && !msg.isDeleted && (
                        <>
                          <button
                            onClick={() => { setEditingMessageId(msg.id); setEditContent(msg.content); }}
                            className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                            title="Edit message"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>

                  </div>

                  {/* Message status logs (Double check receipts & edited) */}
                  <div className={`flex items-center gap-1.5 text-[9px] text-slate-500 font-mono ${isMe ? 'justify-end' : ''}`}>
                    {msg.isEdited && <span>(edited)</span>}
                    {isMe && (
                      <span className="flex items-center gap-0.5">
                        <span>delivered</span>
                        <CheckCheck className="h-3 w-3 text-cyan-400" />
                      </span>
                    )}
                  </div>

                </div>

              </motion.div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT TRANSMISSION PANEL */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md relative">
          
          {/* Reply Context Panel Header overlay */}
          {replyTarget && (
            <div className="absolute -top-12 inset-x-0 bg-cyan-950/40 border-y border-cyan-500/20 px-4 py-2 flex items-center justify-between text-xs text-cyan-400">
              <div className="flex items-center gap-2 truncate">
                <Reply className="h-3.5 w-3.5 shrink-0" />
                <span className="font-semibold">Replying to {replyTarget.senderName}:</span>
                <span className="truncate italic">"{replyTarget.content}"</span>
              </div>
              <button onClick={() => setReplyTarget(null)} className="p-0.5 rounded hover:bg-slate-900 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Local files/images upload feedback row */}
          {attachment && (
            <div className="mb-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 max-w-sm">
              <div className="flex items-center gap-2 min-w-0">
                {attachment.type === 'image' ? (
                  <img src={attachment.url} alt="" className="h-10 w-10 object-cover rounded-lg border border-slate-800 shrink-0" />
                ) : (
                  <Paperclip className="h-5 w-5 text-cyan-400 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-200 block truncate">{attachment.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{attachment.size}</span>
                </div>
              </div>
              <button onClick={() => setAttachment(null)} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Direct message inline editing */}
          {editingMessageId && (
            <div className="mb-3 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 block uppercase">Editing Message</span>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
                rows={2}
              />
              <div className="flex justify-end gap-1.5">
                <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 bg-slate-800 text-xs rounded-lg hover:bg-slate-750 transition-colors">Cancel</button>
                <button onClick={() => handleEditMessage(editingMessageId)} className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:opacity-95 transition-colors">Save Change</button>
              </div>
            </div>
          )}

          {/* Main transmission block */}
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            
            {/* Attachment inputs */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2.5 rounded-xl border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                title="Share Image"
              >
                <ImageIcon className="h-4.5 w-4.5" />
              </button>
              <input type="file" ref={imageInputRef} onChange={e => handleFileUpload(e, 'image')} accept="image/*" className="hidden" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                title="Share File"
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={e => handleFileUpload(e, 'file')} className="hidden" />
            </div>

            {/* Input field */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={isRecording ? "Recording voice package..." : "Transmit encrypted signal..."}
                value={inputMessage}
                disabled={isRecording}
                onChange={e => setInputMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl py-3 pl-4 pr-12 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
              />

              {/* Voice recording trigger within input */}
              <div className="absolute right-2.5 top-1.5 flex items-center gap-1">
                {isRecording ? (
                  <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-lg text-[10px] font-bold font-mono">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span>{recordingSeconds}s</span>
                    <button type="button" onClick={stopRecording} className="text-white hover:text-red-200 ml-1">Stop</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-1.5 rounded-lg hover:bg-slate-850 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Transmit Voice Package"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="p-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center justify-center shrink-0"
              title="Transmit Package"
            >
              <Send className="h-4 w-4" />
            </button>

          </form>

        </div>
        </>
      )}

      </div>

      {/* FORWARD MESSAGE MODAL OVERLAY */}
      <AnimatePresence>
        {showForwardModal && forwardTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Forward className="h-4 w-4 text-cyan-400" /> Forward Message
                </h3>
                <button onClick={() => { setShowForwardModal(false); setForwardTarget(null); }} className="text-slate-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-400 italic">
                "{forwardTarget.content}"
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Choose Destination Channel</span>
                <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                  {channels.map(chan => (
                    <button
                      key={chan.id}
                      onClick={() => handleForwardMessage(chan.id)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-850/40 text-xs text-slate-300 flex items-center gap-2 transition-colors"
                    >
                      <span>{chan.icon}</span>
                      <span>#{chan.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GROUP CHAT CREATION MODAL */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-cyan-400" /> Create Private Group Chat
                </h3>
                <button 
                  onClick={() => { setShowCreateGroupModal(false); setNewGroupName(''); setSelectedGroupUsers([]); }} 
                  className="text-slate-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Group Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Security Cohort"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Participants</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin border border-slate-850 rounded-xl p-2 bg-slate-950/50">
                    {registeredUsers.map(userItem => {
                      const isSelected = selectedGroupUsers.includes(userItem.id);
                      return (
                        <button
                          key={userItem.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedGroupUsers(prev => prev.filter(id => id !== userItem.id));
                            } else {
                              setSelectedGroupUsers(prev => [...prev, userItem.id]);
                            }
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-850/30 flex items-center justify-between transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={userItem.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${userItem.id}`} alt="" className="h-7 w-7 rounded-full border border-slate-800" />
                            <div className="min-w-0 flex-1 text-left">
                              <span className="text-xs truncate block text-slate-300 font-medium">{userItem.name}</span>
                              <span className="text-[9px] text-slate-500 truncate block font-light mt-0.5">{userItem.isOnline ? 'online now' : 'offline'}</span>
                            </div>
                          </div>
                          <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-800'}`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                    {registeredUsers.length === 0 && (
                      <span className="text-[10px] text-slate-600 p-2 block italic">No other users found</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCreateGroupChat}
                  disabled={!newGroupName.trim() || selectedGroupUsers.length === 0}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Create Group Chat
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateGroupModal(false); setNewGroupName(''); setSelectedGroupUsers([]); }}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURE P2P VOICE/VIDEO CALL CONTROL PANEL */}
      <AnimatePresence>
        {callState !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-lg p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 space-y-6 text-center relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 h-48 w-48 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
              
              {/* Call Status Header */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md inline-block">
                  {isCallVideo ? 'Secure Cryptographic Video Session' : 'Secure Cryptographic Voice Session'}
                </span>
                <p className="text-xs text-slate-500 font-mono">NODE ID: {auth.currentUser?.uid.substring(0, 8)}... → PEER</p>
              </div>

              {/* Caller Avatar with Pulse Ring */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
                  <div className="absolute -inset-4 rounded-full bg-cyan-500/5 animate-pulse" />
                  
                  <img 
                    src={callerDetails.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${callerDetails.name}`} 
                    alt="" 
                    className="h-28 w-28 rounded-full border-2 border-cyan-500 bg-slate-950 relative z-10" 
                  />
                  
                  {isCallVideo && !isCameraOff && callState === 'connected' && (
                    <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-lg border border-cyan-500/30 overflow-hidden z-20 bg-slate-950">
                      {/* Self preview mini-canvas/avatar */}
                      <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mt-6">{callerDetails.name}</h3>
                
                {callState === 'calling' && (
                  <p className="text-xs text-cyan-400 animate-pulse mt-2 flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Calling Secure peer nodes...
                  </p>
                )}
                
                {callState === 'connected' && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-green-400 font-semibold flex items-center justify-center gap-1.5">
                      <Radio className="h-4 w-4 animate-pulse" /> SECURE TUNNEL ACTIVE
                    </p>
                    <p className="text-lg font-mono font-bold text-white tracking-wider">
                      {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
              </div>

              {/* Simulated Video Canvas rendering when video is on and connected */}
              {isCallVideo && !isCameraOff && callState === 'connected' && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 h-40 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80 z-10" />
                  
                  {/* Cybernetic code grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
                  
                  {/* Floating visual representation */}
                  <div className="text-center z-20 space-y-2">
                    <Radio className="h-8 w-8 text-cyan-400 mx-auto animate-pulse" />
                    <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest block font-bold">Cryptographic Video Stream Matrix</span>
                    <span className="text-[9px] text-slate-500 font-mono block">FPS: 60 • BPS: 2.4MB/s • AES-GCM 256bit</span>
                  </div>
                </div>
              )}

              {/* Call Controls Bar */}
              <div className="flex items-center justify-center gap-3 pt-4">
                
                {/* Mute Mic */}
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-full border transition-all cursor-pointer ${isMuted ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25' : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-300'}`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>

                {/* Toggle Camera */}
                {isCallVideo && (
                  <button
                    type="button"
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    className={`p-3.5 rounded-full border transition-all cursor-pointer ${isCameraOff ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25' : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-300'}`}
                    title={isCameraOff ? 'Start Camera' : 'Stop Camera'}
                  >
                    {isCameraOff ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                )}

                {/* Share Screen */}
                <button
                  type="button"
                  onClick={() => {
                    setIsScreenSharing(!isScreenSharing);
                    showNotification(isScreenSharing ? "Screen sharing ended." : "Screen sharing stream active.");
                  }}
                  className={`p-3.5 rounded-full border transition-all cursor-pointer ${isScreenSharing ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-300'}`}
                  title="Share Screen"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </button>

                {/* End Call Button */}
                <button
                  type="button"
                  onClick={() => setCallState('idle')}
                  className="p-3.5 rounded-full bg-red-500 text-slate-950 font-extrabold hover:bg-red-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  title="End Call Session"
                >
                  <Phone className="h-5 w-5 rotate-135" />
                </button>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Global Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <MessageSquare className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Community Guidelines Modal */}
      <AnimatePresence>
        {showGuidelines && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/[0.03] rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Shield className="h-6 w-6 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="text-base font-black text-white">SCUT Spatial Security & Guidelines</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Universal community protocols for digital & physical safety</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs leading-relaxed text-slate-300 font-sans scrollbar-thin">
                <p>Welcome, Pioneer, to the **SCUT Community**. In order to preserve a safe, respectful, and highly cooperative spatial network, all members must commit to our safety protocols before transmitting messages, reviews, or listing items on the marketplace.</p>
                
                <div className="space-y-3.5 pt-2">
                  <div className="flex gap-2.5 items-start">
                    <span className="text-sm">🛡️</span>
                    <div>
                      <strong className="text-slate-100 block font-bold">1. Zero Tolerance for Abusive Content</strong>
                      <span className="text-slate-400 text-[11px] block mt-0.5">Hate speech, insults, severe bullying, harassment, sexual exploitation, threats of physical harm, and spam/malicious payloads are strictly prohibited.</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="text-sm">🤖</span>
                    <div>
                      <strong className="text-slate-100 block font-bold">2. Real-Time AI Content Moderation</strong>
                      <span className="text-slate-400 text-[11px] block mt-0.5">All transmissions are screened by SCUT Sentinel AI. Flags are instantly blocked, logged, and repeat infractions result in temporary mutes or permanent hardware proxy bans.</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="text-sm">🔒</span>
                    <div>
                      <strong className="text-slate-100 block font-bold">3. Role-Based Protected Community Safe Spaces</strong>
                      <span className="text-slate-400 text-[11px] block mt-0.5">Specialized circles such as `#women-girls` and `#men-boys` have specific access barriers and verification gates to ensure complete privacy, mutual empowerment, and mental health advocacy.</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="text-sm">🛍️</span>
                    <div>
                      <strong className="text-slate-100 block font-bold">4. Trustworthy Marketplace Trading</strong>
                      <span className="text-slate-400 text-[11px] block mt-0.5">Fraudulent or dangerous item listings, false profiles, and abusive reviews are prohibited. Violators will have their SCUT Pay balances frozen and trading license permanently revoked.</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 pt-4 border-t border-slate-850">
                  By clicking "I Accept Guidelines", you authorize the cryptographic enforcement of these regulations and swear to uphold physical and digital security for all members of the SCUT network.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    localStorage.setItem('scut_guidelines_accepted', 'true');
                    setShowGuidelines(false);
                    showNotification("🚀 Guidelines accepted. Your safe spatial proxy is activated!");
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>I ACCEPT AND UNDERSTAND THE GUIDELINES</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
